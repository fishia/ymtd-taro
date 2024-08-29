import { MessageDirection } from '@rongcloud/imlib-v4'
import { T } from 'ramda'
import React, { useMemo } from 'react'

import { agreeHrDeliverApi } from '@/apis/message'
import { IChatExchangeRequestState, IExchangeRequestProps, MessageType } from '@/def/message'
import { defaultUserInfo } from '@/def/user'
import { useCurrentUserInfo } from '@/hooks/custom/useUser'

import { useChatContext } from '../../chat/context'
import NotificationMessage, { INotificationMessageProps } from '../NotificationMessage'
import RequestCardMessage from '../RequestCardMessage'

import './index.scss'

export interface ISendResumeRequestProps extends IExchangeRequestProps {
  messageType: MessageType.SEND_RESUME_REQUEST
}

const SendResumeRequest: React.FC<ISendResumeRequestProps> = props => {
  const { expansion, messageDirection } = props

  const userInfo = useCurrentUserInfo() || defaultUserInfo
  const { submitExchangeRequest, openActivityPopup = T, reply_reward_status } = useChatContext()
  // 同意发送完整简历 是否展示红包累积弹窗
  const showRedPacketPop = useMemo(
    () => userInfo.stage === 1 && userInfo.isDraw === 1 && !reply_reward_status,
    [userInfo, reply_reward_status]
  )

  // C 端发送的请求，渲染成系统提示
  if (messageDirection === MessageDirection.SEND) {
    const notificationProps: INotificationMessageProps = {
      ...props,
      messageType: MessageType.INFO_NOTICE,
      content: { message: '您请求向对方投递简历' },
    }

    return <NotificationMessage {...notificationProps} />
  }

  const currentState = expansion?.state || IChatExchangeRequestState.REQUEST

  // 已同意、已拒绝、已失效
  if (currentState !== IChatExchangeRequestState.REQUEST) {
    const stateMap: Record<IChatExchangeRequestState, string> = {
      [IChatExchangeRequestState.REQUEST]: '',
      [IChatExchangeRequestState.DISABLED]: '已失效',
      [IChatExchangeRequestState.AGREED]: '已同意',
      [IChatExchangeRequestState.REFUSED]: '已拒绝',
    }

    return (
      <RequestCardMessage
        className="message-item__exchange-resume"
        {...props}
        tipText="对方想要一份您的简历"
        primaryButtonText={stateMap[currentState]}
        primaryButtonHighlight={currentState === IChatExchangeRequestState.AGREED}
        hasSubButton={false}
      />
    )
  }

  // 点击拒绝
  const disagreeClickHandler = () => {
    submitExchangeRequest(props, false)
  }

  // 点击同意
  const agreeClickHandler = () => {
    submitExchangeRequest(props, true).then(openActivityPopup)
  }

  return (
    <RequestCardMessage
      className="message-item__exchange-resume"
      {...props}
      tipText="对方想要一份您的简历"
      subButtonText="拒绝"
      primaryButtonText="同意"
      showBadge={showRedPacketPop}
      onSubButtonClick={disagreeClickHandler}
      onPrimaryButtonClick={agreeClickHandler}
    />
  )
}

export default SendResumeRequest
