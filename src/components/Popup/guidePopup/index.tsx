import React, { useImperativeHandle, useState } from 'react'
import { View } from '@tarojs/components'
import c from 'classnames'
import { increasePopupOpenTimes } from '@/services/PopupService'
import { PopupMode } from '@/def/common'
import { GuidePopupState } from '../index'
import GuideContent from './components/guideContent'
import './index.scss'

export const guidePopupEventKey = 'guidePopup'
const FullScreenPopup = (p, ref) => {
  useImperativeHandle(ref, () => ({
    open, close
  }))
  const [state, setState] = useState<GuidePopupState>({ isOpened: false })
  const {
    key,
    className,
    isOpened,
    onClose,
    overlayClickClose = true,
    ...restProps
  } = state

  const close = () => {
    onClose && onClose()
    setState({ isOpened: false })
  }

  const open = (props: GuidePopupState) => {
    const { key: saveTimesKey } = props
    if (saveTimesKey) {
      increasePopupOpenTimes(PopupMode.GUIDE_OPEN_TIMES, saveTimesKey)
    }
    setState({ ...props, isOpened: true })
  }

  const overlayClickHandle = () => {
    if (overlayClickClose) {
      close()
    }
  }
  const GuideContentProps: GuidePopupState = {
    ...restProps
  }
  return (
    <View className={c(className, 'hd-guidepopup', { 'hd-guidepopup--active': isOpened })}>
      <View className="hd-guidepopup__overlay" onClick={overlayClickHandle} />
      <View className="hd-guidepopup__container">
        <GuideContent {...GuideContentProps} />
      </View>
    </View>
  )
}

export default React.forwardRef(FullScreenPopup)
