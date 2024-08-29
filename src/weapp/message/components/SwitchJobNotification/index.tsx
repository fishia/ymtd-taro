import React from 'react'

import { IMessageItem, IMRoleType, MessageType } from '@/def/message'
import NotificationMessage, { INotificationMessageProps } from '../NotificationMessage'

export interface ISwitchJobNotificationContent {
  content: '切换职位'
  initiator: IMRoleType
}

export interface ISwitchJobNotificationProps extends IMessageItem {
  messageType: MessageType.INFO_NOTICE
  isStrong?: boolean
  content: ISwitchJobNotificationContent
}

const SwitchJobNotification: React.FC<ISwitchJobNotificationProps> = props => {
  const param: INotificationMessageProps = {
    ...props,
    content: {
      message:
        props.content.initiator === IMRoleType.HR
          ? '对方更换了和您沟通的职位'
          : '您更换了和对方沟通的职位',
    },
  }

  return <NotificationMessage {...param} />
}

export default SwitchJobNotification
