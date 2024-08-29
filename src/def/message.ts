import { IAReceivedConversation, IAReceivedMessage } from '@rongcloud/imlib-v4'

import { IProps } from './common'

// IM 监听消息触发事件前缀
export const IMReciveMessageEventPrefix = 'IMReciveMessage_'

// IM 监听到扩展消息变更
export const IMReciveUpdateExpansion = 'IMReciveExpansion'

// IM 连接成功全局事件名称
export const IMConnectSuccessEvent = 'IMConnectSuccessEvent'

// IM 当前聊天消息监听全局事件名称
export const IMCurrentMessageEvent = 'IMCurrentMessageEvent'

// IM 消息聚合时间间隔
export const messageGroupTime = 15 * 60 * 1000

// 连续发送消息限制
export const messageSendLimit = 10

// 非法词汇列表，2023-03-21 移除前端敏感词判断，统一使用数美
export const illegalWords: RegExp[] = []

// IM 用户信息
export interface IMAuthInfo {
  user_id: number
  rc_user_id: string
  token: string
}

// 原始会话状态
export interface IConversation extends IAReceivedConversation {}

// 会话列表中的已读状态
export interface IConversationReadStatus {
  hr_last_read_time: number
}

// 已存储的会话用户信息
export interface IStoragedConversationUserInfo extends IConversationReadStatus {
  targetId: string
  hr_avatar: string
  company_name: string
  hr_name: string
  talentTag?: string
  talentPortrait?: string
  activity_portrait?: string
  requestProfileStatus: IChatExchangeStatus
  profile_status: IChatExchangeStatus
}

// 已存储的会话用户信息记录表
export type IConversationUserInfoRecords = Record<string, IStoragedConversationUserInfo>

// 会话列表中的 Item 数据
export interface IConversationItem extends IStoragedConversationUserInfo, IConversation {}

// 聊天发起人身份
export enum IMRoleType {
  HR = 'hr',
  USER = 'user',
}

// 会员等级
export enum MemberLevel {
  NORMAL = 1,
  VIP,
  TRIAL,
  RECRUIT_MANAGE,
  VIP_SEVEN_DAYS,
  INTERNAL_STAFF,
  VIP_TRAFFIC_PACKAGE, //会员套餐
}

// 自定义会话（聊天室）状态
export interface ICustomConversationStatus {
  user_id: number
  chat_id: number
  jd_id: number
  jd_name: string
  hr_id: number
  profile_status: IChatExchangeStatus
  phone_status: IChatExchangeStatus
  wechat_status: IChatExchangeStatus
  requestProfileStatus: IChatExchangeStatus
  onlineJdNum: number
  initiator: IMRoleType
  is_both_reply?: boolean
  remain_msg_times: number
  is_direct_apply?: boolean
  is_profile_applied?: boolean
  md_profile_id: string
  is_priority_jd: number
  is_free: MemberLevel
  wechat?: string
  reply_reward_status?:number
}

// 会话（聊天室）状态
export interface IConversationStatus extends IConversationItem, ICustomConversationStatus {}

// 交换简历/电话的状态
export enum IChatExchangeStatus {
  DISABLE_UNTIL_BOTH_RESPONESE = 0, // 双方回复后可用
  ENABLE, // 可用
  PENDING, // 请求中
  AGREE, // 已同意
  DISAGREE, // 已拒绝
  OFFLINE, // 职位已下线
}

// 交换简历/电话请求的状态
export enum IChatExchangeRequestState {
  REQUEST = '0', // 通常
  AGREED = '1', // 已同意
  REFUSED = '2', // 已拒绝
  DISABLED = '3', // 已失效
}

// 消息类别
export enum MessageType {
  TEXT_MESSAGE = 'RC:TxtMsg', // 文本消息
  INFO_NOTICE = 'RC:InfoNtf', // 系统通知
  EXPANSION_MESSAGE = 'RC:MsgExMsg', // 扩展消息
  READ_RECEIPT = 'RC:ReadNtf', // 已读消息回执
  SYNC_READ_STATUS = 'RC:SRSMsg', // 已读状态多端同步

