import { CSSProperties, ReactNode } from 'react'

import { IProps } from '@/def/common'

import AddFavoritePopup from './addFavoritePopup'
import FixedBottomPopup from './fixedBottomPopup'
import FullScreenPopup from './fullScreenPopup'
import LoginPopup from './loginPopup'
import SharePopup from './sharePopup'

import { IrData } from '@/hooks/custom/useUser'

export { FullScreenPopup, LoginPopup, FixedBottomPopup, AddFavoritePopup, SharePopup }

export interface PopupState extends IProps {
  showClear?: boolean
  confirmText?: string
  rangersData?: IrData
  cancelText?: string
  isOpened?: boolean
  onClose?: Function
  onConfirm?: Function
  web_url?: string
  route?: string
  icon?: string
  bg_image?: string //背景
  tips_text?: string
  title?: string
  description?: string
  overlayClickClose?: boolean
  noLoginMode?: boolean //非登录
}

export interface LoginPopupState extends PopupState {}

export interface FullScreenPopupState extends PopupState {
  closeIconStyle?: CSSProperties
  key?: string
  maxOpenTimes?: number
}

export interface FixedBottomPopupState extends PopupState {
  title?: string
  closeIconStyle?: CSSProperties
  key?: string
  maxOpenTimes?: number
  carousel_images?: Array<string>
  current?: number //默认选中的图片索引
  onChange?(v): void
  needRecordEvent?: boolean
}

export interface AddFavoritePopupState extends PopupState {
  showTips?: boolean
  arrowRight?: number
  tipsWrapRight?: number
}

//营销弹窗权重类型
export interface PriorityPopState extends FixedBottomPopupState, FixedBottomPopupState {
  priority: number
  show: boolean
  PopupMode: string
  Unstoppable?: boolean // 是否阻塞
}
interface Position extends CSSProperties {}
export interface GuidePopupState extends FullScreenPopupState {
  arrowPhoto?: string
  arrowStyle?: Position
  text?: string | ReactNode
  textStyle?: Position
  buttonText?: string
  buttonStyle?: Position
  targetContent?: ReactNode | string
  targetContentStyle?: Position
  onCancel?: () => void
}

export type AgainConfirmPopupState = GuidePopupState
