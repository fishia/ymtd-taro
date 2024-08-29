import { View, Image } from '@tarojs/components'
import { getStorageSync, setStorageSync } from '@tarojs/taro'
import c from 'classnames'
import dayjs from 'dayjs'
import React, { useImperativeHandle, useState } from 'react'

import LoginButton from '@/components/LoginButton'
import { ADS_POPUP_DATE } from '@/config'
import { PopupMode } from '@/def/common'
import { selectTitle } from '@/hooks/custom/usePopup'
import { increasePopupOpenTimes } from '@/services/PopupService'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'
import { jumpOldUrl } from '@/utils/utils'

import { FullScreenPopupState } from '../index'

import './index.scss'

export const fullScreenPopupEventKey = 'fullScreenPopup'

export type IFullScreenPopupProps = FullScreenPopupState

const FullScreenPopup = (p, ref) => {
  useImperativeHandle(ref, () => ({
    open,
    close,
  }))
  const [state, setState] = useState<FullScreenPopupState>({ isOpened: false })
  const {
    route,
    showClear = true,
    className,
    isOpened,
    onClose,
    bg_image,
    onConfirm = () => {
      if (route) {
        jumpOldUrl(route)
      }
    },
    closeIconStyle,
    title,
    children,
    overlayClickClose,
  } = state
  const currentDay = dayjs().format('YYYY-MM-DD')
  const close = () => {
    onClose && onClose()
    if (selectTitle(title)) setStorageSync(`${ADS_POPUP_DATE}+${state?.key}`, currentDay)
    if (title?.includes('品牌')) {
      setStorageSync('employerPopOpened', true)
    }
    setState({ isOpened: false })
  }

  const updateOpenState = (props: FullScreenPopupState, key?: string) => {
    increasePopupOpenTimes(PopupMode.FULLSCREEN_OPEN_TIMES, key)
    setState({ ...props, isOpened: true })
    sendDataRangersEventWithUrl('EventPopupExpose', {
      event_name: props.title,
      type: '首页弹窗',
    })
  }
  const open = (props: FullScreenPopupState) => {
    const { key: saveTimesKey } = props

    if (saveTimesKey) {
      if (selectTitle(props.title)) {
        if (getStorageSync(ADS_POPUP_DATE) !== currentDay) {
          updateOpenState(props, saveTimesKey)
        }
      } else {
        updateOpenState(props, saveTimesKey)
      }
    }
  }

  const handleConfirm = () => {
    onConfirm && onConfirm()
    close()
  }
  const overlayClickHandle = () => {
    if (overlayClickClose) {
      sendDataRangersEventWithUrl('EventPopupClick', {
        event_name: title || '',
        button_name: '关闭',
      })
      close()
    }
  }

  return (
    <View className={c(className, 'hd-popup', { 'hd-popup--active': isOpened })}>
      <View className="hd-popup__overlay" onClick={overlayClickHandle} />
      <View className={c({ 'hd-popup__container': !children }, { 'hd-popup__custom': children })}>
        {children ? (
          <View style={{ height: '100%' }}>{children}</View>
        ) : (
          bg_image && (
            <LoginButton className="loginBtnCss" onClick={handleConfirm}>
              <Image
                src={bg_image}
                className="hd-popup__bg_image"
                mode="widthFix"
                // onClick={handleConfirm}
              />
            </LoginButton>
          )
        )}
        {showClear && (
          <View
            className={c('hd-popup__close at-icon at-icon-close')}
            style={closeIconStyle}
            onClick={close}
          />
        )}
      </View>
    </View>
  )
}

export default React.forwardRef(FullScreenPopup)
