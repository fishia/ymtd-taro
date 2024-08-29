import { View } from '@tarojs/components'
import c from 'classnames'
import React, { ReactNode } from 'react'

import { IProps } from '@/def/common'
import { IMessageItem, MessageType } from '@/def/message'

import './index.scss'

export interface INotificationMessageContent {
  message: ReactNode
  strong?: boolean
}

export function displayNotification(message: ReactNode, strong?: boolean): React.FC<IProps> {
  return props => (
    <View className={c('message-item__notice', props.className)} style={props.style}>
      <View className={c('message-item__notice__body', strong ? 'strong' : '')}>{message}</View>
    </View>
  )
}

export interface INotificationMessageProps extends IMessageItem {
  messageType: MessageType.INFO_NOTICE
  content: INotificationMessageContent
}

const NotificationMessage: React.FC<INotificationMessageProps> = props => {
  return displayNotification(props.content.message, props.content.strong)(props)
}

export default NotificationMessage
