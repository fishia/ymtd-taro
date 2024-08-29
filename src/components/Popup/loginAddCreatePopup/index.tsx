import { View } from '@tarojs/components'
import c from 'classnames'
import { forwardRef, useImperativeHandle, useState } from 'react'

import LoginButton from '../../LoginButton'
import { IProps } from '@/def/common'
import useModalState from '@/hooks/custom/useModalState'

import './index.scss'

export interface ILoginAddCreatePopupProps extends IProps {
  tip?: string
}
export interface ILoginAddCreatePopupRef {
  setLoginBtnParams: any
  setTip: any
  show(): void
}

const LoginAddCreatePopup = (props: ILoginAddCreatePopupProps, ref: any) => {
  const { className, style } = props
  const [ loginBtnParams, setLoginBtnParams ] = useState({})

  const { active, alive, setModal } = useModalState(0)
  const [tip, setTip] = useState("方可投递该")

  useImperativeHandle<any, ILoginAddCreatePopupRef>(ref, () => ({
    show: openHandler,
    setTip,
    setLoginBtnParams
  }))

  const openHandler = () => setModal(true)

  const closeHandler = () => setModal(false)

  if (!alive) {
    return null
  }

  return (
    <View className={c('login-create-popup', className)} style={style}>
      <View className={c('login-create-popup__body', active ? 'active' : '')}>
        <View className="login-create-popup__tips">请先完成登录并创建简历后{tip}职位</View>

        <LoginButton className={c('login-create-popup__button')} {...loginBtnParams} onClick={closeHandler}>登录/注册</LoginButton>

        <View
          className={c('login-create-popup__close at-icon at-icon-close')}
          onClick={closeHandler}
        ></View>
      </View>

      <View className={c('login-create-popup__mask', active ? 'active' : '')} catchMove></View>
    </View>
  )
}

export default forwardRef<ILoginAddCreatePopupRef, ILoginAddCreatePopupProps>(LoginAddCreatePopup)
