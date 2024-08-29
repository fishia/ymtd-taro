import { View, Button, Text, ITouchEvent, Image } from '@tarojs/components'
import c from 'classnames'
import React, { useImperativeHandle, useState } from 'react'

import { IProps, ModalMode } from '@/def/common'
import { useHideModal } from '@/hooks/custom/useShowModal'

import './index.scss'

export const modalEventKey = 'modal'

export interface ModalState extends IProps {
  title?: string
  content: string | React.ReactElement
  cancelText?: string
  confirmText?: string
  closeOnClickOverlay?: boolean
  isOpened?: boolean
  onClose?: Function
  onCancel?: Function
  onConfirm?: Function
  onClickClose?: Function
  isWEB?: boolean
  mode?: ModalMode
  src?: string
  showClear?: boolean
  noCancel?: boolean
  description?: string
  closeNoCancel?: boolean
}

const Modal = (_p, ref) => {
  useImperativeHandle(ref, () => ({ open, close }))
  const closeModal = useHideModal()
  const [state, setState] = useState<ModalState>({ content: '', isOpened: false })
  const {
    title = '提示',
    content,
    cancelText = '取消',
    confirmText = '确定',
    closeOnClickOverlay = true,
    children,
    className,
    isOpened,
    onClose,
    onCancel,
    onConfirm,
    onClickClose,
    mode = ModalMode.Normal,
    src,
    showClear = true,
    noCancel = false,
    description = '',
    closeNoCancel,
  } = state

  const open = (props: ModalState) => {
    setState({ ...props, isOpened: true })
  }

  // 仅仅外部调用，内部不调用
  const close = () => {
    setState({
      isOpened: false,
      content: '',
      title: '提示',
      cancelText: '取消',
      confirmText: '确定',
      onCancel: undefined,
      onConfirm: undefined,
      onClickClose: undefined,
      closeOnClickOverlay: true,
      children: null,
      onClose: undefined,
      className: undefined,
      closeNoCancel: false,
    })
  }

  const selfClose = () => {
    onClose && onClose()
    closeModal()
  }

  const handleClickOverlay = () => {
    closeOnClickOverlay && selfClose()
  }

  const handleCancel = () => {
    onCancel && onCancel()
    selfClose()
  }
  const handleConfirm = () => {
    onConfirm && onConfirm()
    closeOnClickOverlay && selfClose() //点击确认需要校验不能直接关闭
  }

  const handleClickClose = () => {
    //onClickClose && onClickClose()
    onCancel && onCancel()
    selfClose()
  }

  const handleTouchMove = (e: ITouchEvent) => {
    e.stopPropagation()
  }

  return (
    <View
      className={c('hd-modal', className, { 'hd-modal--active': isOpened })}
      onTouchMove={handleTouchMove}
    >
      <View className="hd-modal__overlay" onClick={handleClickOverlay} catchMove />
      <View className="hd-modal__container">
        {showClear && (
          <View className="hd-modal__close at-icon at-icon-close" onClick={handleClickClose} />
        )}
        {src && <Image src={src} mode="scaleToFill" className="hd-modal__image" />}
        {title && (
          <View
            className={c('hd-modal__header', {
              'hd-modal__subHeader': mode === ModalMode.WithPicture,
            })}
          >
            {title}
          </View>
        )}
        {description && <View className="hd-modal__subHeader">{description}</View>}
        <View
          className={c('hd-modal__content', {
            'hd-modal__text': mode === ModalMode.WithPicture,
          })}
        >
          {typeof content === 'string' ? <Text>{content}</Text> : content}
        </View>
        {children}
        {(cancelText || confirmText) && (
          <View
            className={c('hd-modal__action', {
              'hd-modal__action--no-cancel': noCancel,
            })}
          >
            {cancelText && !noCancel && (
              <Button className="hd-modal__action-cancel" onClick={handleCancel}>
                {cancelText}
              </Button>
            )}
            {confirmText && (
              <Button className="hd-modal__action-confirm" onClick={handleConfirm}>
                {confirmText}
              </Button>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

export default React.forwardRef(Modal)
