import { View } from '@tarojs/components'
import { getMenuButtonBoundingClientRect, getSystemInfoSync, pxTransform } from '@tarojs/taro'
import c from 'classnames'
import dayjs from 'dayjs'
import _, { noop } from 'lodash'
import { T } from 'ramda'
import React, { useContext, useEffect, useState } from 'react'

import { submitIMExchangeTipsApi } from '@/apis/message'
import ToastTips from '@/components/ToastTips'
import { IM_EXCHANGE_WECHAT_TIPS_SHOW } from '@/config'
import { IProps } from '@/def/common'
import { IChatContext, IChatExchangeStatus, MemberLevel } from '@/def/message'
import useOnce from '@/hooks/custom/useOnce'
import useToast from '@/hooks/custom/useToast'
import { updateRCMessageExpansion } from '@/services/IMService'
import { sendDataRangersEvent, sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import ChatContext from '../../chat/context'

import './index.scss'

export interface IChatNavigationProps extends IProps {
  onClickBack?(): void
  onClose?(): void
  visible: boolean
}

interface ExchangeButtonStatus {
  enable: boolean
  textOverride?: string
  toastWhenClick?: string
}

const sendResumeText = '发送简历'
const exchangePhoneText = '交换电话'
const exchangeWechatText = '交换微信'

const chatExchangeEnableStatus: ExchangeButtonStatus = { enable: true }

const sendProfileFileAgreeStatus: ExchangeButtonStatus = {
  enable: false,
  textOverride: '已发送简历',
  toastWhenClick: '简历已发送给对方，无需重复发送',
}

const exchangeWechatPendingStatus: ExchangeButtonStatus = {
  enable: false,
  textOverride: '交换微信中',
}

const exchangeWechatAgreeStatus: ExchangeButtonStatus = {
  enable: true,
  textOverride: '查看微信',
}

export const chatExchangeStatusMap: Record<IChatExchangeStatus, ExchangeButtonStatus> = {
  [IChatExchangeStatus.ENABLE]: chatExchangeEnableStatus,
  [IChatExchangeStatus.AGREE]: chatExchangeEnableStatus,
  [IChatExchangeStatus.DISAGREE]: chatExchangeEnableStatus,

  [IChatExchangeStatus.DISABLE_UNTIL_BOTH_RESPONESE]: {
    enable: false,
    toastWhenClick: '双方回复后可用',
  },

  [IChatExchangeStatus.PENDING]: {
    enable: false,
    textOverride: '交换电话中',
    toastWhenClick: '请耐心等待对方处理',
  },

  [IChatExchangeStatus.OFFLINE]: {
    enable: false,
    toastWhenClick: '沟通中的职位已下线',
  },
}

const systemInfo = getSystemInfoSync()
const statusBarHeight = systemInfo?.statusBarHeight || 20

const navigationPaddingTop = statusBarHeight + 'px'
const navigationHeight = `calc(${navigationPaddingTop} + ${pxTransform(10 + 90 + 126)})`

const capsuleRect = getMenuButtonBoundingClientRect()
const titleMaxWidth = (capsuleRect.left - systemInfo.screenWidth / 2) * 2 - 10

const isInActivityDate = dayjs().isBefore('2022-05-01')

const ChatNavigation: React.FC<IChatNavigationProps> = props => {
  const { onClickBack = _.noop, className, onClose, visible } = props

  const showToast = useToast()
  const [tipsVisible, setTipsVisible] = useState(false)
  const { needShow, setCurrentTips } = useOnce(IM_EXCHANGE_WECHAT_TIPS_SHOW, 3)

  const {
    phone_status,
    profile_status,
    onClickExchangePhone,
    onClickSendProfileFile,
    onClickExchangeWechat,
    hr_name,
    company_name,
    is_direct_apply = false,
    is_profile_applied = false,
    user_id,
    hr_id,
    jd_id,
    chat_id,
    is_free,
    requestProfileStatus,
    wechat_status,
    md_profile_id,
    openActivityPopup = T,
  } = useContext<IChatContext>(ChatContext)

  // 7.6.5 新逻辑，is_direct_apply 不为 true 时则表示职位已下线
  // 7.6.8.3 附件简历逻辑，新字段 requestProfileStatus 表示附件简历
  let sendResumeButtonStatus = {
    ...chatExchangeStatusMap[is_direct_apply ? requestProfileStatus : IChatExchangeStatus.OFFLINE],
  }
  const exchangePhoneButtonStatus = { ...chatExchangeStatusMap[phone_status] }
  const exchangeWechatButtonStatus = { ...chatExchangeStatusMap[wechat_status] }

  if (requestProfileStatus === IChatExchangeStatus.AGREE) {
    // 已同意后，无法点击
    Object.assign(sendResumeButtonStatus, sendProfileFileAgreeStatus)
  } else if (
    (requestProfileStatus !== IChatExchangeStatus.OFFLINE && is_direct_apply) ||
    requestProfileStatus === IChatExchangeStatus.PENDING ||
    profile_status === IChatExchangeStatus.PENDING
  ) {
    // 非下线职位 且 直投功能开启，简历状态重设为可用
    // 附件简历版本，新增 pending 状态也为可用
    sendResumeButtonStatus = chatExchangeEnableStatus
  }

  if (wechat_status === IChatExchangeStatus.AGREE) {
    //同意交换微信后可点击查看微信
    Object.assign(exchangeWechatButtonStatus, exchangeWechatAgreeStatus)
  }

  if (wechat_status === IChatExchangeStatus.PENDING) {
    //交换微信中文案替换
    Object.assign(exchangeWechatButtonStatus, exchangeWechatPendingStatus)
  }

  useEffect(() => {
    if (requestProfileStatus === IChatExchangeStatus.PENDING) {
      sendDataRangersEventWithUrl('ApplyResumeCardExpose', { position: '顶部' })
    }
  }, [requestProfileStatus])

  useEffect(() => {
    if (needShow && wechat_status === IChatExchangeStatus.ENABLE) {
      setTipsVisible(true)
      setCurrentTips()
    } else {
      setTipsVisible(false)
    }
  }, [wechat_status])

  const sendResumeClickHandler = () => {
    if (sendResumeButtonStatus.enable) {
      onClickSendProfileFile(true).then(openActivityPopup)
    } else if (sendResumeButtonStatus.toastWhenClick) {
      showToast({ content: sendResumeButtonStatus.toastWhenClick })
    }
  }

  const exchangePhoneClickHandler = () => {
    if (exchangePhoneButtonStatus.enable) {
      sendDataRangersEvent('ChangePhone', {
        from_user_id: String(user_id),
        to_user_id: String(hr_id),
        jd_id: String(jd_id),
      })
      onClickExchangePhone()
    } else if (exchangePhoneButtonStatus.toastWhenClick) {
      showToast({ content: exchangePhoneButtonStatus.toastWhenClick })
    }
  }

  const exchangeWechatClickHandler = () => {
    if (exchangeWechatButtonStatus.enable) {
      sendDataRangersEvent('ChangeWeChat', {
        from_user_id: String(user_id),
        to_user_id: String(hr_id),
        jd_id: String(jd_id),
        button_name: exchangeWechatButtonStatus.textOverride || exchangeWechatText,
      })
      onClickExchangeWechat()
    } else if (exchangeWechatButtonStatus.toastWhenClick) {
      showToast({ content: exchangeWechatButtonStatus.toastWhenClick })
    }
  }

  const sendProfileFile = (isAgree: boolean) => {
    if (isAgree) {
      onClickSendProfileFile(isAgree).then(openActivityPopup)
    } else {
      submitIMExchangeTipsApi({ chat_id }, 'attachment', false)
        .then(messageUId => {
          updateRCMessageExpansion(messageUId, { state: '2' })
        })
        .catch(noop)
    }
    sendDataRangersEventWithUrl('ApplyResumeCardClick', {
      button_name: isAgree ? '同意' : '拒绝',
      from_user_id: hr_id,
      jd_id,
      cv_id: md_profile_id,
      position: '顶部',
    })
  }

  const renderActivityBar = () => {
    if (requestProfileStatus === IChatExchangeStatus.PENDING) {
      return (
        <View className="chat-navigation__file">
          <View className="chat-navigation__file__text">对方想要你的完整简历，是否同意</View>
          <View className="chat-navigation__file__action">
            <View
              className="chat-navigation__file__button disagree"
              onClick={() => void sendProfileFile(false)}
            >
              拒绝
            </View>
            <View
              className="chat-navigation__file__button agree"
              onClick={() => void sendProfileFile(true)}
            >
              同意
            </View>
          </View>
        </View>
      )
    } else if (is_direct_apply && !is_profile_applied) {
      return (
        <View className={c('chat-navigation__direct', { 'chat-navigation__visible': visible })}>
          <View className="icon iconfont iconjipin"></View>
          {isInActivityDate
            ? '升职季限时活动，点击上方【发送简历】可直接投递'
            : is_free === MemberLevel.VIP_TRAFFIC_PACKAGE
            ? '点击上方发送简历直接投递'
            : '该职位可限时直投，点击上方发送简历直接投递'}
          <View className="icon close iconfont iconclose" onClick={onClose}></View>
        </View>
      )
    }

    return null
  }

  const clearTips = () => {
    setTipsVisible(false)
  }

  const textColor = e => {
    return e.textOverride ? '#7A7F99' : '#333'
  }

  return (
    <View
      className={c(className, 'chat-navigation')}
      style={{ paddingTop: navigationPaddingTop, height: navigationHeight }}
    >
      <View className="chat-navigation__head">
        <View onClick={onClickBack} className="chat-navigation__icon">
          <View className="chat-navigation__back at-icon at-icon-chevron-left"></View>
        </View>
        <View className="chat-navigation__info">
          <View className="chat-navigation__name" style={{ maxWidth: titleMaxWidth }}>
            {hr_name}
          </View>
        </View>
        <View className="chat-navigation__info">
          <View className="chat-navigation__company" style={{ maxWidth: titleMaxWidth }}>
            {company_name}
          </View>
        </View>
      </View>

      <View className="chat-navigation__action">
        <View onClick={sendResumeClickHandler} className="chat-navigation__action-item">
          <View
            className={c('chat-navigation__action-icon sendresume', {
              disabled: !sendResumeButtonStatus.enable,
            })}
          >
            <View className="icon iconfont icontoudijianli"></View>
          </View>
          <View
            className="chat-navigation__action-text"
            style={{ color: textColor(sendResumeButtonStatus) }}
          >
            {sendResumeButtonStatus.textOverride || sendResumeText}
          </View>
        </View>

        <View onClick={exchangeWechatClickHandler} className="chat-navigation__action-item">
          <View
            className={c('chat-navigation__action-icon exchangeWechat', {
              disabled: !exchangeWechatButtonStatus.enable,
            })}
          >
            <View className="icon iconfont iconweixin"></View>
          </View>
          <View
            className="chat-navigation__action-text"
            style={{ color: textColor(exchangeWechatButtonStatus) }}
          >
            {exchangeWechatButtonStatus.textOverride || exchangeWechatText}
          </View>
        </View>

        <View onClick={exchangePhoneClickHandler} className="chat-navigation__action-item">
          <View
            className={c('chat-navigation__action-icon exchangephone', {
              disabled: !exchangePhoneButtonStatus.enable,
            })}
          >
            <View className="icon iconfont iconjiaohuandianhua"></View>
          </View>
          <View
            className="chat-navigation__action-text"
            style={{ color: textColor(exchangePhoneButtonStatus) }}
          >
            {exchangePhoneButtonStatus.textOverride || exchangePhoneText}
          </View>
        </View>
      </View>

      {renderActivityBar()}
      <ToastTips
        style={{ top: navigationHeight }}
        className="chat-navigation__toast"
        visible={tipsVisible}
        content="「交换微信」全新上线，与招聘者快速沟通"
        onClose={clearTips}
      />
    </View>
  )
}

export default ChatNavigation
