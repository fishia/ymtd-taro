import { IDataReport } from '@/utils/dataRangers'

import { IJobCategory, ILocation } from './common'

export enum SexType {
  secret = 0,
  boy = 1,
  girl = 2,
}

// 用户属性内联简历信息
export interface IProfile {
  id: string
  avatar: string
  sex?: SexType
  name: string // 简历个人姓名
  profiled_name: string // 简历名
  integrity: number // 完整度
  notification: boolean // 是否有最新动态
  apply_ids: number[] // 已投递职位 ID
  recommended_ids: number[] // 职位推荐 ID
  unread_apply_count: number
  unread_recommended_count: number
  isActivated?: number // 是否为集团人才库简历
  wechat?: string
}

export interface IUserInfo {
  id: number
  phone: string
  name: string
  account: string
  sex: SexType
  avatar: string
  points: number // 积分
  status: number // 状态
  profile?: IProfile // 简历
  intent: any
  is_intent: boolean
  intent_count: number
  is_open: boolean // 简历开放状态
  is_jd_recommend: boolean // 个性化推荐状态
  applies?: number // 【微信端已废弃】简历申请的职位总数
  apply_ids: number[] // 【微信端已废弃，移至 profile 字段】已投递职位id
  favorites: number // 【微信端已废弃】收藏职位个数
  favorite_ids: number[] // 已收藏职位id
  favorite_article_ids: number[] // 已收藏文章id
  favorite_company_ids: number[] // 已收藏公司id
  third_party: object // 第三方支持
  is_campus?: boolean //是否应届生
  haveChat?: number //是否沟通过
  talentTag?: string // 人才标签
  talentPortrait?: string //头像框
  attProfileName?: string // 附件简历文件名
  attProfileUrl?: string // 附件简历地址
  dragonAwardTab?: number // 是否展示活动页，奖品tab
  is_new?: boolean // 新老用户
  wechat?: string
  profileTop?: number // 是否有简历置顶
  profileTopADExpose?: number //是否展示置顶购买入口，弹窗/banner
  profileTopEffectDesc?: string // 简历置顶效果描述
  stage?: number // 春战活动状态
  isDraw?: number // 是否已抽过（1: 此前抽过，0：为第1次抽）
  isAddWecom?: number // 是否已添加微信（1: 已添加，0：未添加）
  isUnreadProfileMsg?: number // 是否有未读求完整简历消息（1: 已添加，0：未添加）
}

export type INullableUserInfo = Nullable<IUserInfo>

export const defaultUserInfo: IUserInfo = {
  id: 0,
  phone: '',
  name: '',
  account: '',
  sex: SexType.secret,
  avatar: '',
  points: 0,
  status: 0,
  profile: undefined,
  is_open: true,
  is_intent: false,
  intent_count: 0,
  is_jd_recommend: true,
  applies: 0,
  apply_ids: [],
  favorites: 0,
  favorite_ids: [],
  favorite_article_ids: [],
  favorite_company_ids: [],
  third_party: {},
  intent: undefined,
  is_campus: false,
  haveChat: 0,
  attProfileUrl: undefined,
  stage: 0,
  isDraw: 0,
  isAddWecom: 0,
}

export interface loginParams {
  phone: string
  verification_key: string
  verification_code: string
  ch?: string
  company_name?: string
}

export type ApplyStatusType = 'all' | 'viewed' | 'suitable' | 'unsuitable' | 'interest' | 'new'

export interface wxLoginParams {
  code: string
  encryptedData: string
  iv: string
  ab_sdk_version?: string
  platForm?: string
  sourceType?: string
  channelCode?: string
  eventName?: string // 专区活动埋点新增
  zoneName?: string
  consultantCode?: string  // 分享顾问code
}

export interface BasePureLoginParam {
  code: string
  encryptedData: string
  iv: string
}

export interface PureLoginParam extends BasePureLoginParam {}

export interface PureLoginResp {
  access_token: string
  token_type: string
}

export interface wxHRRegisterParms extends wxLoginParams, IDataReport {
  loginCode: string
}

export const defaultSubscribeStatus: ISubscribeStatus = {
  is_subscribe: false,
  cities: [],
  jobs: [],
  conditions: { cities: false, positions: false, wx: false },
}

export interface ISubscribeStatus {
  is_subscribe: boolean
  cities: ILocation[]
  jobs: IJobCategory[]
  conditions: {
    cities: boolean
    positions: boolean
    wx: boolean
  }
}
