import { Input, ScrollView, Text, View } from '@tarojs/components'
import {
  eventCenter,
  getSystemInfoSync,
  hideKeyboard,
  navigateBack,
  nextTick,
  pxTransform,
  useRouter,
  showToast as TaroShowToast,
} from '@tarojs/taro'
import { useGetState } from 'ahooks'
import _ from 'lodash'
import { T } from 'ramda'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { checkDirectApplyEnableApi, clearRCUnreadCountApi, saveWechatApi } from '@/apis/message'
import RefuelPackagePopup from '@/components/Popup/refuelPackagePopup'
import WarmTipsPopup from '@/components/Popup/warmTipsPopup'
import { DEFAULT_MALE_AVATAR, DEFAULT_FEMALE_AVATAR, OPEN_ADD_WECHAT_MODAL } from '@/config'
import { IChatContext, IChatExchangeStatus, IMCurrentMessageEvent } from '@/def/message'
import { defaultUserInfo, SexType } from '@/def/user'
import { useWarmTipsPopupRef } from '@/hooks/custom/usePopup'
import useShowModal from '@/hooks/custom/useShowModal'
import useToast from '@/hooks/custom/useToast'
import { useCurrentUserInfo, useUpdateCurrentUserInfo } from '@/hooks/custom/useUser'
import useChatInfo, {
  useOpenActivityPopup,
  useRefreshUnreadMessageCount,
  useTryShowSubscribe,
} from '@/hooks/message'
import MainLayout from '@/layout/MainLayout'
import { modalEventKey } from '@/layout/components/Modal'
import { isSchoolVersion, refreshUserInfo } from '@/services/AccountService'
import { entryChatting, leaveChatting } from '@/services/IMService'
import { checkWechat } from '@/services/ValidateService'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import ChatNavigation from '../components/ChatNavigation'
import CopyWechatPopup, { ICopyWechatPopupRef } from '../components/CopyWechatPopup'
import { IExchangeWechatRequestProps } from '../components/ExchangeWechatRequest'
import GreetingWordTipsPopup from '../components/GreetingWordTipsPopup'
import InputBar from '../components/InputBar'
import MessageItem from '../components/MessageItem'
import SendProfileFileConfirmPopup, {
  ISendProfileFileConfirmPopupRef,
} from '../components/SendProfileFileConfirmPopup'
import { closeAllPopupBar } from '../components/TextMessage/PopupBar'
import ChatContext from './context'

import './index.scss'

const statusBarHeight = getSystemInfoSync().statusBarHeight
const pageBottomHeight =
  getSystemInfoSync().screenHeight -
  (getSystemInfoSync().safeArea?.bottom ?? getSystemInfoSync().screenHeight)

