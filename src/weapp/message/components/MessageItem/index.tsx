import React from 'react'
import { View } from '@tarojs/components'

import { hideMessageTypes, IMessage } from '@/def/message'
import { messageItemTimeFormat } from '@/services/IMService'
import MessageDisplayMap from './MessageItemMap'
import { useChatContext } from '../../chat/context'

import './index.scss'

export interface IMessageItemProps extends IMessage {
  showTime?: boolean
}

const MessageItem: React.FC<IMessageItemProps> = props => {
  const { messageType, showTime = false, sentTime } = props
  const context = useChatContext()

  const MessageBody = MessageDisplayMap[messageType]?.chatDisplay

  if (!MessageBody || hideMessageTypes.includes(messageType)) {
    return null
  }

  return (
    <View className="message-item">
      {showTime ? (
        <View className="message-item__time">{messageItemTimeFormat(sentTime)}</View>
      ) : null}
      <MessageBody {...context} {...props} />
    </View>
  )
}

export default MessageItem