  VERIFY_NOTICE = 'YMTD:VERIFY_TEXT', // 文字审核回执
  JOB_CARD = 'YMTD:JD_CARD', // 职位卡片
  SWITCH_JOB = 'YMTD:JD_SWITCH', // 切换职位
  TOP_NOTICE = 'YMTD:MSG_TOP', // 置顶消息
  JD_NAME = 'YMTD:JD_NAME', // BApp 专用的职位名称提示消息
  ONLINE_NOTICE = 'YMTD:JD_ONLINE', // 职位上线
  OFFLINE_NOTICE = 'YMTD:JD_OFFLINE', // 职位下线
  NEW_ONLINE_NOTICE = 'YMTD:CHAT_FIND_JD_ONLINE', // 新职位重新上线

  EXCHANGE_PHONE_REQUEST = 'YMTD:EXCHANGE_PHONE', // 交换电话请求
  EXCHANGE_PHONE_AGREE = 'YMTD:EXCHANGE_PHONE_AGREE', // 同意交换电话
  EXCHANGE_PHONE_DISAGREE = 'YMTD:EXCHANGE_PHONE_DISAGREE', // 拒绝交换电话
  EXCHANGE_PHONE_INVALID = 'YMTD:EXCHANGE_PHONE_DISABLE', // 交换电话已失效

  SEND_RESUME_REQUEST = 'YMTD:APPLY_RESUME', // 投递请求
  SEND_RESUME_AGREE = 'YMTD:APPLY_RESUME_AGREE', // 同意投递
  SEND_RESUME_DISAGREE = 'YMTD:APPLY_RESUME_DISAGREE', // 拒绝投递
  SEND_RESUME_INVALID = 'YMTD:APPLY_RESUME_DISABLE', // 投递已无效

  SEND_RESUME_DIRECTLY = 'YMTD:DIRECT_APPLY_RESUME', // 直投简历
  DIRECT_APPLY_CARD = 'YMTD:DIRECT_APPLY_CARD', // 直投提示卡片

  SEND_PROFILE_FILE_REQUEST = 'YMTD:REQUEST_PROFILE', // 求简历原件
  SEND_PROFILE_FILE_AGREE = 'YMTD:REQUEST_PROFILE_AGREE', // 同意发送简历原件
  SEND_PROFILE_FILE_DISAGREE = 'YMTD:REQUEST_PROFILE_REFUSE', // 拒绝发送简历原件
  SEND_PROFILE_FILE_INVALID = 'YMTD:REQUEST_PROFILE_DISABLE', // 发送简历原件请求已失效

  EXCHANGE_WECHAT_REQUEST = 'YMTD:EXCHANGE_WECHAT', // 交换微信请求
  EXCHANGE_WECHAT_AGREE = 'YMTD:EXCHANGE_WECHAT_AGREE', // 同意交换微信
  EXCHANGE_WECHAT_DISAGREE = 'YMTD:EXCHANGE_WECHAT_DISAGREE', // 拒绝交换微信
  EXCHANGE_WECHAT_INVALID = 'YMTD:EXCHANGE_WECHAT_DISABLE', // 交换微信已失效
}

// 不在消息对话中显示的消息类别
export const hideMessageTypes: MessageType[] = [
  MessageType.EXPANSION_MESSAGE,
  MessageType.READ_RECEIPT,
  MessageType.TOP_NOTICE,
  MessageType.JD_NAME,
]

// 原始消息类型
export interface IMessage extends Omit<IAReceivedMessage, 'messageType'> {
  messageType: MessageType
}

// 对话上下文中，点击同意或拒绝触发弹窗时的详细配置项
export interface IChatContextSubmitExchangeRequestOptions {}

// 对话上下文数据
export interface IChatContext
  extends Omit<IStoragedConversationUserInfo, 'targetId'>,
    ICustomConversationStatus {
  self_avatar: string
  onClickSendResume(): Promise<boolean>
  onClickExchangePhone(): Promise<boolean>
  onClickExchangeWechat(): Promise<boolean>
  onClickSendProfileFile(isAgree: boolean): Promise<boolean>
  submitExchangeRequest(
    messageBody: IMessage,
    isAgree: boolean,
    options?: IChatContextSubmitExchangeRequestOptions
  ): Promise<void>
  confirmSendProfileFile(): Promise<boolean>
  isActive?: number
  openActivityPopup?: () => void
  openDeliveryPop?: (needDeliver?: number, joinCount?: number) => void
  openRedPacketPop?: (amount?: number) => void
}

// 消息列表里的消息
export interface IMessageItem extends IProps, IMessage, IChatContext {
  activityHRPortrait?: string
  activityUserPortrait?: string
}

// 已读回执消息体
export interface IReadTagMessageContent {
  lastMessageSendTime: number
  messageUId: string
}

