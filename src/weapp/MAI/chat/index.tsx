import { ScrollView, View, Image } from '@tarojs/components'
import {
  eventCenter,
  getSystemInfoSync,
  hideKeyboard,
  navigateBack,
  useRouter,
  showToast as TaroShowToast,
  getCurrentPages,
  showToast,
  onNetworkStatusChange,
  useDidShow,
  useDidHide,
  offNetworkStatusChange,
  getNetworkType,
  showLoading,
  hideLoading,
} from '@tarojs/taro'
import { useGetState, useReactive, useUpdateEffect } from 'ahooks'
import dayjs from 'dayjs'
import _, { cloneDeep, findIndex, head, initial, last, map, omit, reverse, some } from 'lodash'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { MAIChatList, chooseMessage, existsProfile } from '@/apis/MAIchat'
import { OSS_STATIC_HOST } from '@/config'
import {
  MaiInputBarBtnType,
  MaiSourceType,
  MaiSourceTypeData,
  chatListItem,
  fixedText,
} from '@/def/MAI'
import { IMCurrentMessageEvent } from '@/def/message'
import useAlertBeforeUnload from '@/hooks/custom/useAlertBeforeUnload'
import useOnce, { MAIInputTips } from '@/hooks/custom/useOnce'
import useMaiSocket, { senceDataText } from '@/hooks/message/maiSocket'
import MainLayout from '@/layout/MainLayout'
import { sendDataRangersEvent } from '@/utils/dataRangers'
import { closeAllPopupBar } from '@/weapp/message/components/TextMessage/PopupBar'
import OnLineResumePop from '@/weapp/resume/components/OnLineResumePop'

import ChatItem from '../components/ChatItem'
import GreetingNCard from '../components/GreetingNCard'
import InputBar from '../components/InputBar'

import './index.scss'

const dataType = 'YYYY-MM-DD HH:mm:ss'
export interface Message extends chatListItem {
  loading?: boolean
  showBottom?: boolean
  showEdit?: boolean
  netConnected?: boolean
  isApi?: boolean
}

const pageBottomHeight =
  getSystemInfoSync().screenHeight -
  (getSystemInfoSync().safeArea?.bottom ?? getSystemInfoSync().screenHeight)

