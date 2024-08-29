import React from 'react'
import c from 'classnames'
import _ from 'lodash'
import { View } from '@tarojs/components'

import { IProps } from '@/def/common'

import './index.scss'

export interface IMessageNotificationProps extends IProps {
  onButtonClick?(): void
}

const MessageNotification: React.FC<IMessageNotificationProps> = props => {
  const { onButtonClick = _.noop, className, style } = props

  return (
    <View className={c('message-notification', className)} style={style}>
      <View className="message-notification__text">
        <View className="message-notification__title">开启消息提醒</View>
        <View className="message-notification__tips">如有HR回复，我们会在第一时间通知您~</View>
      </View>

      <View className="message-notification__button" onClick={onButtonClick}>
        立即开启
      </View>
    </View>
  )
}

export default MessageNotification
