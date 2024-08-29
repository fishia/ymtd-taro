import { View, Button, Image } from '@tarojs/components'
import c from 'classnames'
import { noop } from 'lodash'
import React, { useImperativeHandle, useState } from 'react'

import { IProps } from '@/def/common'
import useModalState from '@/hooks/custom/useModalState'

import closeIcon from './close-icon.png'

import './index.scss'

export const modalEventKey2 = 'modal2'

export interface ModalState2 extends IProps {
  title?: string
  confirmText?: string
  cancelText?: string
  closeOnClickOverlay?: boolean
  isOpened?: boolean
  onClose?: Function
  onConfirm?: Function
  text?: string
  showClose?: boolean
  cancelWidth?: number
  confirmWidth?: number
  cancelBtnClose?: Function
  btnNums?: boolean
}

const Modal2 = (_p, ref) => {
  useImperativeHandle(ref, () => ({ open, close }))

  const [state, setState] = useState<ModalState2>({ isOpened: false })
  const { alive, active, setModal } = useModalState(150)

  const {
    title = '温馨提示',
    cancelText = '取消',
    confirmText = '确定',
    className,
    showClose = true,
    style,
    text,
    onClose = noop,
    onConfirm = noop,
    cancelWidth = 224,
    confirmWidth = 430,
    cancelBtnClose = noop,
    btnNums = true,
  } = state

  const open = (props: ModalState2) => {
    setState({ ...props, isOpened: true })
    setModal(true)
  }

  const close = () => {
    setModal(false)

    setTimeout(
      () =>
        void setState({
          title: '',
          text: '',
          cancelText: '取消',
          confirmText: '确定',
          onConfirm: undefined,
          closeOnClickOverlay: false,
          children: null,
          onClose: undefined,
          className: undefined,
        }),
      150
    )
  }

  const handleClose = () => {
    onClose()
    close()
  }

  const handleConfirm = () => {
    onConfirm()
    close()
  }

  const cancelBtnClick = () => {
    cancelBtnClose()
    close()
  }

  if (!alive) {
    return null
  }

  return (
    <View className={c('hd-modal2', className)} style={style}>
      <View className={c('hd-modal2__overlay', active ? 'show' : 'hide')} catchMove>
        <View className={c('hd-modal2__container', active ? 'show' : 'hide')}>
          {showClose && (
            <Image
              onClick={handleClose}
              src={closeIcon}
              mode="aspectFill"
              className="hd-modal2__close"
            />
          )}

          <View className="hd-modal2__title">{title}</View>
          <View className="hd-modal2__text">{text}</View>

          <View className="hd-modal2__action">
            {btnNums ? (
              <>
                <Button
                  className="hd-modal2__button cancel"
                  onClick={cancelBtnClose ? cancelBtnClick : handleClose}
                  style={{ width: `${cancelWidth}rpx` }}
                >
                  {cancelText}
                </Button>
                <Button
                  className="hd-modal2__button confirm"
                  onClick={handleConfirm}
                  style={{ width: `${confirmWidth}rpx` }}
                >
                  {confirmText}
                </Button>
              </>
            ) : (
              <Button
                className="hd-modal2__button confirm"
                onClick={handleConfirm}
                style={{ width: `${confirmWidth}rpx` }}
              >
                {confirmText}
              </Button>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

export default React.forwardRef(Modal2)
