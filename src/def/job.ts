import { IList, IPager, IAdress, IPair } from './common'

// 后端接口
export interface ICompany {
  id: number
  name: string
  logo: string
  type: number
  type_name: string
  industries: IPair[]
  scale: number
  scale_name: string
  short_name: string
  secret_name?: string
  recruits_number?: number // 公司详情在招职位数
  jd_num?: number // 在招职位
  positionNum?: number
  image?: string[]
  images?: string[]
  desc?: string
  jds?: IJob[]
  city?: string
  province?: string
  addresses?: IAdress[]
  address?: string
  is_open: number
  activityTagUrl?: string // 最佳品牌雇主label
  attractionTag?: string // 吸引力标签 - 职位 最多2条
}

// 公司主页公司信息
export interface INewCompany extends ICompany {
  companyTag?: string // 公司标签
  levelTag?: string // 公司级别标签
  productTag?: string
  shortName: string
  secretName?: string
  address?: string
  isCollect?: number // 是否收藏
  location?: Array<any>
  establishYear: string // 成立年份
  patternTags?: Array<string> // 工作模式
  benefitTags?: Array<string> // 福利标签
  productList?: Array<IProduct> //产品介绍
  industryNameList?: Array<string>
  stageName: string // 融资状态
  attachment?: string // pdf地址
  attachmentName?: string
  companySeniorList?: Array<ICompanySenior> // 高管介绍
}

export interface ICompanySenior {
  seniorName: string
  seniorDesc?: string
  seniorImage: string
}
// 职位状态
export enum JobStatusType {
  OK = 1, // 通常
  OFF_LINE, // 已下线
  VERIFYING, // 待审核
  DRAFTS, // 未上线
  NO_PASS, // 未通过
}
//职位类别
export enum JobType {
  HOT = 'hot', // 热门
  RECOMMAND = 'recommend', // 推荐
  PREDICTION = 'prediction', //冷启动
}

// 职位状态中文
export const JobStatusTextMap: Record<JobStatusType, string> = {
  [JobStatusType.OK]: '',
  [JobStatusType.OFF_LINE]: '已下线',
  [JobStatusType.VERIFYING]: '待审核',
  [JobStatusType.DRAFTS]: '草稿',
  [JobStatusType.NO_PASS]: '未通过审核',
}

// 职位模板类别
export enum JobTemplateType {
  DEFAULT_TEMPLATE = 0, // 默认
  MEDICAL_REPRESENTATIVE, // 医药代表
  COMMON_TEMPLATE, // 通用模板
}

// 职位性质类别
export enum JobPropertyType {
  FULL_TIME = 1, // 全职
  PART_TIME, // 兼职
  INTERNSHIP, // 实习
  SCHOOL_RECRUITMENT, // 校招
}

interface IJobDateInfo {
  created_at: string
  updated_at: string
}

// 职位搜索结果
export interface IJob extends IJobDateInfo, ISeriseTags {
  id: number
  name: string
  salary: string
  salary_month: string
  salary_type?: string // 薪资类型（例如：14薪）
  work_time: number
  work_time_name: string
  function_type_name?: string // 职位类型
  education: number
  education_name: string
  benefits: IPair[]
  company: ICompany
  hr: IHrInfo
  is_top?: boolean
  jd_type?: JobType
  addresses: IAdress[]
  desc?: string
  requirement?: string // 专业要求
  salary_structure?: string // 薪酬结构
  property?: JobPropertyType // 职位性质
  property_name?: string // 职位性质文字
  status?: JobStatusType // 职位状态
  status_name?: string
  major_require?: string // 专业需求
  jd: IJob // 职位收藏和职位记录用，为IJob
  template_type: JobTemplateType
  shield_company: {
    has_shield: boolean //false未屏蔽此公司，true已屏蔽此公司
    shield_id: number
  }
  is_priority: number //是否优先职位
  has_apply: number // 是否已经投递
  recallSource?: string
  activityTagUrl: string // 品牌雇主获奖label
  hasChatCurrentJd?: number
  activityTag?: string
  associatedTime?: string
  page_no?: number
  position_no?: number
  isSeed?: boolean // 是否查看过详情
  exposeId?: string
  expName?: string
  isVirtual?: number
  isHeadhuntingJd?: 0 | 1 //是否是猎头职位
  topStatus?: number //是否置顶
  refreshStatus?: number //是否刷新
  salesDone?: string // 销售调控
  tag?: string // 精选榜标签
}

// 职位详情页新增的外置招呼语一键发送
export interface IGreetingMapItem {
  index: number
  content: string
}

export interface IDefaultJob extends IJob {
  template_type: JobTemplateType.DEFAULT_TEMPLATE
}

// 职位详情 · 医药代表模板
export interface IMedicalRepresentativeJob extends IJob {
  template_type: JobTemplateType.MEDICAL_REPRESENTATIVE
  product_name?: string // 产品名称
  sales_terminal?: string // 销售终端
  area?: string // 负责区域
  product_direction?: string[] // 产品方向
  market_category?: string[] // 市场标签
  jd_level?: string[] // 岗位级别标签
  jd_highlights?: string[] // 职位亮点
  academic_experience?: string // 学术经验
  salary_composition?: string // 薪资构成
  keywords?: string[] //关键词
  highlights?: string[] // 通用模板-职位亮点
}

export enum JobFilterMap {
  COMPANY_SCALE = 'company_scale',
  COMPANY_TYPE = 'company_type',
  COMPANY_INDUSTRY = 'industry',
  WORK_TIME = 'work_time',
  JD_PROPERTY = 'jd_property',
  EDUCATION = 'education',
  SALARY_SCOPE = 'salary_scope',
}