const ChatRoom: React.FC = () => {
  const router = useRouter()
  const params = JSON.parse(decodeURIComponent(router.params.params!))
  const { sence, work, education } = params
  const [prepareLoadHistory, setPrepareLoadHistory] = useState<boolean>(false)
  const [scrollTop, setScrollTop] = useState<number>(99999)
  const [inputBarHeight, setInputBarHeight] = useState<number>(120 / 2 + pageBottomHeight)
  const [scrollWithAnimation, setScrollWithAnimation] = useState<boolean>(true)
  const [scrollY, setScrollY] = useState<boolean>(true)
  const [uuid, setUuid] = useState<string>('')
  const [extraContentResume, setExtraContentResume] = useState<string>('')
  const [lastUserText, setLastUserText] = useState<string>('')
  const [pageName, setPageName] = useState<string>('')
  const [isFirstConnect, setIsFirstConnect, getIsFirstConnect] = useGetState<boolean>(true)
  const { send, subscribeData, stop, connect, disconnect, connectState, noTextSend } = useMaiSocket(
    {
      sence,
      initData: {
        work,
        education,
      },
    }
  )
  const [inputBarType, setInputBarType] = useState<MaiInputBarBtnType>(MaiInputBarBtnType.Input)
  const isNoMore = false
  const [hasMore, setHasMore] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [netConnected, setNetConnected] = useState<boolean>(true)
  // 展示下方输入框
  const [showInputBar, setShowInputBar] = useState<boolean>(true)

  // input里的toast是否展示
  const [toastOpen, setToastOpen] = React.useState<boolean>(false)
  const { needShow, setCurrentTips } = useOnce(MAIInputTips)

  const messages = useReactive<{ list: Message[] }>({
    list: [],
  })
  const [showResume, setShowResume] = useState<boolean>(false)
  const { enableAlertBeforeUnload, disableAlertBeforeUnload } = useAlertBeforeUnload()

  const [timer, setTimer] = useState<any>(null)
  const [isTimerActive, setIsTimerActive] = useState(false)

  // 是否已经发送过消息
  const [isSendMessage, setIsSendMessage] = useState<boolean>(false)

  const inputRef = useRef<any>(null)

  const robotMessage: Message = {
    uuid: String(messages.list.length + 2),
    loading: true,
    showBottom: false,
    content: '',
    role: 'assistant',
    showEdit: true,
    netConnected: true,
  } as Message

  // 30秒后提示重新连接
  const startTimer = () => {
    setIsTimerActive(true)

    const newTimer = setTimeout(() => {
      setIsTimerActive(false)
      setTimer(null)
      const lastItem = last(messages.list) as Message
      messages.list[messages.list.length - 1] = {
        ...lastItem,
        loading: false,
        netConnected: false,
      }
      scrollToBottom()
    }, 30000)

    setTimer(newTimer)
  }

  const getList = (time: string, isScroll?: boolean) => {
    const data = {
      tCreated: time,
      scene: sence,
    }
    return MAIChatList(data)
      .then(res => {
        const list = map(reverse(res.list), (item, index) => {
          let extraContent = JSON.parse(item?.extraContent)
          // if (extraContent && item.type === MaiSourceType.GUIDANCE_IDENTITY) {
          //   extraContent.buttons.used = true
          // }
          return {
            ...item,
            extraContent: extraContent,
          }
        })

        setHasMore(res.hasMore)

        // 上滑加载是拼接，返回加载是替换
        if (isScroll) {
          messages.list.unshift(...list)
          return
        }
        messages.list = [...list]
        const lastItem = last(list) as Message
        setShowInputBar(MaiSourceTypeData[lastItem?.type]?.showInputBar)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const scrollToBottom = useMemo(
    () =>
      _.debounce(
        () => void setScrollTop(t => (t === 99999 ? 99998 : 99999)),
        scrollWithAnimation ? 400 : 0
      ),
    [scrollWithAnimation]
  )

  const rangersEvent = (type: string) => {
    sendDataRangersEvent('Button_click', {
      page_name: 'M.AI_IM页',
      button_type: type,
    })
  }

  useEffect(
    () => {
      eventCenter.on(IMCurrentMessageEvent, scrollToBottom)
      setTimeout(() => void setScrollWithAnimation(true), 100)

      return () => {
        eventCenter.off(IMCurrentMessageEvent)
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
  const sendTextHandler = (
    text: string,
    extraData?: {
      isRefrash?: boolean
      refrashUuid?: string
      sendType?: string
    }
  ) => {
    clearTimeout(timer)

    if (!extraData?.sendType) {
      setShowInputBar(true)
    }

    if (extraData?.isRefrash) {
      const index = findIndex(messages.list, ['uuid', extraData?.refrashUuid])
      messages.list.splice(index, 1)
    }

    const userMessage: Message = {
      uuid: String(messages.list.length + 1),
      content: text,
      role: 'user',
      netConnected: connectState === false ? connectState : netConnected,
      type: extraData?.sendType || '',
    } as Message
    setLastUserText(text)

    messages.list.push(userMessage)

    setInputBarType(MaiInputBarBtnType.Stop)

    !extraData?.sendType && setIsSendMessage(true)

    if (!netConnected || !connectState) {
      setInputBarType(MaiInputBarBtnType.Input)
      scrollToBottom()
      return true
    }
    messages.list = [...messages.list, robotMessage]
    removeBtn()
    send(text, '', extraData?.sendType)

    startTimer()
    scrollToBottom()
    return true
  }

  // 发送消息后，去掉导入模板的按钮
  const removeBtn = () => {
    const objectToModify = _.find(messages.list, { type: MaiSourceType.GUIDANCE_CMD_SELECT })
    // 需要强制===false，有为空的情况
    if (objectToModify && objectToModify.isApi === false) {
      chooseIdenity(objectToModify, true, true, 'all')
    }
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

  const robot = (item: Message) => {
    setUuid(item.uuid)
    let lastItem = last(messages.list) as Message

    if (MaiSourceTypeData[item.type]?.showAllContent) {
      // 后端模板返回的一次性加载
      lastItem = { ...lastItem, ...item, extraContent: JSON.parse(item?.extraContent) }
      lastItem.showEdit = false
      setInputBarType(MaiInputBarBtnType.Input)
    } else {
      setScrollWithAnimation(false)
      // gpt逐个生成的
      if (item.content === '[DONE]' || item.content === '[FAILURE]') {
        // GPT生成结束
        setInputBarType(MaiInputBarBtnType.Refrash)
        lastItem.showEdit = false
        lastItem = {
          ...lastItem,
          ...omit(item, ['content']),
          // extraContent: JSON.parse(item?.extraContent),
          netConnected: item.content === '[FAILURE]' ? false : true,
        }
        item.type === MaiSourceType.PROFILE && showInputTool()
      } else {
        lastItem.content = lastItem.content + item.content
      }
    }

    lastItem.loading = false
    lastItem.showBottom = true
    lastItem.type = item.type
    lastItem.extraContent = JSON.parse(item?.extraContent)

    const arr2 = [...initial(messages.list), lastItem]

    messages.list = arr2

    scrollToBottom()
  }

  const openResume = (id: string, extraContents?: any) => {
    if (extraContents) {
      let extra = cloneDeep(extraContents)
      extra.buttons.used = true
      setExtraContentResume(JSON.stringify(extra))
    }

    setUuid(id)
    setShowResume(true)
  }

  const editMsgList = (
    messageItem: Message,
    isApi: boolean,
    twoMore?: boolean,
    btnIndex?: number | 'all'
  ) => {
    const index = findIndex(messages.list, ['uuid', messageItem.uuid])
    const arr = cloneDeep(messages.list)
    arr[index].isApi = isApi
    if (twoMore && btnIndex) {
      if (btnIndex === 'all') {
        arr[index].extraContent.buttonsList.forEach(item => {
          item.used = true
        })
      } else {
        arr[index].extraContent.buttonsList[btnIndex].used = true
      }
    } else {
      arr[index].extraContent.buttons.used = true
    }

    return {
      resultArr: arr,
      extraContent: JSON.stringify(arr[index].extraContent),
    }
  }

  // 修改数据内部状态
  // isApi是否调接口删除， twoMore是否有多个按钮，btnIndex是修改某个按钮状态的下标，all是全部都修改状态
  const chooseIdenity = (
    messageItem: Message,
    isApi: boolean,
    twoMore?: boolean,
    btnIndex?: number | 'all'
  ) => {
    const { extraContent, resultArr } = editMsgList(messageItem, isApi, twoMore, btnIndex)

    if (!isApi) {
      messages.list = resultArr
    } else {
      return chooseMessage(extraContent, messageItem.uuid)
        .then(() => {
          const { resultArr: list } = editMsgList(messageItem, isApi, twoMore, btnIndex)
          messages.list = list
        })
        .catch(res => {
          showToast({ title: '服务异常，请重试', icon: 'none' })
          throw Error
        })
    }
  }

  // 不同页面状态下拦截其他非此页面操作
  const interceptBtn = (messageItem: Message) => {
    if (MaiSourceTypeData[messageItem.type]?.sence !== sence) {
      showToast({
        title: '无法将内容放到指定区域',
        icon: 'none',
      })
      return true
    }
    return false
  }

  const autoEdit = async (messageItem: Message) => {
    if (interceptBtn(messageItem)) {
      return
    }

    if (messageItem.type === MaiSourceType.PROFILE) {
      rangersEvent('生成简历_确认使用')
      setPageName('我的在线简历页')
      openResume(messageItem.uuid, messageItem.extraContent)
      return
    }

    if (messageItem.type === MaiSourceType.GUIDANCE_IDENTITY) {
      await chooseIdenity(messageItem, true)
      sendTextHandler('我是学生')
      scrollToBottom()
      return
    }

    // 返回工作经历和校园经历携带参数
    if (messageItem.type === MaiSourceType.WORK || messageItem.type === MaiSourceType.EDUCATION) {
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]

      rangersEvent(`${senceDataText[messageItem.type].text}_确认使用`)
      await chooseIdenity(messageItem, true)
      prevPage.setData({ text: messageItem.content })
      navigateBack()
    }
  }

  const personEdit = async (messageItem: Message) => {
    if (interceptBtn(messageItem)) {
      return
    }

    if (messageItem.type === MaiSourceType.PROFILE) {
      rangersEvent('生成简历_手动修改')
      setPageName('求职意向页')
      openResume(messageItem.uuid, messageItem.extraContent)
      return
    }

    await chooseIdenity(messageItem, true)
    if (messageItem.type === MaiSourceType.GUIDANCE_IDENTITY) {
      sendTextHandler('我是职场人')
      return
    }
    scrollToBottom()
  }

  // 点击有背景的按钮的事件
  const orderClick = async (messageItem: Message) => {
    if (interceptBtn(messageItem)) {
      return
    }

    if (!netConnected || !connectState) {
      showToast({ title: '服务异常，请重试', icon: 'none' })
      return
    }

    await chooseIdenity(messageItem, true)
    if (messageItem.type === MaiSourceType.GUIDANCE_SEND_EXAMPLE_CMD) {
      rangersEvent('指令')
      sendTextHandler(fixedText, {
        sendType: MaiSourceType.EXAMPLE_CMD,
      })
    }

    if (messageItem.type === MaiSourceType.GUIDANCE_SEND_CMD) {
      rangersEvent('点击开启你的创建简历之旅')
      messages.list = [...messages.list, robotMessage]
      noTextSend(messageItem.uuid)
    }
    scrollToBottom()
  }

  const onScrollToUpper = () => {
    if (hasMore) {
      setLoading(true)
      const time = head(messages.list)?.tcreated || ''
      getList(time, true)
    }
  }

  const stopChat = () => {
    stop()
    setInputBarType(MaiInputBarBtnType.Refrash)
    messages.list[messages.list.length - 1].showEdit = false
  }

  const refrashClick = (id?: string) => {
    if (!netConnected || !connectState) {
      return
    }

    if (id) {
      const index = findIndex(messages.list, ['uuid', id])
      messages.list.splice(index, 1)
    } else {
      messages.list.pop()
    }

    messages.list.push(robotMessage)
    send(lastUserText, uuid)
    setInputBarType(MaiInputBarBtnType.Stop)
  }

  const refrashItem = (id: string) => {
    refrashClick(id)
  }

  const userRefrash = (text, id, sendType) => {
    if (!netConnected || !connectState) {
      return
    }
    sendTextHandler(text, {
      refrashUuid: id,
      isRefrash: true,
      sendType,
    })
  }

  const showInputTool = () => {
    if (needShow) {
      setToastOpen(true)
    }
  }

  const closeInputTool = () => {
    setToastOpen(false)
    setCurrentTips()
  }

  // 获取服务端消息推送
  useUpdateEffect(() => {
    clearTimeout(timer)
    if (subscribeData?.code) {
      setInputBarType(MaiInputBarBtnType.Refrash)
      // messages.list.push({
      //   ...robotMessage,
      //   netConnected: false,
      //   loading: false,
      //   showEdit: false,
      // })
      scrollToBottom()
      return
    }

    const lastItem = last(messages.list)
    const isSame = lastItem?.type === subscribeData.type

    // 招呼语等需要首次新增卡片来承接
    if (MaiSourceTypeData[subscribeData.type]?.firstShow && !isSame) {
      // 去掉带有loading态的卡片
      messages.list = messages.list.filter(item => item.loading !== true)
      messages.list.push(robotMessage)
    }

    setShowInputBar(MaiSourceTypeData[subscribeData.type]?.showInputBar)

    robot(subscribeData as Message)
  }, [subscribeData])

  useEffect(() => {
    if (inputBarType !== MaiInputBarBtnType.Stop) {
      setScrollWithAnimation(true)
    }
  }, [inputBarType])

  useEffect(() => {
    getNetworkType({
      success: function (res) {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        setNetConnected(res.networkType === 'none' ? false : true)
      },
    })

    // 网络监测
    onNetworkStatusChange(res => {
      setNetConnected(res.isConnected)
      if (res.isConnected) {
        connect(getIsFirstConnect())
      } else {
        showToast({ title: '服务异常，请重试', icon: 'none' })
        disconnect()
      }
    })

    return () => {
      offNetworkStatusChange()
      disconnect()
      if (sence === 'profile') {
        sendDataRangersEvent('Button_click', {
          page_name: 'M.AI_IM页',
          button_name: '退出',
          popup_name: '二次确认弹窗',
        })
      }
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [])

  useEffect(() => {
    const lastItem = last(messages.list)
    if (
      lastItem &&
      MaiSourceTypeData[lastItem.type]?.showBtn &&
      !lastItem.extraContent &&
      !netConnected
    ) {
      messages.list[messages.list.length - 1].netConnected = false
      setInputBarType(MaiInputBarBtnType.Refrash)
    }
  }, [netConnected])

  useDidShow(async () => {
    try {
      const { hasMaiProfile } = await existsProfile()
      if (sence === 'profile' && hasMaiProfile) {
        enableAlertBeforeUnload(
          '当前M.AI已为你生成简历内容，操作返回则需重新选择创建简历方式，是否确认返回？'
        )
      } else {
        disableAlertBeforeUnload()
      }
    } catch {}
    const requeset_time = dayjs().format(dataType)
    showLoading({ title: '加载中' })
    getList(requeset_time)
      .then(() => {
        // setShowInputBar(true)
        scrollToBottom()
        connect(isFirstConnect)
        setIsFirstConnect(false)
      })
      .finally(() => hideLoading())
  })

  useDidHide(() => {
    disconnect()
  })

  return (
    <MainLayout className="MAIchat">
      <ScrollView
        className="MAIchat__message"
        style={{
          top: 0,
          bottom: showInputBar ? inputBarHeight : '20rpx',
          transition: `bottom 0.25s ease`,
        }}
        onScroll={scrollHandler}
        scrollTop={scrollTop}
        scrollWithAnimation={scrollWithAnimation}
        scrollY={scrollY}
        scrollAnchoring
        fastDeceleration
        enhanced
        onScrollToUpper={onScrollToUpper}
      >
        <View className="MAIchat__message__content-wrapper" id="chat__message__content-wrapper">
          {loading && hasMore && <View className="loading">加载中...</View>}

          {!netConnected && !messages.list.length && (
            <ChatItem
              content="加载失败，请退出重试"
              extraContent={{}}
              role="assistant"
              type={MaiSourceType.TEXT}
              uuid=""
              {...({} as any)}
            />
          )}

          {messages.list.map((message, index) => (
            <>
              {message.type === MaiSourceType.GREETING_N ? (
                <GreetingNCard />
              ) : (
                <ChatItem
                  key={index}
                  {...message}
                  inputRef={inputRef}
                  personEdit={() => personEdit(message)}
                  autoEdit={() => autoEdit(message)}
                  refrash={refrashItem}
                  userRefrash={userRefrash}
                  openResume={openResume}
                  orderClick={() => orderClick(message)}
                  setShowInputBar={setShowInputBar}
                  chooseIdenity={chooseIdenity}
                  interceptBtn={interceptBtn}
                />
              )}
            </>
          ))}
        </View>
      </ScrollView>
      {showInputBar && (
        <InputBar
          ref={inputRef}
          onInputOpen={inputOpenHandler}
          onHeightChange={setInputBarHeight}
          onSendText={sendTextHandler}
          type={inputBarType}
          setInputBarType={setInputBarType}
          stopClick={stopChat}
          refrashClick={refrashClick}
          toastOpen={toastOpen}
          close={closeInputTool}
          sence={sence}
          messageList={messages.list}
          isSendMessage={isSendMessage}
        />
      )}
      <OnLineResumePop
        page_name={pageName}
        extraContent={extraContentResume}
        uuid={uuid}
        open={showResume}
        onClose={() => setShowResume(false)}
      />
    </MainLayout>
  )
}

export default ChatRoom
