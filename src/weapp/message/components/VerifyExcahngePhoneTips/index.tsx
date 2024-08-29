import React, { useState } from 'react'

import { IChatExchangeRequestState, IChatExchangeStatus } from '@/def/message'
import { sendRCExpansionUpdateApi } from '@/apis/message'
import useToast from '@/hooks/custom/useToast'
import { chatExchangeStatusMap } from '../ChatNavigation'
import { ITextMessageProps } from '../TextMessage'
import RequestCardMessage from '../RequestCardMessage'
import { useChatContext } from '../../chat/context'

import './index.scss'

export interface IVerifyExchangePhoneTipsProps extends ITextMessageProps {}

const VerifyExchangePhoneTips: React.FC<IVerifyExchangePhoneTipsProps> = props => {
  const { sendFailedVerityNotice, onClickExchangePhone } = props
  const { state } = sendFailedVerityNotice?.expansion || {
    state: IChatExchangeRequestState.REQUEST,
  }

  const showToast = useToast()
  const currentChatStatus = useChatContext()
  const [currentState, setCurrentState] = useState<IChatExchangeRequestState>(state)

  if (!sendFailedVerityNotice) {
    return null
  }

  // 交换电话中、已下线
  if (
    [IChatExchangeStatus.PENDING, IChatExchangeStatus.OFFLINE].includes(
      currentChatStatus.phone_status
    )
  ) {
    return (
      <RequestCardMessage
        className="message-item__verify-tips-exchange-phone"
        {...props}
        tipText="您是否要和对方交换电话？"
        primaryButtonText={
          currentChatStatus.phone_status === IChatExchangeStatus.PENDING
            ? '交换电话中...'
            : '职位已下线'
        }
        primaryButtonHighlight={false}
        hasSubButton={false}
      />
    )
  }

  // 已同意、已拒绝、已失效
  if (currentState !== IChatExchangeRequestState.REQUEST) {
    const stateMap: Record<IChatExchangeRequestState, string> = {
      [IChatExchangeRequestState.REQUEST]: '',
      [IChatExchangeRequestState.DISABLED]: '已失效',
      [IChatExchangeRequestState.AGREED]: '已发送',
      [IChatExchangeRequestState.REFUSED]: '已取消',
    }

    return (
      <RequestCardMessage
        className="message-item__verify-tips-exchange-phone"
        {...props}
        tipText="您是否要和对方交换电话？"
        primaryButtonText={stateMap[currentState]}
        primaryButtonHighlight={currentState === IChatExchangeRequestState.AGREED}
        hasSubButton={false}
      />
    )
  }

  // 点击拒绝
  const disagreeClickHandler = () => {
    setCurrentState(IChatExchangeRequestState.REFUSED)
    sendRCExpansionUpdateApi(sendFailedVerityNotice, { state: IChatExchangeRequestState.REFUSED })
  }

  // 点击同意
  const agreeClickHandler = () => {
    const behavior = chatExchangeStatusMap[currentChatStatus.phone_status]
    if (!behavior.enable) {
      showToast({ content: behavior.toastWhenClick || '' })
      return
    }

    onClickExchangePhone().then(isConfirm => {
      if (isConfirm) {
        setCurrentState(IChatExchangeRequestState.AGREED)
        sendRCExpansionUpdateApi(sendFailedVerityNotice, {
          state: IChatExchangeRequestState.AGREED,
        })
      }
    })
  }

  return (
    <RequestCardMessage
      className="message-item__verify-tips-exchange-phone"
      {...props}
      tipText="您是否要和对方交换电话？"
      subButtonText="否"
      primaryButtonText="是"
      onSubButtonClick={disagreeClickHandler}
      onPrimaryButtonClick={agreeClickHandler}
    />
  )
}

export default VerifyExchangePhoneTips
