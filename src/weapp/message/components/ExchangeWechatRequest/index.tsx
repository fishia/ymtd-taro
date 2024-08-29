import { MessageDirection } from '@rongcloud/imlib-v4'
import { eventCenter } from '@tarojs/taro'
import React from 'react'

import { OPEN_ADD_WECHAT_MODAL } from '@/config'
import { IChatExchangeRequestState, IExchangeRequestProps, MessageType } from '@/def/message'
import { sendDataRangersEvent } from '@/utils/dataRangers'

import { useChatContext } from '../../chat/context'
import NotificationMessage, { INotificationMessageProps } from '../NotificationMessage'
import RequestCardMessage, { IRequestCardMessageProps } from '../RequestCardMessage'

import './index.scss'

export interface IExchangeWechatRequestProps extends IExchangeRequestProps {
  messageType: MessageType.EXCHANGE_WECHAT_REQUEST
}

const ExchangeWechatRequest: React.FC<IExchangeWechatRequestProps> = props => {
  const { expansion, messageDirection, wechat, user_id, hr_id, jd_id } = props

  const eventParams = {
    from_user_id: String(user_id),
    to_user_id: String(hr_id),
    jd_id: String(jd_id),
  }

  const submit = useChatContext().submitExchangeRequest

  // C 端发送的请求，渲染成系统提示
  if (messageDirection === MessageDirection.SEND) {
    const notificationProps: INotificationMessageProps = {
      ...props,
      messageType: MessageType.INFO_NOTICE,
      content: { message: '已申请与招聘者交换微信，请等待对方回复' },
    }

    return <NotificationMessage {...notificationProps} />
  }

  const currentState = expansion?.state || IChatExchangeRequestState.REQUEST

  // 已同意、已拒绝、已失效
  if (currentState !== IChatExchangeRequestState.REQUEST) {
    const stateMap: Record<IChatExchangeRequestState, Partial<IRequestCardMessageProps>> = {
      [IChatExchangeRequestState.REQUEST]: {},
      [IChatExchangeRequestState.DISABLED]: {
        primaryButtonText: '已失效',
      },
      [IChatExchangeRequestState.AGREED]: {
        subButtonText: '拒绝',
        primaryButtonText: '已同意',
        strongType: 'primary',
      },
      [IChatExchangeRequestState.REFUSED]: {
        subButtonText: '已拒绝',
        primaryButtonText: '同意',
        strongType: 'sub',
      },
    }
    return (
      <RequestCardMessage
        className="message-item__exchange-wechat"
        {...props}
        tipText="对方申请交换微信，你是否同意"
        subButtonText={stateMap[currentState]?.subButtonText}
        primaryButtonText={stateMap[currentState]?.primaryButtonText || ''}
        strongType={stateMap[currentState]?.strongType}
        hasSubButton={currentState !== IChatExchangeRequestState.DISABLED}
        primaryButtonHighlight={false}
      />
    )
  }

  // 点击拒绝
  const disagreeClickHandler = () => {
    submit(props, false)
    sendDataRangersEvent('ChangeWeChatPopupClick', { ...eventParams, is_change: '否' })
  }

  // 点击同意
  const agreeClickHandler = () => {
    sendDataRangersEvent('ChangeWeChatPopupClick', { ...eventParams, is_change: '是' })
    if (wechat) {
      submit(props, true)
    } else {
      eventCenter.trigger(OPEN_ADD_WECHAT_MODAL, props)
    }
  }

  return (
    <>
      <RequestCardMessage
        className="message-item__exchange-wechat"
        {...props}
        tipText="对方申请交换微信，你是否同意"
        subButtonText="拒绝"
        primaryButtonText="同意"
        onSubButtonClick={disagreeClickHandler}
        onPrimaryButtonClick={agreeClickHandler}
      />
    </>
  )
}

export default ExchangeWechatRequest
