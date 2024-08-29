import { noop } from 'lodash'
import { T } from 'ramda'
import { FC, useEffect, useMemo, useState } from 'react'

import { saveCheerApi } from '@/apis/job'
import { fetchCanDraw, sendRCExpansionUpdateApi } from '@/apis/message'
import {
  ISendResumeTipsCardProps,
  MemberLevel,
  SendResumeDirectlyCardStateEnum,
} from '@/def/message'
import { defaultUserInfo } from '@/def/user'
import { useRefuelPackagePopup } from '@/hooks/custom/usePopup'
import { useCurrentUserInfo } from '@/hooks/custom/useUser'

import { useChatContext } from '../../chat/context'
import RequestCardMessage from '../RequestCardMessage'

// 直投消息提示卡片
const SendResumeTipsCard: FC<ISendResumeTipsCardProps> = props => {
  const { expansion, content } = props

  const {
    onClickSendResume: sendResume,
    confirmSendProfileFile,
    is_free,
    isActive,
    openActivityPopup = T,
  } = useChatContext()
  const [showRefuelPackagePopup] = useRefuelPackagePopup()
  const [currentState, setCurrentState] = useState(
    () => expansion?.state || SendResumeDirectlyCardStateEnum.NORMAL
  )
  const userInfo = useCurrentUserInfo() || defaultUserInfo
  const showDrawPop = useMemo(() => userInfo.stage === 1 && userInfo.isDraw === 0, [userInfo])

  useEffect(() => {
    if (expansion?.state) {
      setCurrentState(expansion.state)
    }
  }, [expansion])

  // 新附件简历点击处理方法
  const newApplySendResumeHandler = async () => {
    // 兜底，前端直接做更新扩展操作把卡片状态改为已投递
    const isCompleted = await confirmSendProfileFile()
    if (!isCompleted) {
      return
    }
    sendResume()
      .then(openActivityPopup)

    // 加油包
    if (isActive) {
      saveCheerApi().then(res => {
        if (res) {
          showRefuelPackagePopup({ level: res })
        }
      })
    }
    // 处理医脉·数科互通
    // const updatedState: any = { state: SendResumeDirectlyCardStateEnum.AGREE }
    // if (content?.sourceMsgUID) {
    //   updatedState.updatedState = content.sourceMsgUID
    // }
    // sendRCExpansionUpdateApi(props, updatedState)
  }

  const isOK = currentState === SendResumeDirectlyCardStateEnum.NORMAL
  const applyClickHandler = isOK ? newApplySendResumeHandler : noop
  const buttonText =
    {
      [SendResumeDirectlyCardStateEnum.NORMAL]: '立即投递',
      [SendResumeDirectlyCardStateEnum.AGREE]: '已投递',
      [SendResumeDirectlyCardStateEnum.INVALID]: '已失效',
      [SendResumeDirectlyCardStateEnum.REFUSE]: '已拒绝',
    }[currentState] || ''

  return (
    <RequestCardMessage
      className="message-item__exchange-resume"
      {...props}
      tipText={
        is_free === MemberLevel.VIP_TRAFFIC_PACKAGE
          ? '您可以直接发送简历'
          : '该职位可限时直投，您可以直接发送简历'
      }
      primaryButtonText={buttonText}
      onPrimaryButtonClick={applyClickHandler}
      primaryButtonHighlight={isOK}
      hasSubButton={false}
      showBadge={showDrawPop && isOK}
      badgeUrl="1888cash.png"
      badgeStyle={{ top: '-20rpx', right: '78rpx' }}
    />
  )
}

export default SendResumeTipsCard
