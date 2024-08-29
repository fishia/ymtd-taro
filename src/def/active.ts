import { ICompany, IJob, IEventExposeParams } from '@/def/job'

import { IList, IProps } from './common'

export interface ActiveListProps {
  ads: AdsProps
  aggregations: AggregationsProps
  background: AdListDetail
  companies: CompaniesProps
  jds: CompaniesProps
  promotional_image: AdListDetail
  activity_name: string
  description?: { city_id: number; city_name: string }
}

export interface AdsProps {
  title: string
  list: Array<AdListDetail>
}

export interface AdListDetail {
  image: string
  link: string
}

export interface AggregationsProps {
  companies: number
  hits: number
  jds: number
}

export interface CompaniesProps {
  title: string
  list: Array<any>
}

export interface CompanyCardProps {
  showMore: boolean
  detail: detailProps
}

export interface detailProps extends IJob {
  hits: number
  id: number
  image?: any
  industries: Array<industriesItem>
  jd_num: number
  logo: string
  name: string
  scale: number
  scale_name: string
  type: number
  type_name: string
  short_name?: string
  jds: IJds[]
}

export interface IJds extends industriesItem {
  salary: string
  salary_type: string
}
export interface industriesItem {
  id: number
  name: string
}
export interface ILuckyDraw {
  canJoin: boolean
  verifyResult: 'pass' | 'reject'
  activityUrl?: string
}

export interface IMeetingInfo {
  id: number | string
  image?: string
  title: string
  startDate?: string
  endDate?: string
  status?: ActiveButtonType
  companyIdList?: Array<number>
  extendUrl?: string
}

export enum ActiveButtonType {
  NotStarted, //未开始
  SignUp, //未开始已报名
  InProgress, //进行中
  IsEnd, //已结束
}

export interface IMeetingCompany extends ICompany {
  jds?: Array<IJob & { status: ActiveButtonType }>
  jd_count?: number
}

export interface IMeetingDetail {
  id: number
  displayPattern?: number
  companiesNum?: number
  jdsNum?: number
  bannerList?: Array<string>
  title?: string
  liveDate?: string
  status?: ActiveButtonType
  releaseVersion?: number
  shareTitle?: string
}

export interface IActiveSearch {
  page?: number
  type?: number
}

export interface IActiveEventParams {
  event_name: string
  event_rank: string | number
}

export interface IMeetingCompanyList extends IList<IMeetingCompany> {}

export interface IJobCardProps extends IProps {
  disabled?: boolean //是否停止招聘
  pageName?: string
  data: IJob
  className?: string
  simple?: boolean
  date?: boolean
  keyword?: string
  onClick?: (id: number | null, tip?: string | null) => void
  //JobCardAdsPopupProps?: PopupState
  active?: boolean
  showTop?: boolean //是否直接展示置顶标签，推荐职位、搜索职位列表需要判断是不是召回策略
  showChatBtn?: boolean
  relativeToClassName?: string
  eventExposeParams?: IEventExposeParams
  btnText?: string
  isActive?: number
  appendLoginTips?: boolean
  openObserverMode?: boolean // 是否开启卡片监控埋点
  showPopup?: boolean // 是否展示搜索卡片
  footerTips?: string
  isDeliverButton?: boolean
  isShowResumeSticky?: boolean // 是否展示简历置顶广告在feed流
  isShowJobAreaBlock?: boolean // 未登录时第一个卡片上面展示是在某城市找工作的卡片
  isShowJobRecommedBlock?: boolean // 未登录时在第五个卡片下面展示职位推荐不精准卡片
  isShowRecommedJobCardBlock?: boolean // 首页以及金刚区点击按钮后卡片下方出现对应的职位推荐卡片(支持一键操作)
  recommedJobCardData?: IJob[]
  onClickIsShowRecommedJobCard?: (id: number)=> void
  onCloseRecommedJobCard?: (id?: number | null) => void
  onClickDetailRecommendBtn?: () => void
  zoneTitle?: string
  isShowRecommendListGuide?: boolean // 未登录推荐职位第10条引导登录卡片
  showSohoPopup?:boolean  // 是否展示简直soho卡片
}

// 简历置顶商品介绍
export interface IResumeStickyTop {
  /**
   * 使用简历置顶的人数
   */
  joinPersonCount: number
  /**
   * 元/天
   */
  amountPerDay: number | string
  /**
   * 原价(单位是分,不是元)
   */
  originalAmount: number | string
  /**
   * 折扣价(单位是分,不是元)
   */
  amount: number | string
  /**
   * 最近7天曝光次数
   */
  profileExposeCount: number
  /**
   * 曝光相对比例
   */
  relativePercent: string
  /**
   * 是否有抵用券
   */
  isDiscount: boolean
  /**
   * 抵用券名称
   */
  discountName: string
    /**
   * 限时多少折
   */
  discount: string
}

// 简历置顶支付api res
export interface IJsApiPrepay {
  appId: string
  timeStamp: string
  nonceStr: string
  packageVal: string
  signType: any
  paySign: string
}

export interface IAdsCompany {
  benefitTags: Array<string>
  id: number
  jdCount: number
  logo: string
  name:string
}
