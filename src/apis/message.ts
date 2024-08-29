import { ConversationType } from '@rongcloud/imlib-v4'
import R from 'ramda'

import { IJob } from '@/def/job'
import {
  ExchangeRequestType,
  IChatExchangeRequestState,
  IConversation,
  IConversationStatus,
  IMAuthInfo,
  IMessage,
  IConversationUserInfoRecords,
  MessageType,
  ICommonlyWord,
  IGreetingWord,
  IGreetingWordGroup,
  IExchangeRequestProps,
  IRecommendCount,
} from '@/def/message'
import { getIMClient } from '@/services/IMService'
import appStore from '@/store'
import { reportLog } from '@/utils/reportLog'

import Client from './client'

interface chatResObj {
  chatId: string
  targetId: string
}

// 初始化 IM 用户身份
export async function fetchIMTokenApi(): Promise<IMAuthInfo> {
  return Client({
    url: '/ymtd-user/im/initUser',
    method: 'POST',
    reportAddTags: ['core', 'im'],
  }).then(res => ({
    rc_user_id: res.rcUserId,
    user_id: res.userId,
    token: res.token,
  }))
}

// 拉取融云端指定时间以前的会话列表
export async function fetchRCConversationListApi(startTime: number): Promise<IConversation[]> {
  return getIMClient().Conversation.getList({ count: 10, startTime: Math.max(startTime, 0) })
}

// 根据 targetId 批量获取用户名、头像等
export async function listChatUserInfoApi(ids: string[]): Promise<IConversationUserInfoRecords> {
  return Client({
    url: '/rongcloud/target-users',
    data: { target_rc_user_id: ids.join(',') },
    reportAddTags: ['core', 'im'],
  })
    .then((result: any) => {
      setTimeout(() => {
        if (result.length < ids.length) {
          reportLog('api', 'core', `req:/rongcloud/target-users`).error(
            'IM 拉取用户头像名字不完整',
            '请求 IDs:',
            ids.join(','),
            '返回结果:',
            result
          )
        }
      }, 0)

      return result.reduce(
        (previous, current) => ({
          ...previous,
          [current.rc_user_id]: {
            ...current,
            targetId: current.rc_user_id,
            hr_name: current.name,
            hr_avatar: current.avatar,
            company_name: current.company_name,
            requestProfileStatus: current.profile_status,
          },
        }),
        {}
      )
    })
    .catch(() => ({}))
}

// 根据对方 targetId 获取会话状态
export async function fetchChattingStatusApi(
  target_rc_user_id: string
): Promise<IConversationStatus> {
  return Client({
    url: '/rongcloud/chat-info',
    data: { target_rc_user_id },
    reportAddTags: ['core', 'im'],
  }).then(res => ({
    ...res,
    targetId: target_rc_user_id,
  }))
}

// 拉取融云历史消息
export async function fetchRCHistoryMessageList(
  targetId: string,
  timestamp: number,
  count: number = 10
): Promise<{ list: IMessage[]; noMore: boolean }> {
  return getIMClient()
    .Conversation.get({ targetId, type: ConversationType.PRIVATE })
    .getMessages({ timestamp, count })
    .then(res => ({ list: res.list as IMessage[], noMore: !res.hasMore }))
    .then(res => {
      if (process.env.DEBUG_MESSAGE === 'on') {
        console.log(
          '★ 拉取融云历史消息：',
          ' targetId:',
          targetId,
          ' timestamp:',
          timestamp,
          ' noMore:',
          res.noMore,
          ' list:',
          res.list
        )
      }

      return res
    })
}

// 拉取消息订阅状态（公众号关注状态）
export async function fetchIsFollowWxApi(): Promise<boolean> {
  return Client({ url: '/wechat/follow-official' }).then(res => res['follow-official'])
}

// 拉取未读消息提醒剩余订阅次数
export async function fetchMessageNoticeRestTimes(): Promise<number> {
  return Client({ url: '/wechat/msg-unread/remain-times' }).then(res => res['remain-times'])
}

// 订阅消息提醒
export async function subscribeMessageNotice(): Promise<void> {
  return Client({ url: '/wechat/msg-unread/subscribe', method: 'PUT' })
}

// 拉取职位卡片信息
export async function fetchChattingJobCardInfoApi(jd_id: number): Promise<IJob> {
  return Client<IJob>({ url: `/jds/${jd_id}` })
  // TODO:
  // return Client<IJob>({ url: `/rongcloud/jd/${jd_id}` })
}

