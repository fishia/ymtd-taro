import {
  FULLSCREEN_OPEN_TIMES,
  FIXEDBOTTOM_OPEN_TIMES,
  ADD_FAVORITE_OPEN_TIMES,
  GUIDE_OPEN_TIMES,
  LUCKYDRAW_OPEN_TIMES,
  EMPLOYER_OPEN_TIMES,
  RESUME_SET_TOP_OPEN_TIMES
} from '@/config'

export interface IProps {
  children?: React.ReactNode
  className?: string
  id?: string
  style?: string | React.CSSProperties
  key?: string | number
  hidden?: boolean
  animation?: { actions: object[] }
  ref?: React.MutableRefObject<any> | null

  dangerouslySetInnerHTML?: {
    __html: string
  }
}

export interface IPair<TId = number | string> {
  id: TId
  name: string
}
export interface ILocation extends IPair<number> {
  jds?: boolean
  provinceId?: number
  city_id?: number
  regionId?: number
  cityName?: string
}

export const defaultLocation: ILocation = {
  id: 1, // 原城市id
  name: '全国',
  provinceId: -1,
  city_id: undefined,
  regionId: undefined,
}

export interface IJobCategory {
  id: number
  label: string
  value: string
  type?: number
  options?: IJobCategory[]
}

export interface IFormOption<TValue = string | number, TLabel = string | number> {
  value: TValue
  label: TLabel
}

export interface IChoose extends IPair {
  id: number | string
  name: string
  selected?: boolean
  options?: IChoose[]
  category?: IPair
}

// 页面状态
export enum PageStatus {
  INIT,
  LOADING,
  FINISHED,
  EMPTY,
  ERROR,
  OTHERS,
}

export type LoadStatusType = 'more' | 'loading' | 'noMore' | 'reload' | undefined

export interface IPager {
  page?: number
  pageSize?: number
  'per-page'?: number
}

export interface IList<T> {
  list: T[]
  current: number
  total: number
}

export type IRelationalType = 'jd' | 'company' | 'article' | 'name_cn' | 'major'

export type IRelational<F extends IRelationalType, T> = {
  action_name: string
  id: number
} & Record<F, T>

export interface IAdress {
  id: number
  province: string
  city: string
  address: string
  lng?: number
  lat?: number
}

export type TThinkJobCategory = {
  id: number
  value: string
  label: string
  parent_labels: string
  hit: string
  topLabel: string
  fillName: string
}

export enum ErrorCode {
  OPT_ERROR = 422002,
  NO_OPT = 422000,
  ON_SERVER_BUILD = 0,
}

// 功能Modal弹窗类型
export enum ModalMode {
  Normal,
  WithPicture,
}

// 营销Popup弹窗类型
export const PopupMode = {
  FULLSCREEN_OPEN_TIMES,
  FIXEDBOTTOM_OPEN_TIMES,
  ADD_FAVORITE_OPEN_TIMES,
  GUIDE_OPEN_TIMES,
  LUCKYDRAW_OPEN_TIMES,
  EMPLOYER_OPEN_TIMES,
  RESUME_SET_TOP_OPEN_TIMES,
}

export interface IContactInfo {
  name?: string
  phone?: string
  wx?: string
  email?: string
}

export interface IInputCurrent {
  value: string
  items: []
  setValue: (value: string) => void
  setIsConfirmed: (isConfirmed: boolean) => void
  setFocus: (value: boolean) => void
  setItems?: (value: []) => void
}

export enum IVersion {
  SCHOOL = 'school',
  NORAML = 'normal',
}

export interface ICityOption {
  id: number
  pId?: number
  name: string
  hotIndex?: number
  firstPinyin?: number
  list?: Array<ICityOption>
}

export interface IOptionItem {
  value: string
  label: string
  name?: string
  options?: IOptionItem[]
}
