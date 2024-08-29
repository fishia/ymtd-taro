import React, { useImperativeHandle, useState } from 'react'
import { View, Image, Button } from '@tarojs/components'
import c from 'classnames'
import money from '@/assets/imgs/popup/money.svg'
import { PopupState } from '../index'
import './index.scss'

export const luckyDrawPopupEventKey = 'luckyDrawPopup'

export interface LuckyDrawPopupState extends PopupState {
  content?: string
}

const LuckyDrawPopup = (p, ref) => {
  useImperativeHandle(ref, () => ({
    open, close
  }))
  const [state, setState] = useState<LuckyDrawPopupState>({ isOpened: false })
  const {
    route,
    showClear = false,
    className,
    isOpened,
    onClose,
    onConfirm,
    overlayClickClose,
    title = '创建完成',
    content = '快去领5-100元现金红包吧',
    confirmText = '领红包',
    cancelText
  } = state

  const close = () => {
    onClose && onClose()
    setState({ isOpened: false })
  }

  const open = (props: LuckyDrawPopupState) => {
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
    <View className={c(className, 'hd-luckyDrawPopup', { 'hd-luckyDrawPopup--active': isOpened })}>
      <View className="hd-luckyDrawPopup__overlay" onClick={overlayClickHandle} />
      <View className={c("hd-luckyDrawPopup__container")}>
        <Image src={money} className="hd-luckyDrawPopup__image" mode="scaleToFill" />
        <View className="hd-luckyDrawPopup__title">{title}</View>
        <View className="hd-luckyDrawPopup__content">{content}</View>
        <View className="hd-luckyDrawPopup__action">
          {
            cancelText &&
            <Button
              className="hd-luckyDrawPopup__action-cancel"
              onClick={close}
            >
              {cancelText}
            </Button>
          }
          <Button
            className="hd-luckyDrawPopup__action-confirm"
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </View>
        {showClear && (
          <View
            className="hd-luckyDrawPopup__close icon iconfont iconclose"
            onClick={() => {
              if (title === '创建完成')
                close()
              else
                setState({ isOpened: false })
            }}
          />
        )}
      </View>
    </View>
  )
}

export default React.forwardRef(LuckyDrawPopup)