// 已读回执
export interface IReadTagMessage extends IMessageItem {
  messageType: MessageType.READ_RECEIPT
  content: IReadTagMessageContent
}

// 消息审核不通过的原因
export enum MessageSendFailedReasons {
  INCLUDE_SENSITIVE_WORDS = 'forbidden', // 含违禁词
  INCLUDE_CONTACT = 'contact', // 含联系方式
  SEND_FAILED = 'failed', // 网络等原因发送失败
}

// 消息审核消息体扩展字段
export interface IVerifyNoticeExpansion {
  state: IChatExchangeRequestState
}

// 消息审核回调消息体
export interface IVerifyNoticeContent {
  messageUId: string
  type: MessageSendFailedReasons
  tips: string
  messageText: string
}

// 消息审核回调
export interface IVerifyNotice extends IMessageItem {
  messageType: MessageType.VERIFY_NOTICE
  content: IVerifyNoticeContent
  canIncludeExpansion: true
  expansion: IVerifyNoticeExpansion
}

// 交换请求类别
export enum ExchangeRequestType {
  PHONE = MessageType.EXCHANGE_PHONE_REQUEST, // 交换电话
  RESUME = MessageType.SEND_RESUME_REQUEST, // 投递
  PROFILE_FILE = MessageType.SEND_PROFILE_FILE_REQUEST, // 附件简历
  WECHAT = MessageType.EXCHANGE_WECHAT_REQUEST, // 交换微信
}

// 交换请求消息体
export interface IExchangeRequestContent {
  content: string
  jd_id: string
  expired: string
  type: ExchangeRequestType
  // 医脉·数科 消息互通：如果消息来自其他端，则有此字段，值等于原始消息的 ID
  sourceMsgUID?: string
}

// 交换请求消息扩展
export interface IExchangeRequestExpansion {
  state: IChatExchangeRequestState
  jd_id: string
  expired: string
  type: ExchangeRequestType
}

// 交换请求消息
export interface IExchangeRequestProps extends IMessageItem {
  messageType:
    | MessageType.EXCHANGE_PHONE_REQUEST
    | MessageType.SEND_RESUME_REQUEST
    | MessageType.SEND_PROFILE_FILE_REQUEST
    | MessageType.EXCHANGE_WECHAT_REQUEST
  content: IExchangeRequestContent
  canIncludeExpansion: true
  expansion: IExchangeRequestExpansion
}

// 直投提示卡片中的状态
export enum SendResumeDirectlyCardStateEnum {
  NORMAL = '0',
  AGREE = '1',
  INVALID = '2',
  REFUSE = '3',
}

// 直投卡片消息体
export interface ISendResumeTipsCardContent {
  // 医脉·数科 消息互通：如果消息来自其他端，则有此字段，值等于原始消息的 ID
  sourceMsgUID?: string
}

// 直投提示卡片消息扩展
export interface ISendResumeTipsCardExpansion {
  state: SendResumeDirectlyCardStateEnum
}

// 直投提示卡片消息
export interface ISendResumeTipsCardProps extends IMessageItem {
  messageType: MessageType.DIRECT_APPLY_CARD
  content: ISendResumeTipsCardContent
  canIncludeExpansion: true
  expansion: ISendResumeTipsCardExpansion
}

// 直投消息消息体
export interface ISendResumeDirectlyContent {
  jd_id: number
  jd_name: string
}

// 直投消息
export interface ISendResumeDirectlyRequest extends IMessageItem {
  messageType: MessageType.SEND_RESUME_DIRECTLY
  content: ISendResumeDirectlyContent
}

// 新上线提示消息
export interface INewOnlineNoticeMessage extends IMessageItem {
  messageType: MessageType.NEW_ONLINE_NOTICE
  content: { jdName: string }
}

// 常用语消息类型
export interface ICommonlyWord {
  commonWordsId: number
  content: string
  /** 0: 系统预置； 1: 用户自行添加 */
  commonWordsType: 0 | 1
}

// 招呼语消息类型
export interface IGreetingWord {
  value: number
  content: string
  checked: boolean
}

// 招呼语分组
export interface IGreetingWordGroup extends IGreetingWord {
  greetList: IGreetingWord[]
}

// 推荐数量
export interface IRecommendCount {
  favoriteCount: number
  favoriteName: string | null
  favoriteTime: string | null
  newCompanyJdCount: number
  newJdCompanyName: string | null
  newJdCompanyTime: string | null
  viewCount: number
  viewName: string | null
  viewTime: string | null
}