// 同意交换手机号后，获取对方手机号码
export async function fetchChattingPhoneNumberApi(chat_id: number): Promise<string> {
  return Client({ url: '/rongcloud/target-phone', data: { chat_id } }).then(res => res.phone)
}

// 同意交换微信号后，获取对方微信号
export async function fetchChattingWechatNumberApi(chat_id: number): Promise<string> {
  return Client({ url: '/rongcloud/target-wechat', data: { chat_id } }).then(res => res.wechat)
}

// 拉取融云端未读消息数
export async function fetchRCAllUnreadCountApi(): Promise<number> {
  return getIMClient().Conversation.getTotalUnreadCount(false, [ConversationType.PRIVATE])
}

// 拉取融云端指定会话的未读消息数
export async function fetchRCChatUnreadCountApi(targetId: string): Promise<number> {
  return getIMClient()
    .Conversation.get({ targetId, type: ConversationType.PRIVATE })
    .getUnreadCount()
}

// 清空指定会话的未读消息数
export async function clearRCUnreadCountApi(targetId: string): Promise<void> {
  return getIMClient().Conversation.get({ targetId, type: ConversationType.PRIVATE }).read()
}

// 发送同步未读消息
export async function sendRCSyncReadCountApi(
  targetId: string,
  timestamp: number
): Promise<IMessage> {
  return getIMClient()
    .Conversation.get({ targetId, type: ConversationType.PRIVATE })
    .send({
      messageType: MessageType.SYNC_READ_STATUS,
      content: { lastMessageSendTime: timestamp },
    }) as Promise<IMessage>
}

export interface IInitChatApiOptions {
  /** 开聊职位 ID */
  jdId: number
  /** 开聊目标用户 ID */
  targetUserId?: number
  /** 开聊时是否直接投递 */
  sendProfile?: boolean
  /** 开聊时使用招呼语 */
  greetIndex?: number
  /** （2023-03-09 婉莹 ABTest 需求）开聊时职位卡片来源 */
  flowSource?: 'recommendApply' | undefined
  /**开聊时直接交换电话 */
  exchangeMobile?: boolean
}

// 发起沟通
export async function initChatApi(option: IInitChatApiOptions): Promise<chatResObj> {
  const data = { ...option }
  data.sendProfile = Boolean(data.sendProfile)

  return Client({
    url: '/ymtd-user/im/initChat',
    data,
    method: 'POST',
    reportAddTags: ['core', 'im'],
  }).then(res => {
    return {
      chatId: res.chatId,
      targetId: res.targetRcUserId,
    }
  })
}

// 发送文字消息
export async function sendRCTextMessageApi(targetId: string, content: string): Promise<IMessage> {
  return getIMClient().Conversation.get({ targetId, type: ConversationType.PRIVATE }).send({
    messageType: MessageType.TEXT_MESSAGE,
    content: { content },
  }) as Promise<IMessage>
}

// 发送交换手机号请求
export async function sendExchangePhoneApi(chatInfo: IConversationStatus): Promise<IMessage> {
  const { targetId, jd_id } = chatInfo
  const candidateName = appStore.getState().resume?.name || ''

  const date = new Date()
  date.setDate(date.getDate() + 7)

  return getIMClient()
    .Conversation.get({ targetId, type: ConversationType.PRIVATE })
    .send({
      messageType: MessageType.EXCHANGE_PHONE_REQUEST,
      content: {
        content: '您请求与对方交换电话',
        jd_id: String(jd_id),
        expired: String(date.getTime()),
        type: ExchangeRequestType.PHONE,
      },
      canIncludeExpansion: true,
      expansion: {
        state: IChatExchangeRequestState.REQUEST,
        jd_id: String(jd_id),
        expired: String(date.getTime()),
        type: String(ExchangeRequestType.PHONE),
      },
      // @ts-ignore
      pushConfig: { pushTitle: candidateName },
      pushContent: `${candidateName}申请和你交换电话，请查看`,
    }) as Promise<IMessage>
}

