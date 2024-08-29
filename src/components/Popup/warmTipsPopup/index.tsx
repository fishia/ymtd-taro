import { View, Image } from '@tarojs/components'
import c from 'classnames'
import React, { useImperativeHandle, useState } from 'react'

import { taroHighLightOrStrongText } from '@/services/StringService'

import { PopupState } from '../index'

import './index.scss'

export const warmTipsPopupEventKey = 'warmTipsPopup'

export enum TipsTypeEnum {
  NORMAL, // 常用模式
  DELIVERY, // 主动投递
  AWARD, // 获得红包奖励
}

interface WarmTipsPopupContentProps {
  text?: string
  subText?: string
  tipsText?: string
  strongText?: string
  highLightText?: string
}

export interface WarmTipsPopupState extends PopupState, WarmTipsPopupContentProps {
  mode?: TipsTypeEnum
}

const WarmTipsPopup = (props, ref) => {
  useImperativeHandle(ref, () => ({
    open,
    close,
  }))

  const [state, setState] = useState<WarmTipsPopupState>({ isOpened: false })
  const {
    className,
    isOpened,
    onClose,
    onConfirm,
    overlayClickClose,
    mode = TipsTypeEnum.NORMAL,
    icon = 'https://kr-ymtd.oss-cn-beijing.aliyuncs.com/mp/common/question.png',
    title = '投递成功',
    text,
    subText,
    tipsText,
    showClear = true,
    strongText = '',
    highLightText = '',
    confirmText = '我知道了',
  } = state

  const close = () => {
    onClose && onClose()
    setState({ isOpened: false })
  }

  const open = (props: WarmTipsPopupState) => {
    // sendDataRangersEventWithUrl('EventExpose', {
    //   event_name: TipsTypeEnumData[level],
    // })
    setState({ ...props, isOpened: true })
  }

  const handleConfirm = () => {
    onConfirm && onConfirm()
    setState({ isOpened: false })
  }

  const overlayClickHandle = () => {
    if (overlayClickClose) {
      close()
    }
  }

  return (
    <View
      className={c(className, 'hd-WarmTipsPopup', {
        'hd-WarmTipsPopup--active': isOpened,
      })}
    >
      <View className="hd-WarmTipsPopup__overlay" onClick={overlayClickHandle} />
      <View className={c('hd-WarmTipsPopup__container')}>
        {title && <View className="hd-WarmTipsPopup__title">{title}</View>}
        <Image src={icon} className="hd-WarmTipsPopup__image" mode="scaleToFill" />
        {text && (
          <View
            className={c('hd-WarmTipsPopup__text', { strongText: mode === TipsTypeEnum.AWARD })}
            dangerouslySetInnerHTML={{
              __html: taroHighLightOrStrongText(text, highLightText, strongText),
            }}
          />
        )}
        {subText && (
          <View
            className="hd-WarmTipsPopup__subText"
            dangerouslySetInnerHTML={{
              __html: taroHighLightOrStrongText(subText, highLightText, strongText),
            }}
          />
        )}
        {tipsText && (
          <View
            className="hd-WarmTipsPopup__tipsText"
            dangerouslySetInnerHTML={{
              __html: taroHighLightOrStrongText(tipsText, highLightText, strongText),
            }}
          />
        )}
        <View className="hd-WarmTipsPopup__btn" onClick={handleConfirm}>
          {confirmText}
        </View>
        {showClear && (
          <View
            className="hd-WarmTipsPopup__close icon iconfont iconclose"
            onClick={() => setState({ isOpened: false })}
          />
        )}
      </View>
    </View>
  )
}

export default React.forwardRef(WarmTipsPopup)
