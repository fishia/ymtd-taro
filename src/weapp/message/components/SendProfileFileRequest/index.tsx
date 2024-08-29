import React, { useEffect, useMemo } from 'react'

import { IChatExchangeRequestState, IExchangeRequestProps, MessageType } from '@/def/message'
import { defaultUserInfo } from '@/def/user'
import { useCurrentUserInfo } from '@/hooks/custom/useUser'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import { useChatContext } from '../../chat/context'
import RequestCardMessage, { IRequestCardMessageProps } from '../RequestCardMessage'

import './index.scss'
import { agreeHrDeliverApi } from '@/apis/message'
import { T } from 'ramda'

export interface ISendProfileFileRequestProps extends IExchangeRequestProps {
  messageType: MessageType.SEND_PROFILE_FILE_REQUEST
}

const SendProfileFileRequest: React.FC<ISendProfileFileRequestProps> = props => {
  const { expansion } = props

  const {
    jd_id,
    md_profile_id,
    hr_id,
    reply_reward_status,
    submitExchangeRequest,
    confirmSendProfileFile,
    openActivityPopup = T
  } = useChatContext()
  const userInfo = useCurrentUserInfo() || defaultUserInfo
  // 同意发送完整简历 是否展示红包累积弹窗
  const showRedPacketPop = useMemo(() => userInfo.stage === 1 && userInfo.isDraw === 1 &&!reply_reward_status, [userInfo,reply_reward_status])

  // 注意此卡片存在 state 为 "4" 的情况，也表示申请中
  const currentState = String(
    expansion?.state || IChatExchangeRequestState.REQUEST
  ) as IChatExchangeRequestState

  useEffect(() => {
    sendDataRangersEventWithUrl('ApplyResumeCardExpose', { position: '卡片' })
  }, [])

  // 已同意、已拒绝、已失效
  if (
    [
      IChatExchangeRequestState.AGREED,
      IChatExchangeRequestState.REFUSED,
      IChatExchangeRequestState.DISABLED,
    ].includes(currentState)
  ) {
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
      <>
        <RequestCardMessage
          className="message-item__send-profile-file"
          {...props}
          tipText="对方想要你的完整简历，是否同意"
          subButtonText={stateMap[currentState]?.subButtonText}
          primaryButtonText={stateMap[currentState]?.primaryButtonText || ''}
          strongType={stateMap[currentState]?.strongType}
          hasSubButton={currentState !== IChatExchangeRequestState.DISABLED}
          primaryButtonHighlight={false}
        />
      </>
    )
  }

  // 点击拒绝
  const disagreeClickHandler = () => {
    submitExchangeRequest(props, false)
    sendDataRangersEventWithUrl('ApplyResumeCardClick', {
      button_name: '拒绝',
      from_user_id: hr_id,
      jd_id,
      cv_id: md_profile_id,
      position: '卡片',
    })
  }

  // 点击同意
  const agreeClickHandler = () => {
    confirmSendProfileFile().then(isAgree => {
      if (isAgree) {
        submitExchangeRequest(props, true).then(openActivityPopup)
      }
    })
    sendDataRangersEventWithUrl('ApplyResumeCardClick', {
      button_name: '同意',
      from_user_id: hr_id,
      jd_id,
      cv_id: md_profile_id,
      position: '卡片',
    })
  }

  return (
    <RequestCardMessage
      className="message-item__send-profile-file"
      {...props}
      tipText="对方想要你的完整简历，是否同意"
      subButtonText="拒绝"
      primaryButtonText="同意"
      showBadge={showRedPacketPop}
      onSubButtonClick={disagreeClickHandler}
      onPrimaryButtonClick={agreeClickHandler}
    />
  )
}

export default SendProfileFileRequest