// 发送投递简历请求
export async function sendResumeRequestApi(chatInfo: IConversationStatus): Promise<IMessage> {
  const { targetId, jd_id } = chatInfo
  const candidateName = appStore.getState().resume?.name || ''

  const date = new Date()
  date.setDate(date.getDate() + 7)

  return getIMClient()
    .Conversation.get({ targetId, type: ConversationType.PRIVATE })
    .send({
      messageType: MessageType.SEND_RESUME_REQUEST,
      content: {
        content: '您请求向对方投递简历',
        jd_id: String(jd_id),
        expired: String(date.getTime()),
        type: ExchangeRequestType.RESUME,
      },
      canIncludeExpansion: true,
      expansion: {
        state: IChatExchangeRequestState.REQUEST,
        jd_id: String(jd_id),
        expired: String(date.getTime()),
        type: String(ExchangeRequestType.RESUME),
      },
      // @ts-ignore
      pushConfig: { pushTitle: candidateName },
      pushContent: `${candidateName}申请向你投递简历，请查看`,
    }) as Promise<IMessage>
}

// 发送交换微信号请求
export async function sendExchangeWechatApi(chatInfo: IConversationStatus): Promise<IMessage> {
  const { targetId, jd_id } = chatInfo
  const candidateName = appStore.getState().resume?.name || ''

  const date = new Date()
  date.setDate(date.getDate() + 7)

  return getIMClient()
    .Conversation.get({ targetId, type: ConversationType.PRIVATE })
    .send({
      messageType: MessageType.EXCHANGE_WECHAT_REQUEST,
      content: {
        content: '您请求与对方交换微信',
        jd_id: String(jd_id),
        expired: String(date.getTime()),
        type: ExchangeRequestType.WECHAT,
      },
      canIncludeExpansion: true,
      expansion: {
        state: IChatExchangeRequestState.REQUEST,
        jd_id: String(jd_id),
        expired: String(date.getTime()),
        type: String(ExchangeRequestType.WECHAT),
      },
      // @ts-ignore
      pushConfig: { pushTitle: candidateName },
      pushContent: `${candidateName}申请和你交换微信，请查看`,
    }) as Promise<IMessage>
}

// 同意或拒绝交换手机号/简历
export async function submitExchangePhoneApi(
  message: IExchangeRequestProps,
  isAgree: boolean
): Promise<void> {
  const targetId = message.targetId

  const updateExpansion: any = {
    type: [MessageType.SEND_RESUME_REQUEST, MessageType.SEND_PROFILE_FILE_REQUEST].includes(
      message.messageType
    )
      ? ExchangeRequestType.RESUME
      : message.messageType === MessageType.EXCHANGE_PHONE_REQUEST
      ? ExchangeRequestType.PHONE
      : ExchangeRequestType.WECHAT,
    state: isAgree ? IChatExchangeRequestState.AGREED : IChatExchangeRequestState.REFUSED,
  }

  if (message.content.sourceMsgUID) {
    updateExpansion.sourceMsgUID = message.content.sourceMsgUID
  }

  return getIMClient()
    .Conversation.get({ targetId, type: ConversationType.PRIVATE })
    .updateMessageExpansion(updateExpansion, R.clone(message))
}

// 同意或拒绝交换电话/投递附件，用于 Tips 点击同意/拒绝
export async function submitIMExchangeTipsApi(
  chatInfo: { chat_id: number },
  type: 'phone' | 'attachment',
  isAgree: boolean
): Promise<string> {
  return Client({
    url: '/ymtd-capp/im/updateBehaviorState',
    method: 'POST',
    data: { chatId: chatInfo.chat_id, type: type === 'attachment' ? 1 : 2, state: isAgree ? 1 : 2 },
  })
}

// 发送已读回执
export async function sendRCReadTagApi(
  targetId: string,
  messageUId: string,
  lastMessageSendTime: number
): Promise<IMessage> {
  if (process.env.DEBUG_MESSAGE === 'on') {
    console.log(
      '★ 发送已读回执：',
      ' targetId:',
      targetId,
      ' messageUId:',
      messageUId,
      ' lastMessageSendTime:',
      lastMessageSendTime
    )
  }

  return getIMClient()
    .Conversation.get({ targetId, type: ConversationType.PRIVATE })
    .send({
      messageType: MessageType.READ_RECEIPT,
      content: { messageUId, lastMessageSendTime, type: 1 },
      isCounted: false,
      isPersited: false,
    }) as Promise<IMessage>
}

// 更新融云扩展消息
export async function sendRCExpansionUpdateApi(message: IMessage, data: Object): Promise<void> {
  const targetId = message.targetId

  return getIMClient()
    .Conversation.get({ targetId, type: ConversationType.PRIVATE })
    .updateMessageExpansion(data, message)
}

