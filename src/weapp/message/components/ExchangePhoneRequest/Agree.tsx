import React, { useEffect, useState } from 'react'
import { makePhoneCall, setClipboardData } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { MessageDirection } from '@rongcloud/imlib-v4'

import { MessageType } from '@/def/message'
import { fetchChattingPhoneNumberApi } from '@/apis/message'
import { formatPhone } from '@/services/StringService'
import RequestCardMessage from '../RequestCardMessage'
import NotificationMessage from '../NotificationMessage'
import { IExchangePhoneRequestProps } from '.'

const AgreeExchangePhone: React.FC<IExchangePhoneRequestProps> = props => {
  const { chat_id, hr_name, messageDirection } = props

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [phoneNumber, setPhoneNumber] = useState<string>('')

  const isShowNotification = messageDirection === MessageDirection.RECEIVE

  useEffect(() => {
    fetchChattingPhoneNumberApi(chat_id)
      .then(setPhoneNumber)
      .then(() => void setIsLoading(false))
  }, [chat_id, messageDirection])

  // 点击复制
  const copyClickHandler = () => {
    setClipboardData({ data: phoneNumber })
  }

  // 点击拨打
  const callClickHandler = () => {
    makePhoneCall({ phoneNumber: phoneNumber })
  }

  const TipContent = (
    <View className="message-item__exchange-phone__content">
      <View className="message-item__exchange-phone__name">{hr_name}的手机号</View>
      <View className="message-item__exchange-phone__number">
        {isLoading ? '加载中' : formatPhone(phoneNumber)}
      </View>
    </View>
  )

  const Notification = (
    <NotificationMessage
      className="message-item__exchange-phone__notice"
      {...props}
      messageType={MessageType.INFO_NOTICE}
      content={{ message: '对方已同意交换电话' }}
    />
  )

  const cardMessageProps = isLoading
    ? {
        hasSubButton: false,
        primaryButtonText: '加载中',
        primaryButtonHighlight: false,
      }
    : {
        subButtonText: '复制',
        primaryButtonText: '拨打',
        onSubButtonClick: copyClickHandler,
        onPrimaryButtonClick: callClickHandler,
      }

  return (
    <>
      {isShowNotification ? Notification : null}
      <RequestCardMessage
        className="message-item__exchange-phone"
        tipText={TipContent}
        {...props}
        {...cardMessageProps}
      />
    </>
  )
}

export default AgreeExchangePhone
