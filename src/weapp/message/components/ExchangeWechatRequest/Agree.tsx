import { MessageDirection } from '@rongcloud/imlib-v4'
import { Text, View } from '@tarojs/components'
import { setClipboardData, showToast } from '@tarojs/taro'
import React, { useEffect, useState } from 'react'

import { fetchChattingWechatNumberApi } from '@/apis/message'
import { MessageType } from '@/def/message'

import NotificationMessage from '../NotificationMessage'

import { IExchangeWechatRequestProps } from '.'

const AgreeExchangeWechat: React.FC<IExchangeWechatRequestProps> = props => {
  const { chat_id, messageDirection } = props

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [wechatNumber, setWechatNumber] = useState<string>('')

  useEffect(() => {
    fetchChattingWechatNumberApi(chat_id)
      .then(setWechatNumber)
      .then(() => void setIsLoading(false))
  }, [chat_id, messageDirection])

  // 点击复制
  const copyClickHandler = () => {
    setClipboardData({
      data: wechatNumber,
      success: () => {
        showToast({
          title: '微信号已复制',
        })
      },
    })
  }

  const Notification = (
    <NotificationMessage
      className="message-item__exchange-wechat__notice"
      {...props}
      messageType={MessageType.INFO_NOTICE}
      content={{
        message:
          messageDirection === MessageDirection.RECEIVE
            ? '对方已同意交换微信，微信号为：'
            : '你已同意交换微信，对方微信号为：',
      }}
    />
  )

  return (
    <>
      {Notification}
      <View className="message-item__exchange-wechat__content">
        <View className="message-item__exchange-wechat__number">
          {isLoading ? '加载中' : wechatNumber}
          <Text onClick={copyClickHandler}>复制</Text>
        </View>
      </View>
    </>
  )
}

export default AgreeExchangeWechat