export enum JobFilterIdMap {
  COMPANY_SCALE = 'company_scale',
  COMPANY_TYPE = 'company_type',
  COMPANY_INDUSTRY = 'industry',
  WORK_TIME = 'work_time',
  JD_PROPERTY = 'jd_property',
  EDUCATION = 'education',
  SALARY_SCOPE = 'salary_scope',
  TYPE = 'type',
  SCALE = 'scale',
}

export const ZonesJobFilterIdMap = {
  [JobFilterIdMap.COMPANY_SCALE]: 'companyScaleList',
  [JobFilterIdMap.COMPANY_TYPE]: 'companyTypeList',
  [JobFilterIdMap.COMPANY_INDUSTRY]: 'industryList',
  [JobFilterIdMap.WORK_TIME]: 'workYearList',
  [JobFilterIdMap.JD_PROPERTY]: 'jdPropertyList',
  [JobFilterIdMap.EDUCATION]: 'educationList',
  [JobFilterIdMap.SALARY_SCOPE]: 'expectSalaryList',
}

export enum JobFilterNameMap {
  COMPANY_SCALE = '公司规模',
  COMPANY_TYPE = '公司性质',
  COMPANY_INDUSTRY = '公司行业',
  WORK_TIME = '工作经验',
  JD_PROPERTY = '工作性质',
  EDUCATION = '学历要求',
  SALARY_SCOPE = '薪资范围',
}

export interface IJobList extends IList<IJob> {}

// 相关公司
export interface ICompantRelated extends ICompany {
  total: number
}

export interface ICompantRelatedList extends IList<ICompany> {}

enum SearchType {
  m = 'm',
  es = 'es', //后端通过es查询
}

// 搜索职位
export interface IJobSearch extends IPager {
  city_id?: number
  keyword?: string
  key_word_type?: string
  salary_scope?: number[]
  work_time?: number[]
  education?: number[]
  company_type?: number[]
  company_scale?: number[]
  jd_property?: number[]
  type?: SearchType
  industry?: number[]
  share_id?: number | string
  page?: number
  intent_id?: number
  v?: number //是否校园版
  pageSize?: number
  isHistorySearch?: number
  function_type?: string
  lastestId?: number
  tag?: string // 精选榜单
}

export interface IJobZonesSearch extends IPager {
  cityId?: number
  keyword?: string
  zones: number
  workYearList?: string[]
  expectSalaryList?: string[]
  educationList?: string[]
  jdPropertyList?: string[]
  status?: string
  industryList?: string[]
  companyTypeList?: string[]
  companyScaleList?: string[]
  tag?: string // 精选榜单
  v?: number //是否校园版
}

// banner
export interface IBanner {
  id: number
  image_url: string
  link_url?: string
  link_type?: number
  title?: string
}

export interface mpcFunctionTag {
  functionType: string
  functionName: string
}
// 专区icon位
export interface IZoneIcon {
  type: number
  name: string
  icon_url: string
  link_url?: string
  mpc_function_tags?: Array<mpcFunctionTag>
}

// 专区职位列表
export interface IZone extends IJob {
  is_top: boolean
  created_at: string
  updated_at: string
}
export interface IZoneJobList extends IList<IZone> {}

export interface ISeriseTags {
  behaviorTag?: string // 行为标签 - 职位 最多2条
  activeTag?: string // 行为标签-hr活跃标签
  replyTag?: string // 行为标签-hr回复标签
  newTag?: string // 新职位
  attractionTag?: string // 吸引力标签 - 职位 最多2条
}
export interface IHrInfo extends ISeriseTags {
  id: number
  name: string
  avatar: string
  active_time: string
  company_name: string
  position_name?: string
  identity?: string
  activityTagUrl?: string
  behaviorLabel?: string
  activityPortrait?: string
  phone?: string
}
export interface IJobDetailParams {
  page?: number
  index?: number
  id?: number
  type?: JobType
  jd_type?: string
  [key: string]: any
}
export interface IJobWithIndex extends IJob {
  page_no: number
  position_no: number
  isSeed?: boolean
  isVirtual?: number
}

export interface IEventExposeParams {
  jd_id?: number
  page_no?: number
  position_no?: number
  type?: JobType
  jd_type?: string
  is_preferred?: number
  is_top?: number
  icon_rank?: string
  keyword?: string
  search_city?: string
  expected_position?: string //意向职位
  expected_city?: string //意向城市
  button_name?: string
  isActive?: number
  page_name?: string
  prepage_name?: string
  exp_channel?: string //来源
  expose_id?: string
  expName?: string
  isSeed?: boolean // 是否看过详情
  isVirtual?: number // 职位类型
  is_priority?: number
  jd_status?: string // 职位类型
  is_fresh?: string // 是否刷新
  salesDone?: string // 销售调控
  hr_id?: string | number
}
export interface ICompanyJobsSearch extends IPager {
  v?: number
}

export interface IProduct {
  title: string
  desc?: string
  image: string
}
export interface IJavaJob {
  id?: number
  name?: string
  salaryFrom?: number
  salaryTo?: number
  salaryType?: string
  salaryInd?: number
  educationName?: string
  workTimeName?: string
  functionTypeName?: string
  jdKeywords?: IPair<number>[]
  tag?: string
}
export interface ICampusJudge {
  isCampus: boolean
  isCampusExpFull: boolean
  lastEduId?: number
}

export const virtualType = (virtual?: number) => (virtual ? '虚拟职位-医护' : '真实职位')

export interface IChoiseList {
  code: string
  desc1: string
  desc2: string
  name: string
  pic: string
  selectedPic: string
  tagNum: number
}
