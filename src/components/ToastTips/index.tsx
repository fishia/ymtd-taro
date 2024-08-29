import { View, Image } from '@tarojs/components'
import c from 'classnames'
import React, { ReactNode } from 'react'

import blackClose from '@/assets/imgs/close.svg'
import { IProps } from '@/def/common'

import closeIcon from '../QualityPositionPopup/close.svg'

import './index.scss'

export interface IToastTipsProps extends IProps {
  visible?: boolean
  placement?: string //todo 方向待确定
  content?: string | ReactNode
  onClose?: (e) => void
  isBlackClose?: boolean // 黑色关闭按钮
}

const ToastTips: React.FC<IToastTipsProps> = props => {
  const {
    visible = false,
    content = '主动发起沟通可获得更多简历曝光哦！',
    className,
    onClose,
    style,
    isBlackClose = false,
  } = props

  const closeHandler = e => {
    if (onClose) onClose(e)
  }
  return (
    <View
      className={c(
        'toast-tips',
        {
          'toast-tips--active': visible,
        },
        className
      )}
      style={style}
    >
      <Image
        className="toast-tips__close"
        onClick={closeHandler}
        src={isBlackClose ? blackClose : closeIcon}
      />
      <View className="toast-tips__wrap">
        <View className="toast-tips__arrow"></View>
        <View className="toast-tips__text">{content}</View>
      </View>
    </View>
  )
}

export default ToastTips