// 直投企业检查直投是否可用
export async function checkDirectApplyEnableApi(chat_id: number): Promise<boolean> {
  return Client({ url: '/rongcloud/' + chat_id + '/apply-restrict' }).then(res => !res.restrict)
}

// 直投企业直投简历
export async function directSendResumeApi(
  targetId: string,
  chatInfo: IConversationStatus
): Promise<IMessage> {
  const { jd_id, jd_name, md_profile_id } = chatInfo
  const candidateName = appStore.getState().resume?.name || ''

  return getIMClient()
    .Conversation.get({ targetId, type: ConversationType.PRIVATE })
    .send({
      messageType: MessageType.SEND_RESUME_DIRECTLY,
      content: { jd_id, jd_name, md_profile_id },
      // @ts-ignore
      pushConfig: { pushTitle: candidateName },
      pushContent: `${candidateName}向您的职位投递了简历，期待回复`,
    }) as Promise<IMessage>
}

// 拉取常用语列表
export async function listCommonlyWordListApi(): Promise<ICommonlyWord[]> {
  return Client({ url: '/ymtd-user/user/commonwords' })
}

// 添加常用语
export async function addCommonlyWordApi(content: string): Promise<ICommonlyWord> {
  return Client({
    url: '/ymtd-user/user/commonwords/add',
    method: 'POST',
    data: { content },
  }).then(res => ({ ...res, commonWordsType: 1 }))
}

// 更新常用语
export async function updateCommonlyWordApi(
  content: string,
  commonWordsId: number
): Promise<ICommonlyWord> {
  return Client({
    url: '/ymtd-user/user/commonwords/update',
    method: 'POST',
    data: { content, commonWordsId },
  })
}

// 删除常用语
export async function deleteCommonlyWordApi(commonWordsId: number): Promise<void> {
  return Client({
    url: '/ymtd-user/user/commonwords/remove',
    method: 'POST',
    data: { commonWordsId },
  })
}

// 拉取招呼语
export async function liseGreetingWordApi(): Promise<IGreetingWordGroup[]> {
  return Client({ url: '/ymtd-user/user/greetings' })
}

// 设置招呼语
export async function setGreetingWordApi(check: number): Promise<void> {
  return Client({
    url: '/ymtd-user/user/greetings/set',
    method: 'POST',
    data: { check },
  })
}

// 新建招呼语
export async function addGreetingWordApi(content: string): Promise<IGreetingWord> {
  return Client({
    url: '/ymtd-user/user/greetings/add',
    method: 'POST',
    data: { content },
  }).then(res => ({ checked: false, ...res }))
}

// 更新招呼语
export async function updateGreetingWordApi(content: string, greetId: number): Promise<void> {
  return Client({
    url: '/ymtd-user/user/greetings/update',
    method: 'POST',
    data: { content, greetId },
  })
}

// 删除招呼语
export async function deleteGreetingWordApi(greetId: number): Promise<void> {
  return Client({
    url: '/ymtd-user/user/greetings/remove',
    method: 'POST',
    data: { greetId },
  })
}

// 是否沟通过
export const fetchQueryHaveChat = (): Promise<number> =>
  Client({ url: '/ymtd-bapp/hr/queryHaveChat' })

// 获取对方微信号
export const targetUserWechatApi = (chatId: number): Promise<number> =>
  Client({ url: `/ymtd-capp/api/rongcloud/targetUserWechat?chatId=${chatId}` })

//保存自己微信号
export async function saveWechatApi(wechat: string): Promise<void> {
  return Client({
    url: '/ymtd-capp/api/rongcloud/saveWechat',
    method: 'POST',
    data: { wechat },
  })
}

// 查看推荐数量
export const fetchRecommendCount = (): Promise<IRecommendCount> =>
  Client({ url: '/ymtd-capp/promote/getRecommendCount' })

// 春战获取抽奖资格
export const fetchCanDraw = (chat_id?: number): Promise<{
  isCan:boolean,
  needDeliver: number
  joinCount: number
}> => Client({ url: `/ymtd-capp/dragonSpringWar/canDraw?chatId=${chat_id || ''}` })

// 春战领取现金红包
export const agreeHrDeliverApi = (
  chatId: number
): Promise<{
  amount: number
}> => Client({ url: '/ymtd-capp/im/agreeHrDeliver', method: 'POST', data: { chatId } })
