import React, { useImperativeHandle, useState } from 'react'
import { View, Text } from '@tarojs/components'
import classNames from 'classnames'
import _ from 'lodash'

import useTimeoutFn from '@/hooks/sideEffects/useTimeout'
import useModalState from '@/hooks/custom/useModalState'
import { IProps } from '@/def/common'

import './index.scss'

export const toastEventKey = 'toast'

export interface ToastState extends IProps {
  content: string
  isOpened?: boolean
  onClose?: Function
  duration?: number
}

const Toast = (_p, ref) => {
  useImperativeHandle(ref, () => ({
    open,
  }))
  const [state, setState] = useState<ToastState>({ content: '', isOpened: false })
  const { content, className, isOpened, onClose, duration = 2000 } = state

  const { alive, active, setModal } = useModalState(150)

  const close = () => {
    onClose && onClose()
    setState(prev => ({ ...prev, isOpened: false }))
    setModal(false)
  }
  const [, , reset] = useTimeoutFn(close, duration)
  const open = (props: ToastState) => {
    setState({ ...props, isOpened: true })
    setModal(true)
    // 定时器关闭Toast
    reset()
  }
  return alive ? (
    <View className={classNames(className, 'hd-toast', { 'hd-toast--active': active })}>
      <View className="hd-toast__content">
        <Text className="hd-toast__text">{_.isString(content) ? content : '未知错误'}</Text>
      </View>
    </View>
  ) : null
}

export default React.forwardRef(Toast)