const ChatPage: React.FC = () => {
  const showToast = useToast()
  const showModal = useShowModal({ mode: 'thenCatch' })

  const router = useRouter()
  const targetId = decodeURIComponent(router.params.targetId!)
  const isSendValue = decodeURIComponent(router.params.isSend!)
  const isActive = Number(router.params.isActive) ? 1 : 0
  // 是否直接投递简历
  const isSend = isSendValue === 'undefined' ? false : JSON.parse(isSendValue)

  const {
    fetchHistoryMessages,
    unshiftHistoryMessages,
    chatStatus,
    messageList,
    canSendMessage,
    sendTextMessage,
    sendExchangeRequest,
    isNoMore,
    confirmExchangeRequest,
    sendResumeDirectly,
    confirmAttachmentRequest,
  } = useChatInfo(targetId)
  const refreshUnreadCount = useRefreshUnreadMessageCount()

  const tryShowSubscribe = useTryShowSubscribe()

  const userInfo = useCurrentUserInfo() || defaultUserInfo
  const refreshCurrentUser = useUpdateCurrentUserInfo()
  const selfAvatar = useMemo(() => {
    const profileAvatar = userInfo.profile?.avatar
    const profileSex = userInfo.profile?.sex
    return profileAvatar
      ? profileAvatar
      : profileSex === SexType.girl
      ? DEFAULT_FEMALE_AVATAR
      : DEFAULT_MALE_AVATAR
  }, [userInfo])

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [prepareLoadHistory, setPrepareLoadHistory] = useState<boolean>(false)
  const [scrollTop, setScrollTop] = useState<number>(99999)
  const [inputBarHeight, setInputBarHeight] = useState<number>(120 / 2 + pageBottomHeight)
  const [scrollWithAnimation, setScrollWithAnimation] = useState<boolean>(false)
  const [scrollY, setScrollY] = useState<boolean>(true)

  const canDirectSendResume = chatStatus.is_direct_apply,
    isProfileApplied = chatStatus.is_profile_applied,
    isSchool = isSchoolVersion()
  const [visible, setVisible] = useState<boolean>(false)
  const [wechat, setWechat, getWechat] = useGetState<string>('')
  const sendProfileFileConfirmPopupRef = useRef<ISendProfileFileConfirmPopupRef>(null as any)
  const copyWechatPopupRef = useRef<ICopyWechatPopupRef>(null as any)
  const warmTipsPopupRef = useWarmTipsPopupRef()
  const { openActivityPopup } = useOpenActivityPopup()

  useEffect(() => {
    setVisible(!isProfileApplied)
  }, [isProfileApplied])

  const scrollToBottom = useMemo(
    () => _.debounce(() => void setScrollTop(t => (t === 99999 ? 99998 : 99999)), 250),
    []
  )

  useEffect(
    () => {
      eventCenter.on(IMCurrentMessageEvent, scrollToBottom)
      setTimeout(() => void setScrollWithAnimation(true), 100)
      entryChatting(chatStatus.hr_id, { jobId: chatStatus.jd_id, targetId })

      return () => {
        eventCenter.off(IMCurrentMessageEvent)
        leaveChatting(chatStatus.hr_id)
        clearRCUnreadCountApi(targetId).then(refreshUnreadCount)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // 点击返回键，先收起键盘再返回，否则会导致下次不触发 textarea 的 onKeyboardHeightChange
  const backClickHandler = () => {
    hideKeyboard()
    setTimeout(() => void navigateBack(), 250)
  }

  // 点击发送消息按钮
  const sendTextHandler = (text: string) => {
    if (!canSendMessage) {
      showToast({ content: '对方未回复前，您只能发送10条消息' })
      return false
    }

    sendTextMessage(text).then(() => void scrollToBottom())

    // 尝试弹出小程序订阅提示
    tryShowSubscribe()

    return true
  }

  // 输入区域打开
  const inputOpenHandler = () => {
    closeAllPopupBar()
    scrollToBottom()
  }

  // 消息区域滚动
  const scrollHandler = e => {
    closeAllPopupBar()
    if (!isNoMore && e.detail.scrollTop < 220 && e.detail.deltaY > 0) {
      setPrepareLoadHistory(true)
    }
  }

  useEffect(() => {
    if (!prepareLoadHistory || isNoMore || isLoading) {
      return
    }

    setIsLoading(true)
    fetchHistoryMessages().then(res => {
      setScrollY(false)
      unshiftHistoryMessages(res)
      setIsLoading(false)
      setPrepareLoadHistory(false)
      nextTick(() => {
        setScrollY(true)
      })
    })
  }, [fetchHistoryMessages, isLoading, isNoMore, prepareLoadHistory, unshiftHistoryMessages])

  // 点击交换电话
  const exchangePhoneHandler = useCallback(
    async () => {
      hideKeyboard()
      return showModal({ title: '提示', content: '申请与对方交换手机号码？' })
        .then(() => {
          sendExchangeRequest('phone').catch(() => showToast({ content: '网络异常，请重试' }))
          scrollToBottom()
          return true
        })
        .catch(() => false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sendExchangeRequest, showModal]
  )

  const confirmHandler = useCallback(
    (e, props?: IExchangeWechatRequestProps) => {
      if (!getWechat()) {
        TaroShowToast({ title: `请先输入你的微信号`, icon: 'none' })
        return
      }
      if (checkWechat(getWechat())) {
        saveWechatApi(getWechat()).then(() => {
          sendDataRangersEventWithUrl('SaveWechat', {
            way_name: '添加微信号',
            user_role: isSchool ? '学生' : '职场人',
          })
          refreshCurrentUser()
          TaroShowToast({ title: `微信号保存成功`, icon: 'none' })
          eventCenter.trigger(router.path + modalEventKey, {}, 'close')
          if (props) submitExchangeRequest(props, true)
          else ShowExchangeWechatSOP()
        })
      } else {
        TaroShowToast({ title: `微信号不支持中文汉字`, icon: 'none' })
      }
    },
    [TaroShowToast]
  )

  const renderContent = useMemo(() => {
    return (
      <Input
        type="text"
        value={wechat}
        placeholder="请输入你的微信号"
        focus
        maxlength={20}
        cursorSpacing={100}
        onInput={e => setWechat(e.detail.value.trim())}
        onConfirm={confirmHandler}
        className="chat__wechat-input"
        placeholderClass="chat__wechat-input--placeholeder"
      />
    )
  }, [wechat, confirmHandler])

  const ShowExchangeWechatSOP = () => {
    sendExchangeRequest('wechat').catch(() => showToast({ content: '网络异常，请重试' }))
    scrollToBottom()
  }
  // 点击交换微信
  const exchangeWechatHandler = useCallback(
    async () => {
      hideKeyboard()
      // 没有微信号弹出添加微信号
      if (!userInfo?.wechat) {
        return eventCenter.trigger(OPEN_ADD_WECHAT_MODAL)
      } else {
        if (chatStatus.wechat_status === IChatExchangeStatus.AGREE) {
          copyWechatPopupRef.current?.show()
          return true
        } else {
          ShowExchangeWechatSOP()
          return true
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sendExchangeRequest, showModal, wechat]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sendDetail = () => {
    if (canDirectSendResume) {
      checkDirectApplyEnableApi(chatStatus.chat_id).then(isEnable => {
        if (!isEnable) {
          showToast({ content: '您近期已投递过该职位，请耐心等待HR处理' })
          return
        }

        sendResumeDirectly().catch(() => void showToast({ content: '网络异常，请重试' }))
        scrollToBottom()
      })
    } else {
      sendExchangeRequest('profile').catch(() => void showToast({ content: '网络异常，请重试' }))
      scrollToBottom()
    }
  }

  // 点击投递
  const sendResumeHandler = useCallback(
    async () => {
      hideKeyboard()
      sendDataRangersEventWithUrl('DeliverClick', {
        from_user_id: String(chatStatus?.user_id),
        to_user_id: String(chatStatus?.hr_id),
        jd_id: String(chatStatus?.jd_id),
        is_preferred: chatStatus?.is_priority_jd,
        mp_version: isSchool ? '校园版' : '社招版',
      })

      // 旧版区分直投和非直投，后续全部为直投，不存在普通投递
      checkDirectApplyEnableApi(chatStatus.chat_id).then(isEnable => {
        if (!isEnable) {
          showToast({ content: '您近期已投递过该职位，请耐心等待HR处理' })
          return
        }

        sendResumeDirectly(isActive).catch(() => void showToast({ content: '网络异常，请重试' }))
        scrollToBottom()
      })

      return true
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sendExchangeRequest, showModal, isActive]
  )

  // 点击发送简历附件
  const sendProfileFileHandler = async (isAgree?: boolean) => {
    hideKeyboard()

    if (!isAgree) {
      confirmAttachmentRequest(false)

      return false
    }

    const confirmIsAgree = await sendProfileFileConfirmPopupRef.current!.show()
    if (confirmIsAgree) {
      confirmAttachmentRequest(true)

      return true
    } else {
      return false
    }
  }

  useEffect(() => {
    if (isSend) {
      sendDetail()
    }
  }, [isSend, sendDetail])

  useEffect(() => {
    const callback = (props?: IExchangeWechatRequestProps) => {
      sendDataRangersEventWithUrl('EventPopupExpose', {
        event_name: '添加微信号',
        type: '弹窗',
      })
      showModal({
        title: '添加微信号',
        description: '不支持中文汉字',
        content: renderContent,
        cancelText: '',
        closeOnClickOverlay: false,
        onConfirm: () => {
          confirmHandler(_, props)
          sendDataRangersEventWithUrl('EventPopupClick', {
            event_name: '添加微信号',
            type: '弹窗',
          })
        },
      }).catch(() => {
        setWechat('')
        return false
      })
    }
    eventCenter.on(OPEN_ADD_WECHAT_MODAL, callback)

    return () => {
      eventCenter.off(OPEN_ADD_WECHAT_MODAL, callback)
    }
  }, [renderContent])

  const submitExchangeRequest = useCallback(confirmExchangeRequest, [confirmExchangeRequest])

  const confirmSendProfileFile = useCallback(() => {
    hideKeyboard()

    return sendProfileFileConfirmPopupRef.current!.show()
  }, [])

  const contextValue: IChatContext = {
    ...chatStatus,
    wechat: chatStatus?.wechat || userInfo?.wechat,
    self_avatar: selfAvatar,
    talentPortrait: chatStatus?.talentPortrait,
    onClickExchangePhone: exchangePhoneHandler,
    onClickSendResume: sendResumeHandler,
    onClickSendProfileFile: sendProfileFileHandler,
    onClickExchangeWechat: exchangeWechatHandler,
    confirmSendProfileFile,
    submitExchangeRequest,
    isActive,
    openActivityPopup: () =>
      openActivityPopup(chatStatus.initiator, chatStatus.chat_id)
        .then(refreshUserInfo)
        .catch(err => console.log(err)),
  }

  return (
    <MainLayout className="chat">
      <ChatContext.Provider value={contextValue}>
        <ChatNavigation
          onClickBack={backClickHandler}
          onClose={() => setVisible(false)}
          visible={visible}
        />
        <ScrollView
          className="chat__message"
          style={{
            top: `calc(${statusBarHeight}px + ${pxTransform(
              10 + 90 + 126 + (canDirectSendResume && visible ? 80 : 0)
            )})`,
            bottom: inputBarHeight,
            transition: `bottom 0.25s ease`,
          }}
          onScroll={scrollHandler}
          scrollTop={scrollTop}
          scrollWithAnimation={scrollWithAnimation}
          scrollY={scrollY}
          scrollAnchoring
          fastDeceleration
          enhanced
        >
          <View className="chat__message__content-wrapper" id="chat__message__content-wrapper">
            {isNoMore ? <View className="chat__no-more-tips">仅展示6个月内的聊天记录</View> : null}
            {messageList.map(t => (
              <MessageItem {...t} key={t.messageUId} />
            ))}
          </View>
        </ScrollView>

        <InputBar
          onInputOpen={inputOpenHandler}
          onHeightChange={setInputBarHeight}
          onSendText={sendTextHandler}
        />

        <GreetingWordTipsPopup />
        <SendProfileFileConfirmPopup ref={sendProfileFileConfirmPopupRef} />
        <RefuelPackagePopup />
        <WarmTipsPopup ref={warmTipsPopupRef} />
        <CopyWechatPopup
          ref={copyWechatPopupRef}
          name={chatStatus?.hr_name}
          chat_id={chatStatus.chat_id}
        />
      </ChatContext.Provider>
    </MainLayout>
  )
}

export default ChatPage
