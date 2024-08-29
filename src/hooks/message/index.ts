import { IUpdatedExpansion, MessageDirection } from '@rongcloud/imlib-v4'
import { eventCenter } from '@tarojs/taro'
import _ from 'lodash'
import R from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { saveCheerApi } from '@/apis/job'
import {
  clearRCUnreadCountApi,
  directSendResumeApi,
  fetchChattingStatusApi,
  fetchRCHistoryMessageList,
  sendExchangePhoneApi,
  sendExchangeWechatApi,
  sendRCReadTagApi,
  sendRCTextMessageApi,
  sendResumeRequestApi,
  sendRCSyncReadCountApi,
  submitExchangePhoneApi,
  submitIMExchangeTipsApi,
  agreeHrDeliverApi,
} from '@/apis/message'
import { TipsTypeEnum } from '@/components/Popup/warmTipsPopup'
import { OSS_STATIC_HOST } from '@/config'
import {
  hideMessageTypes,
  IChatExchangeRequestState,
  IChatExchangeStatus,
  IConversationStatus,
  IExchangeRequestExpansion,
  IExchangeRequestProps,
  IMCurrentMessageEvent,
  IMessage,
  IMReciveMessageEventPrefix,
  IMReciveUpdateExpansion,
  IMRoleType,
  IVerifyNotice,
  messageGroupTime,
  messageSendLimit,
  MessageType,
} from '@/def/message'
import { defaultUserInfo } from '@/def/user'
import { isTextContainsContact, popChatPrepareData, entryChatting } from '@/services/IMService'
import { dispatchMergeConversationInfoAction, useAppSelector } from '@/store'
import { sendHongBaoEvent } from '@/utils/dataRangers'
import { IMessageItemProps } from '@/weapp/message/components/MessageItem'
import { ITextMessageProps } from '@/weapp/message/components/TextMessage'

import { useRefuelPackagePopup, useWarmTipsPopup } from '../custom/usePopup'
import { useCurrentUserInfo } from '../custom/useUser'
import { useConversationItems } from './conversations'
import { useSpringWarPopup } from '@/components/Popup/goSpringWarPopup'

export * from './unreadCount'
export * from './followWx'
export * from './conversations'
export * from './chat'
export * from './commonlyWords'

const messageItemBody = {
  type: 1,
  canIncludeExpansion: false,
  isCounted: false,
  isOffLineMessage: true,
  isPersited: false,
  receivedStatus: 0,
  receivedTime: 0,
  senderUserId: '',
}

const debouncedSendRCReadTagApi = _.debounce(sendRCReadTagApi, 300)

