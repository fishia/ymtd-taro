import { MessageDirection } from '@rongcloud/imlib-v4'
import { View, Text, Image } from '@tarojs/components'
import c from 'classnames'
import _ from 'lodash'
import React, { useMemo } from 'react'

import { IProps } from '@/def/common'
import { IChatExchangeStatus, IConversationItem, MessageType } from '@/def/message'
import { conversationItemTimeFormat } from '@/services/IMService'
import { combineStaticUrl } from '@/utils/utils'
import MessageDisplayMap from '@/weapp/message/components/MessageItem/MessageItemMap'

import './index.scss'

export interface IConversationItemProps extends IConversationItem, IProps {
  onClick?(): void
}

const ConversationItem: React.FC<IConversationItemProps> = props => {
  const {
    hr_avatar = '/geebox/default/avatar/male1.png',
    hr_name = '未知会话',
    company_name = '未知公司',
    activity_portrait: activityPortrait,
    latestMessage,
    hr_last_read_time,
    unreadMessageCount = 0,
    onClick = _.noop,
    profile_status = IChatExchangeStatus.ENABLE,
    className,
    style,
  } = props

  const showReadStatus = useMemo(
    () =>
      latestMessage?.messageType === MessageType.TEXT_MESSAGE &&
      latestMessage?.messageDirection === MessageDirection.SEND,
    [latestMessage]
  )
  const isRead = showReadStatus ? (latestMessage?.sentTime || 0) <= hr_last_read_time : false

  const datetime = useMemo(() => conversationItemTimeFormat(latestMessage?.sentTime || 0), [
    latestMessage?.sentTime,
  ])

  const previewContent = useMemo(() => {
    const displayFn = MessageDisplayMap[latestMessage?.messageType || '']?.listDisplayText

    return displayFn ? displayFn(latestMessage) : ' '
  }, [latestMessage])

  const statusContent = useMemo(() => {
    if (profile_status === IChatExchangeStatus.PENDING) {
      return <Text className="message-conversation__chat-status profile-file">[求完整简历] </Text>
    } else if (showReadStatus) {
      return isRead ? (
        '[已读] '
      ) : (
        <Text className="message-conversation__chat-status no-read">[未读] </Text>
      )
    }

    return null
  }, [isRead, profile_status, showReadStatus])

  return (
    <View
      className={c('message-conversation', className)}
      hoverClass="message-conversation--hover"
      hoverStayTime={300}
      style={style}
      onClick={onClick}
    >
      <View className="message-conversation__head">
        {activityPortrait && (
          <Image
            src={combineStaticUrl(activityPortrait)}
            className="message-conversation__avatarPendeant"
            mode="aspectFit"
          />
        )}
        <Image
          className="message-conversation__avatar"
          mode="aspectFit"
          src={combineStaticUrl(hr_avatar)}
        />
        {unreadMessageCount > 0 ? (
          <View
            className={c('message-conversation__notice', {
              'notice-10': unreadMessageCount > 9,
              'notice-99': unreadMessageCount > 99,
            })}
          >
            {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
          </View>
        ) : null}
      </View>
      <View className="message-conversation__body">
        <View className="message-conversation__meta">
          <Text className="message-conversation__name">{hr_name}</Text>
          <Text className="message-conversation__company">{company_name}</Text>
          {datetime ? <Text className="message-conversation__date">{datetime}</Text> : null}
        </View>
        <View className="message-conversation__content">
          {statusContent}
          {previewContent}
        </View>
      </View>
    </View>
  )
}

export default ConversationItem
