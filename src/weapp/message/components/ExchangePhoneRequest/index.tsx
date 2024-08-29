import { MessageDirection } from '@rongcloud/imlib-v4'
import React from 'react'

import { IChatExchangeRequestState, IExchangeRequestProps, MessageType } from '@/def/message'
import { sendDataRangersEvent } from '@/utils/dataRangers'

import { useChatContext } from '../../chat/context'
import NotificationMessage, { INotificationMessageProps } from '../NotificationMessage'
import RequestCardMessage from '../RequestCardMessage'

import './index.scss'

export interface IExchangePhoneRequestProps extends IExchangeRequestProps {
  messageType: MessageType.EXCHANGE_PHONE_REQUEST
}

const ExchangePhoneRequest: React.FC<IExchangePhoneRequestProps> = props => {
  const { expansion, messageDirection } = props

  const submit = useChatContext().submitExchangeRequest

  // C 端发送的请求，渲染成系统提示
  if (messageDirection === MessageDirection.SEND) {
    const notificationProps: INotificationMessageProps = {
      ...props,
      messageType: MessageType.INFO_NOTICE,
      content: { message: '您请求与对方交换电话' },
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
        className="message-item__exchange-phone"
        {...props}
        tipText="对方希望与您交换联系方式，你是否同意"
        primaryButtonText={stateMap[currentState]}
        primaryButtonHighlight={currentState === IChatExchangeRequestState.AGREED}
        hasSubButton={false}
      />
    )
  }

  // 点击拒绝
  const disagreeClickHandler = () => {
    submit(props, false)
    sendDataRangersEvent('ChangePhonePopupClick', { is_change: '拒绝' })
  }

  // 点击同意
  const agreeClickHandler = () => {
    submit(props, true)
    sendDataRangersEvent('ChangePhonePopupClick', { is_change: '同意' })
  }

  return (
    <>
      <RequestCardMessage
        className="message-item__exchange-phone"
        {...props}
        tipText="对方希望与您交换联系方式，你是否同意"
        subButtonText="拒绝"
        primaryButtonText="同意"
        onSubButtonClick={disagreeClickHandler}
        onPrimaryButtonClick={agreeClickHandler}
      />
      <NotificationMessage
        {...props}
        className="message-item__exchange-phone__notice-bottom"
        messageType={MessageType.INFO_NOTICE}
        content={{ message: '同意交换电话，你的简历有更多的曝光机会' }}
      />
    </>
  )
}

export default ExchangePhoneRequest