// 会话各参数
export default function useChatInfo(targetId: string) {
  const eventKey = IMReciveMessageEventPrefix + targetId

  const currentUserRCId = useAppSelector(root => root.message.rcUserId)!
  const conversationItems = useConversationItems()
  const [showRefuelPackagePopup] = useRefuelPackagePopup()

  const prepareData = popChatPrepareData()

  const [chatStatus, setChatStatus] = useState<IConversationStatus>(prepareData.chatStatus!)
  const [messages, setMessages] = useState<IMessage[]>(prepareData.messageList)
  const [isNoMore, setIsNoMore] = useState<boolean>(prepareData.isNoMore)

  const [earliestMessageTime, setEarliestMessageTime] = useState<number>(
    prepareData.earliestMessageTime
  )

  // 加载历史消息
  async function loadHistoryMessages(): Promise<void> {
    const result = await fetchRCHistoryMessageList(targetId, earliestMessageTime, 10)
    setMessages(m => [...result.list, ...m])
    setIsNoMore(result.noMore)
    if (result.list?.[0].sentTime) {
      setEarliestMessageTime(result.list[0].sentTime)
    }
  }

  // 拉取历史消息
  async function fetchHistoryMessages(): Promise<any> {
    return await fetchRCHistoryMessageList(targetId, earliestMessageTime, 10)
  }

  // 插入历史消息
  async function unshiftHistoryMessages(historyMessages: any) {
    setMessages(m => [...historyMessages.list, ...m])
    setIsNoMore(historyMessages.noMore)
    if (historyMessages.list?.[0].sentTime) {
      setEarliestMessageTime(historyMessages.list[0].sentTime)
    }
  }

  // 是否可以发消息
  const canSendMessage: boolean = useMemo(() => chatStatus.remain_msg_times > 0, [
    chatStatus.remain_msg_times,
  ])

  // 发送消息
  async function sendTextMessage(content: string): Promise<IMessage> {
    if (isTextContainsContact(content)) {
      const textMessageTime = new Date().getTime()
      const verifyMessageTime = textMessageTime + 1

      const textMessageItem: IMessage = {
        ...messageItemBody,
        messageDirection: MessageDirection.SEND,
        messageType: MessageType.TEXT_MESSAGE,
        senderUserId: currentUserRCId,
        sentTime: textMessageTime,
        messageUId: String(textMessageTime),
        targetId: chatStatus.targetId,
        content: { content: content },
      }

      const verifyMessageItem: IMessage = {
        ...messageItemBody,
        messageDirection: MessageDirection.RECEIVE,
        messageType: MessageType.VERIFY_NOTICE,
        canIncludeExpansion: true,
        senderUserId: chatStatus.targetId,
        sentTime: verifyMessageTime,
        messageUId: String(verifyMessageTime),
        targetId: chatStatus.targetId,
        content: {
          messageText: content,
          messageUId: String(textMessageTime),
          tips: '',
          type: 'contact',
        },
      }

      setMessages(m => [...m, textMessageItem, verifyMessageItem])

      return textMessageItem
    }

    return sendRCTextMessageApi(targetId, content)
      .then(sentMessage => {
        setMessages(m => [...m, sentMessage])

        const newChatStatus = { ...chatStatus, remain_msg_times: chatStatus.remain_msg_times - 1 }

        // 我回复对方发的未回复消息时，只需设置 is_both_reply （旧版逻辑这里做解锁交换简历/手机号）
        if (!chatStatus.is_both_reply && chatStatus.initiator === IMRoleType.HR) {
          Object.assign(newChatStatus, { is_both_reply: true })
        }

        setChatStatus(newChatStatus)

        return sentMessage
      })
      .catch(err => {
        const nowTime = new Date().getTime()

        const sendFailedMessage: IMessage = err.data
        sendFailedMessage.messageUId = String(nowTime)

        const errorTips: IMessage = {
          ...messageItemBody,
          messageUId: String(nowTime + 1),
          messageDirection: MessageDirection.RECEIVE,
          messageType: MessageType.VERIFY_NOTICE,
          canIncludeExpansion: true,
          senderUserId: chatStatus.targetId,
          sentTime: nowTime + 1,
          targetId: chatStatus.targetId,
          content: {
            messageText: content,
            messageUId: String(nowTime),
            tips: '',
            type: 'failed',
          },
        }

        setMessages(m => [...m, sendFailedMessage, errorTips])

        return sendFailedMessage
      })
  }

  // 发送交换请求
  async function sendExchangeRequest(type: 'phone' | 'profile' | 'wechat'): Promise<IMessage> {
    const statusKey = `${type || 'phone'}_status`
    setChatStatus(s => ({ ...s, [statusKey]: IChatExchangeStatus.PENDING }))

    const requestFn =
      type === 'phone'
        ? sendExchangePhoneApi
        : type === 'wechat'
        ? sendExchangeWechatApi
        : sendResumeRequestApi

    return requestFn(chatStatus).then(sentMessage => {
      setMessages(m => [...m, sentMessage])

      return sentMessage
    })
  }

  // 发送直投简历
  async function sendResumeDirectly(isActive?: number): Promise<IMessage> {
    return directSendResumeApi(targetId, chatStatus).then(async sentMessage => {
      setMessages(m => [...m, sentMessage])
      // 前端将投递状态改为已投递
      const newChatStatus: IConversationStatus = {
        ...chatStatus,
        is_profile_applied: true,
        profile_status: IChatExchangeStatus.AGREE,
        requestProfileStatus: IChatExchangeStatus.AGREE,
      }

      let popState
      if (isActive) {
        popState = await saveCheerApi()
      }
      if (popState) {
        showRefuelPackagePopup({ level: popState })
        newChatStatus.talentPortrait = `${OSS_STATIC_HOST}/mp/activity/talentPortrait.png`
      }

      setChatStatus(newChatStatus)

      return sentMessage
    })
  }

  // 同意或拒绝交换请求
  async function confirmExchangeRequest(
    messageBody: IExchangeRequestProps,
    isAgree: boolean
  ): Promise<void> {
    await submitExchangePhoneApi(messageBody, isAgree)

    const displayMessages: IMessage[] = messages
    const messageIndex = displayMessages.findIndex(t => t.messageUId === messageBody.messageUId)

    const newState = isAgree ? IChatExchangeRequestState.AGREED : IChatExchangeRequestState.REFUSED
    const messageItem = displayMessages[messageIndex]

    // 设置请求消息的状态
    setMessages(
      R.update(messageIndex, {
        ...messageItem,
        expansion: { ...messageItem.expansion, state: newState },
      }) as any
    )

    // 设置聊天状态
    const statusKey =
      messageItem.messageType === MessageType.EXCHANGE_PHONE_REQUEST
        ? 'phone_status'
        : messageItem.messageType === MessageType.EXCHANGE_WECHAT_REQUEST
        ? 'wechat_status'
        : messageItem.messageType === MessageType.SEND_PROFILE_FILE_REQUEST
        ? 'requestProfileStatus'
        : 'profile_status'

    // 附件简历需要额外设置一下 conversation 状态来更新提示 + 发一条消息
    if (messageBody.messageType === MessageType.SEND_PROFILE_FILE_REQUEST) {
      submitIMExchangeTipsApi(chatStatus, 'attachment', isAgree)
      dispatchMergeConversationInfoAction(targetId, {
        requestProfileStatus: IChatExchangeStatus.ENABLE,
        profile_status: IChatExchangeStatus.ENABLE,
      })
    }

    // 投递状态保持交交换请求状态一致
    setChatStatus(s => {
      const newChatStatus = {
        ...s,
        [statusKey]: isAgree ? IChatExchangeStatus.AGREE : IChatExchangeStatus.ENABLE,
      }

      if (statusKey === 'requestProfileStatus') {
        newChatStatus.profile_status = isAgree
          ? IChatExchangeStatus.AGREE
          : IChatExchangeStatus.ENABLE
      } else if (statusKey === 'profile_status') {
        newChatStatus.requestProfileStatus = isAgree
          ? IChatExchangeStatus.AGREE
          : IChatExchangeStatus.ENABLE
      }

      if (
        (messageItem.messageType === MessageType.SEND_PROFILE_FILE_REQUEST && isAgree) ||
        messageItem.messageType === MessageType.DIRECT_APPLY_CARD
      ) {
        newChatStatus.is_profile_applied = true
      }

      return newChatStatus
    })
  }

  // 点击附件简历 Tips 的拒绝 or 同意按钮
  async function confirmAttachmentRequest(isAgree: boolean): Promise<void> {
    if (isAgree) {
      sendResumeDirectly().then(() => {
        dispatchMergeConversationInfoAction(targetId, {
          requestProfileStatus: IChatExchangeStatus.AGREE,
        })
      })
    }
  }

  // 消息列表 item
  const messageList: IMessage[] = useMemo(() => {
    const lastReadMessageTime =
      conversationItems.find(item => item.targetId === targetId)?.hr_last_read_time || 0

    const displayMessages = messages.filter(
      item => !hideMessageTypes.includes(item.messageType as MessageType)
    )

    const verifyMessages = messages.filter(item => item.messageType === MessageType.VERIFY_NOTICE)
    const verifyMessagesMap = R.indexBy(
      (item: IVerifyNotice) => item.content.messageUId,
      verifyMessages
    )

    let tempMessages: IMessage[] = [...displayMessages]
    const newDisplayMessages: IMessage[] = tempMessages.map(item => {
      return R.clone({
        ...item,
        messageType: item.messageType as MessageType,
        showTime: false,
      })
    })

    let readTagBeforeTime = 0

    let invalidPhoneBeforeTime = 0
    let invalidResumeBeforeTime = 0

    for (let i = newDisplayMessages.length - 1; i >= 0; --i) {
      const item = newDisplayMessages[i]
      // 修复补丁，职位下线或者切换职位后，根据失效消息强制附加失效状态
      if (
        [MessageType.OFFLINE_NOTICE, MessageType.SWITCH_JOB].includes(
          item.messageType as MessageType
        ) &&
        invalidPhoneBeforeTime <= 0
      ) {
        invalidPhoneBeforeTime = item.sentTime
      }
      if (
        [MessageType.OFFLINE_NOTICE, MessageType.SWITCH_JOB].includes(
          item.messageType as MessageType
        ) &&
        invalidResumeBeforeTime <= 0
      ) {
        invalidResumeBeforeTime = item.sentTime
      }

      if (
        item.messageType === MessageType.EXCHANGE_PHONE_REQUEST &&
        (item.expansion?.state || IChatExchangeRequestState.REQUEST) ===
          IChatExchangeRequestState.REQUEST &&
        item.sentTime < invalidPhoneBeforeTime
      ) {
        Object.assign(item.expansion!, { state: IChatExchangeRequestState.DISABLED })
      }
      if (
        item.messageType === MessageType.SEND_RESUME_REQUEST &&
        item.expansion!.state === IChatExchangeRequestState.REQUEST &&
        item.sentTime < invalidResumeBeforeTime
      ) {
        Object.assign(item.expansion!, { state: IChatExchangeRequestState.DISABLED })
      }

      // 收到对方消息或已读通知后，之前的消息全部设为已读
      if (
        readTagBeforeTime <= 0 &&
        item.messageDirection === MessageDirection.RECEIVE &&
        item.messageType === MessageType.TEXT_MESSAGE
      ) {
        readTagBeforeTime = item.sentTime
      }
      // 自己发送的消息附加已读未读状态
      if (
        item.messageDirection === MessageDirection.SEND &&
        item.messageType === MessageType.TEXT_MESSAGE &&
        item.sentTime <= Math.max(readTagBeforeTime, lastReadMessageTime)
      ) {
        ;(item as ITextMessageProps).isReceipt = true
      }

      // 每 15 分钟聚合一次消息
      if (i <= 0) {
        // 最顶部消息必定展示时间
        ;(item as IMessageItemProps).showTime = true
      } else {
        const upperMessage = newDisplayMessages[i - 1]
        ;(item as IMessageItemProps).showTime =
          item.sentTime - upperMessage.sentTime >= messageGroupTime
      }

      // 附加审核回执
      if (item.messageUId in verifyMessagesMap) {
        const verifyInfo = verifyMessagesMap[item.messageUId]

        ;(item as ITextMessageProps).sendFailedVerityNotice = verifyInfo as IVerifyNotice
      }
    }

    return newDisplayMessages
  }, [conversationItems, messages, targetId])

  // 收到消息
  const watchNewMessage = useCallback(
    (message: IMessage) => {
      // 收到消息的处理函数
      setMessages(m => [...m, message])

      eventCenter.trigger(IMCurrentMessageEvent)

      // 清除未读数
      clearRCUnreadCountApi(targetId)
      sendRCSyncReadCountApi(targetId, message.sentTime)

      // 非已读回执、审核回调的场合
      if (
        ![MessageType.READ_RECEIPT, MessageType.VERIFY_NOTICE, MessageType.TOP_NOTICE].includes(
          message.messageType as MessageType
        ) &&
        message.messageDirection === MessageDirection.RECEIVE
      ) {
        // 发送已读回执
        debouncedSendRCReadTagApi(targetId, message.messageUId, message.sentTime)
      }

      // 收到文字消息后，重置剩余发送数量
      if (
        message.messageDirection === MessageDirection.RECEIVE &&
        message.messageType === MessageType.TEXT_MESSAGE
      ) {
        setChatStatus(s => ({ ...s, remain_msg_times: messageSendLimit }))
      }

      // 对方回复我发起的未被回复过的消息时，只需设置 is_both_reply （旧版逻辑这里做解锁交换简历/手机号）
      if (
        message.messageType === MessageType.TEXT_MESSAGE &&
        !chatStatus.is_both_reply &&
        chatStatus.initiator === IMRoleType.USER &&
        message.messageDirection === MessageDirection.RECEIVE
      ) {
        setChatStatus(s => ({ ...s, is_both_reply: true }))
      }
      // 主动投递或同意发送简历都需要关闭发送简历入口，直投卡片状态同步
      if (
        [MessageType.SEND_PROFILE_FILE_AGREE, MessageType.SEND_RESUME_AGREE].includes(
          message.messageType as MessageType
        )
      ) {
        setChatStatus(s => ({ ...s, requestProfileStatus: IChatExchangeStatus.AGREE }))
      }
      // 电话同意/拒绝请求，重设状态
      if (
        [MessageType.EXCHANGE_PHONE_AGREE, MessageType.EXCHANGE_PHONE_DISAGREE].includes(
          message.messageType as MessageType
        )
      ) {
        setChatStatus(s => ({ ...s, phone_status: IChatExchangeStatus.ENABLE }))
      }
      // 微信同意/拒绝请求，重设状态
      if (
        [MessageType.EXCHANGE_WECHAT_AGREE, MessageType.EXCHANGE_WECHAT_DISAGREE].includes(
          message.messageType as MessageType
        )
      ) {
        setChatStatus(s => ({ ...s, wechat_status: IChatExchangeStatus.ENABLE }))
      }
      if ([MessageType.SEND_RESUME_DISAGREE].includes(message.messageType as MessageType)) {
        setChatStatus(s => ({ ...s, profile_status: IChatExchangeStatus.ENABLE }))
      }
      if ([MessageType.SEND_PROFILE_FILE_DISAGREE].includes(message.messageType as MessageType)) {
        setChatStatus(s => ({ ...s, requestProfileStatus: IChatExchangeStatus.ENABLE }))
        dispatchMergeConversationInfoAction(targetId, {
          requestProfileStatus: IChatExchangeStatus.ENABLE,
        })
      } else if (MessageType.SEND_PROFILE_FILE_REQUEST === (message.messageType as MessageType)) {
        setChatStatus(s => ({ ...s, requestProfileStatus: IChatExchangeStatus.PENDING }))
        dispatchMergeConversationInfoAction(targetId, {
          requestProfileStatus: IChatExchangeStatus.PENDING,
        })
      }

      // 切换职位、职位下线时、系统告知请求失效时，更新状态
      if (
        [
          MessageType.EXCHANGE_PHONE_INVALID,
          MessageType.SEND_RESUME_INVALID,
          MessageType.SEND_PROFILE_FILE_INVALID,
          MessageType.EXCHANGE_WECHAT_INVALID,
          MessageType.ONLINE_NOTICE,
          MessageType.OFFLINE_NOTICE,
          MessageType.JOB_CARD,
          MessageType.EXCHANGE_WECHAT_AGREE,
          MessageType.SEND_RESUME_AGREE,
          MessageType.SEND_RESUME_DISAGREE,
          MessageType.SEND_RESUME_DIRECTLY,
          MessageType.SEND_PROFILE_FILE_AGREE,
        ].includes(message.messageType as MessageType)
      ) {
        setTimeout(() => {
          fetchChattingStatusApi(targetId)?.then(newStatus => {
            setChatStatus(s => ({ ...s, ...newStatus }))
            entryChatting(newStatus.hr_id, { jobId: newStatus.jd_id, targetId })
            dispatchMergeConversationInfoAction(targetId, {
              requestProfileStatus: newStatus.requestProfileStatus,
              profile_status: newStatus.profile_status,
            })
          })
        }, 200)
      }
    },
    [chatStatus, targetId]
  )

  // 收到扩展消息
  const watchExpansion = useCallback(
    (message: IUpdatedExpansion) => {
      // 当前消息列表找不到，跳过处理逻辑
      const messageIndex = messages.findIndex(t => t.messageUId === message.messageUId)
      if (messageIndex <= -1) {
        return
      }

      // 收到扩展消息后，如果是同意、拒绝、下线的情况，重设 conversation 来刷新标记
      if (
        ![IChatExchangeRequestState.REQUEST, '4'].includes(
          (message.expansion as IExchangeRequestExpansion).state
        )
      ) {
        dispatchMergeConversationInfoAction(targetId, {
          requestProfileStatus: IChatExchangeStatus.ENABLE,
        })
      }

      const messageItem = messages[messageIndex]

      // 更新原消息卡片状态
      setMessages(
        R.update(messageIndex, {
          ...messageItem,
          expansion: { ...messageItem.expansion, state: Number(message.expansion.state) },
        }) as any
      )
      // 求完整简历同意
      if ([MessageType.SEND_PROFILE_FILE_REQUEST].includes(message.expansion.type as MessageType)) {
        setTimeout(() => {
          fetchChattingStatusApi(targetId)?.then(newStatus => {
            setChatStatus(s => ({ ...s, ...newStatus }))
          })
        })
      }
    },
    [messages, targetId]
  )

  // 注册监听器
  useEffect(() => {
    eventCenter.on(eventKey, watchNewMessage)
    eventCenter.on(IMReciveUpdateExpansion, watchExpansion)

    return () => {
      eventCenter.off(eventKey)
      eventCenter.off(IMReciveUpdateExpansion)
    }
  }, [eventKey, watchExpansion, watchNewMessage])

  const openAcitivityPopup = () => {}

  return {
    messageList,
    chatStatus,
    isNoMore,
    canSendMessage,
    loadHistoryMessages,
    sendTextMessage,
    sendExchangeRequest,
    sendResumeDirectly,
    confirmExchangeRequest,
    fetchHistoryMessages,
    unshiftHistoryMessages,
    confirmAttachmentRequest,
  }
}

