import React, { useImperativeHandle, useState } from 'react'
import { View, Image } from '@tarojs/components'
import c from 'classnames'
import { AgainConfirmPopupState } from '../index'
import { OSS_STATIC_HOST } from '@/config'
import './index.scss'

export const againConfirmPopupEventKey = 'againConfirmPopup'

const AgainConfirmPopup = (p, ref) => {
  useImperativeHandle(ref, () => ({
    open, close
  }))
  const [state, setState] = useState<AgainConfirmPopupState>({ isOpened: false })
  const {
    className,
    text,
    buttonText,
    isOpened,
    onConfirm,
    onClose,
    overlayClickClose = true,
  } = state

  const closeUrl = OSS_STATIC_HOST + '/mp/sponsorImg/aginConfirmClose.png'

  const confirm = () => {
    onConfirm && onConfirm()
    setState({ isOpened: false })
  }

  const close = () => {
    onClose && onClose()
    setState({ isOpened: false })
  }

  const open = (props: AgainConfirmPopupState) => {
    setState({ ...props, isOpened: true })
  }

  const overlayClickHandle = () => {
    if (overlayClickClose) {
      close()
    }
  }

  return (
    <View className={c(className, 'hd-againConfirmpopup', { 'hd-againConfirmpopup--active': isOpened })}>
      <View className="hd-againConfirmpopup__overlay" onClick={overlayClickHandle} />
      <View className="hd-againConfirmpopup__container">
        <Image
          className='hd-againConfirmpopup__close'
          src={closeUrl}
          onClick={close}
        />
        <View className="hd-againConfirmpopup__content">{text}</View>
        <View
          className='hd-againConfirmpopup__confirmButton'
          onClick={confirm}
        >{buttonText}</View>
      </View>
    </View>
  )
}

export default React.forwardRef(AgainConfirmPopup)
