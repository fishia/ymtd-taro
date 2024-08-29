import { ITouchEvent, View } from '@tarojs/components'
import classNames from 'classnames'
import _ from 'lodash'
import React, { useImperativeHandle, useState } from 'react'

import Button from '@/components/Button'
import LoginButton, { IRecordJdInfo } from '@/components/LoginButton'

import './index.scss'

interface IProps {
  className?: string
  onConfirm?: (e: ITouchEvent) => void
  onClose?: (e: ITouchEvent) => void
  title?: string
  okText?: string
  cancelText?: string
  type?: 'login' | 'default'
  recordJdInfo?: IRecordJdInfo
}

const defaultTitle = '暂未登录/注册，完成登录/注册并创建简历后即可获取联系方式'
const defaultBtnText = '登录/注册'
const defaultCancelText = '暂不登录'

const CommonPopup = (props: IProps, ref) => {
  const {
    className,
    onConfirm = _.noop,
    onClose = _.noop,
    title = defaultTitle,
    okText = defaultBtnText,
    cancelText = defaultCancelText,
    type = 'default',
    recordJdInfo,
  } = props
  const [open, setOpen] = useState<boolean>(false)

  useImperativeHandle(ref, () => ({ setOpen }))

  const confirm = () => {
    console.log(1111)
    setOpen(false)
    onConfirm()
  }

  const close = () => {
    setOpen(false)
    onClose()
  }

  return (
    <View
      className={classNames(className, 'getPhone-popup login-popup-mask', open ? 'actived' : '')}
    >
      <View className={classNames(className, 'login-popup wx-fast-login', open ? 'actived' : '')}>
        <View className="login-popup__title">{title}</View>
        <View className={classNames('login-popup__action')}>
          {type === 'login' ? (
            <View onClick={() => setOpen(false)}>
              <Button
                className={classNames('login-popup__confirm', 'login-popup__wxConfirm')}
                onClick={confirm}
                useLoginButton
                loginButtonJdInfo={recordJdInfo}
              >
                {okText}
              </Button>
            </View>
          ) : (
            <Button
              className={classNames('login-popup__confirm', 'login-popup__wxConfirm')}
              onClick={confirm}
            >
              {okText}
            </Button>
          )}

          <Button
            className={classNames('login-popup__confirm', 'login-popup__wxConfirm')}
            onClick={close}
          >
            {cancelText}
          </Button>
        </View>
      </View>
    </View>
  )
}

export default React.forwardRef(CommonPopup)