// 打开活动弹窗
export const useOpenActivityPopup = () => {
  const userInfo = useCurrentUserInfo() || defaultUserInfo
  const [open] = useWarmTipsPopup()
  const { checkAndShowSpringModal } = useSpringWarPopup()

  const openDeliveryPop = (chat_id?: number) => {
    /* open({
      mode: TipsTypeEnum.AWARD,
      text: `今日再投递${needDeliver}个职位即可参与抽奖`,
      subText: '最高1888元现金等你来拿',
      strongText: '1888元',
      tipsText: `已有<b class="stronger">${joinCount}</b>个求职者参与抽奖`,
    }) */
    checkAndShowSpringModal(chat_id)
  }
  const openRedPacketPop = (amount = 0) => {
    let commonEventParams = {
      event_name: '已同意发送完整简历弹窗',
      type: '医药人升职季',
    }
    sendHongBaoEvent('EventPopupExpose', {
      ...commonEventParams,
    })
    open({
      title: '已同意发送完整简历',
      mode: TipsTypeEnum.AWARD,
      text: `累积红包+${amount}`,
      subText: '同意次数越多，红包越大',
      highLightText: `+${amount}`,
      tipsText: '可在「我的-我的奖品」页内查看红包详情',
      onConfirm: () => {
        sendHongBaoEvent('EventPopupClick', {
          ...commonEventParams,
          button_name: '我知道了',
        })
      },
    })
  }

  // C端主动开聊 是否展示获取抽奖资格弹窗
  const showDrawPop = useMemo(() => userInfo.stage === 1 && userInfo.isDraw === 0, [userInfo])
  // hr主动开聊 是否展示红包累积弹窗
  const showRedPacketPop = useMemo(() => userInfo.stage === 1 && userInfo.isDraw === 1, [userInfo])

  const openActivityPopup = useCallback(
    (initiator: IMRoleType, chat_id: number) => {
      if (initiator === IMRoleType.USER) {
        if (showDrawPop) {
          openDeliveryPop(chat_id)
        }
      }
      if (showRedPacketPop) {
        return agreeHrDeliverApi(chat_id).then(res => {
          openRedPacketPop(res.amount)
        })
      }
      return Promise.resolve()
    },
    [showDrawPop, showRedPacketPop, openDeliveryPop, openRedPacketPop]
  )

  return { openActivityPopup }
}
