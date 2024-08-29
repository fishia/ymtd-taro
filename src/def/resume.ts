import { IFormOption, IPair } from './common'
import { SexType } from './user'

export enum IntentWorkTypeEnum {
  FULL_TIME = 1,
  PART_TIME = 2,
}

export enum JobExpSecretEnum {
  VISIBLE = 0,
  HIDE = 1,
}

export interface IResumeExp {
  id: number
  profileId?: string
  startDate: string
  endDate: string
  duringDate: string[]
}

export interface IEducationExp extends IResumeExp {
  school: string
  schoolId: number
  education: string
  major?: string
  majorId?: number
  schoolExperience?: string
}

export interface IJobExp extends IResumeExp {
  company: string
  position: string
  workDesc?: string
  functionType: number
  functionTypeName: string
  keywords: IPair[]
  isShieldCompany: JobExpSecretEnum
}

export interface IProjectExp extends IResumeExp {
  name: string
  workDesc?: string
}

export interface IResumeBasicInfo {
  id?: string
  name: string
  avatar: string
  sex: SexType
  cityId: number
  cityName: string
  birthDate: string
  workBeginTime: string
  workBeginYear: number | string
  marryStatus?: string
  wechat?: string
  selfDescription?: string
  platForm?: string
}

export interface IResumeIntentInfo {
  id?: number
  workType: IntentWorkTypeEnum
  cityId: number
  cityName: string
  expectPosition: number
  expectPositionName: string
  expectSalary: number[]
  expectSalaryFrom: number
  expectSalaryTo: number
  keywords: IPair[]
  userStatus?: number
}

export const defaultResumeIntentInfo: IResumeIntentInfo = {
  workType: IntentWorkTypeEnum.FULL_TIME,
  cityId: 0,
  cityName: '',
  expectPosition: 0,
  expectPositionName: '',
  expectSalary: [],
  expectSalaryFrom: 0,
  expectSalaryTo: 0,
  keywords: [],
  userStatus: 0,
}

export interface IResume extends IResumeBasicInfo {
  id: string
  integrity: number
  isActivated: number // 0是用户自己创建的,1是还没同步, 2是同步成功
  intents: IResumeIntentInfo[]

  profileEdu: IEducationExp[]
  profileJob: IJobExp[]
  profileProject: IProjectExp[]
}

export interface IResumeForHomepage extends IResume {
  educations: IEducationExp[] //兼容老的数据结构，只有首页需要用到
  jobs: IJobExp[]
  projects: IProjectExp[]
}

export type INullableResume = Nullable<IResume>

export type INewExp<T extends IResumeExp> = Omit<T, 'id'>

export const defaultBasicInfo: IResumeBasicInfo = {
  name: '',
  avatar: '',
  sex: SexType.boy,
  cityId: 0,
  cityName: '',
  birthDate: '',
  workBeginTime: '',
  workBeginYear: '',
  wechat: '',
  marryStatus: '',
  selfDescription: '',
}

export const defaultResume: IResume = {
  id: '',
  integrity: 0,
  isActivated: 0,
  ...defaultBasicInfo,

  intents: [],

  profileEdu: [],
  profileJob: [],
  profileProject: [],
}

export const createDefaultEducation = (): IEducationExp =>
  ({
    startDate: '',
    endDate: '',
    duringDate: [],
    school: '',
    schoolId: 0,
    major: '',
    majorId: 0,
    education: '',
    schoolExperience: '',
  } as any)

export const createDefaultJob = (): IJobExp =>
  ({
    startDate: '',
    endDate: '',
    duringDate: [],
    company: '',
    position: '',
    workDesc: '',
    functionTypeName: '',
    functionType: 0,
    keywords: [],
    isShieldCompany: JobExpSecretEnum.HIDE,
  } as any)

export const createDefaultProject = (): IProjectExp =>
  ({
    startDate: '',
    endDate: '',
    duringDate: [],
    name: '',
    workDesc: '',
  } as any)

export const createDefaultIntent = () => ({ ...defaultResumeIntentInfo })

export type IResumeOptionsField =
  | 'education'
  | 'expect_salary'
  | 'marry_status'
  | 'mpc_status'
  | 'salary_scope'
  | 'salary_type'
  | 'sex'

export type IResumeOptions = Record<IResumeOptionsField, IFormOption[]>

export const defaultResumeOptions = {}

export interface IResumeIntegrity {
  required: {
    basic: boolean
    education: boolean
  }
  optional: {
    intent: boolean
    job: boolean
    project: boolean
  }
}

export interface IKeyword {
  id: number
  name: string
  keyword: ICurrentKeyword[]
}

export interface ICurrentKeyword {
  keyword_id: number
  keyword_name: string
  keyword_type_id?: number
}

//职位类别下的关键词
export interface IFunctionTypeKeyword {
  common: IKeyword[]
  custom: ICurrentKeyword[]
}
//查询类别、关键词类型
export declare type ISearchType = 'function_type' | 'keyword'
export interface ISelectItem {
  value: number | string
  label: string
}

//职位类别
export interface IFunctionType {
  function_type_top: ISelectItem
  function_type_all: ISelectItem[]
}

//自定义关键词传参
export interface IAddKeywordParams {
  profile_job_id: number
  function_type: string
  name: string
}

//管理求职意向列表
export interface IResumeIntentsInfo {
  intents: IResumeIntentInfo[]
  isMigrated?: number
}

export type INullableResumeIntentsInfo = Nullable<IResumeIntentsInfo>

export enum ProfileType {
  CREATE,
  NOSYNCS,
  SYNCS,
}

export interface IResumeAttachmentUploadResult {
  attUrl: string
  attName: string
  profileId: number
}
