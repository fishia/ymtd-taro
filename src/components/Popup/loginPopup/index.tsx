import { View, Button, ScrollView } from '@tarojs/components'
import { eventCenter, login, navigateTo, setStorageSync, useRouter, getCurrentInstance } from '@tarojs/taro'
import classNames from 'classnames'
import _, { debounce } from 'lodash'
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { AtModal, AtModalAction } from 'taro-ui'

import { NEW_LOGIN_POPUP_APPLY, OPEN_REDPACKET_POPUP } from '@/config'
import useModalState from '@/hooks/custom/useModalState'
import { useWxLogin, IrData } from '@/hooks/custom/useUser'
import { activityStatus } from '@/services/DateService'
import { getVarParam, sendDataRangersEvent, sendHongBaoEvent } from '@/utils/dataRangers'
import { reportLandingData } from '@/weapp/landing/hr/layout/useChannel'
import { PopupState } from '../index'

import './index.scss'

export const loginPopupEventKey = 'loginPopup'

export type ILoginPopupProps = PopupState

const LoginPopup = (_props, ref) => {
  const router = useRouter()
  const wxlogin = useWxLogin()
  const effectiveActivity = activityStatus()
  const focusCallToActionEnable = getVarParam('focusCallToActionEnable')

  const [state, setState] = useState<ILoginPopupProps>({ isOpened: false })
  const wxCodeRef = useRef('')
  const wxCodeTimeoutRef = useRef(-1)
  const [showLogin, setIsShowLogin] = useState<boolean>(false)
  const [showConfirmTipsModal, setShowConfirmTipsModal] = useState<boolean>(false)
  const { className, isOpened, onClose = _.noop, onConfirm = _.noop, noLoginMode = false } = state
  const { active, alive, setModal } = useModalState(200)
  const [rangersData, setRangersData] = useState<IrData>()

  useEffect(() => {
    setModal(!!isOpened)
  }, [isOpened, setModal])

  const open = (props: PopupState) => {
    if (router.path != getCurrentInstance().router?.path) return //只开当前匹配的路由页面

    if (!noLoginMode) {
      sendHongBaoEvent('EventPopupExpose')
      if (effectiveActivity && !focusCallToActionEnable) {
        setStorageSync(OPEN_REDPACKET_POPUP, true)
      }
    }
    sendDataRangersEvent('Privacy_agreement_pu', { type: '新用户协议授权' })
    setState({ ...props, isOpened: true })
    setShowConfirmTipsModal(!!props.confirmText)
    props?.rangersData && setRangersData(props?.rangersData)
  }

  const close = () => {
    onClose && onClose()
    setTimeout(() => {
      setIsShowLogin(false)
    }, 200)
    clearTimeout(wxCodeTimeoutRef.current)
    setState({ ...state, isOpened: false })
    sendDataRangersEvent('Reject_Button_Click')
  }

  const getAndSetWxCode = () => {
    login().then(res => {
      wxCodeRef.current = res.code
    })
  }

  useImperativeHandle(ref, () => ({ open, close }))

  // 默认授权手机号登录
  const handleConfirm = (e: any) => {
    if (e?.detail?.encryptedData) {
      sendDataRangersEvent('Click_OK_Button', { is_success: '成功' })
      wxlogin(wxCodeRef.current, e.detail.encryptedData, e.detail.iv, onConfirm as any, {...rangersData}).catch(
        _.noop
      )
      clearTimeout(wxCodeTimeoutRef.current)
    } else {
      sendDataRangersEvent('Cancel_Button_Click')
    }
  }

  const loginHandle = debounce(
    () => {
      // setStorageSync(NEW_LOGIN_POPUP_APPLY, +new Date())
      // eventCenter.trigger(NEW_LOGIN_POPUP_APPLY, true)

      reportLandingData('RegisterClick')
      sendHongBaoEvent('QuickLoginClick')
      sendDataRangersEvent('Agree_Button_Click', { is_success: '成功' })
      sendDataRangersEvent('Get_Mobile_Page', { type: '新用户手机号授权' })
      getAndSetWxCode()
      wxCodeTimeoutRef.current = +setTimeout(getAndSetWxCode, 5 * 60 * 1000)
      setTimeout(close, 200)
    },
    1000,
    {
      leading: true,
      trailing: false,
    }
  )

  const onJumpRegister = () => {
    close()
    navigateTo({
      url: '/weapp/my/login_to_phone/index' + (rangersData ? `?type=${rangersData?.type}&pageName=${rangersData?.pageName}` : ''),
    })
  }

  if (!alive) {
    return null
  }

  if (showConfirmTipsModal) {
    return (
      <View className={classNames(className, 'login-popup-mask', active ? 'actived' : '')}>
        <View className={classNames(className, 'login-popup login-tips', active ? 'actived' : '')}>
          <View className="login-popup__title__tips">{state.confirmText}</View>
          <View
            className={classNames('login-popup__close at-icon at-icon-close')}
            onClick={close}
          ></View>
          <View
            className="login-popup__tips__button"
            onClick={() => setShowConfirmTipsModal(false)}
          >
            登录/注册
          </View>
        </View>
      </View>
    )
  }

  if (showLogin) {
    return (
      <View className={classNames(className, 'login-popup-mask', active ? 'actived' : '')}>
        <View
          className={classNames(className, 'login-popup wx-fast-login', active ? 'actived' : '')}
        >
          <View className="login-popup__title">登录或注册</View>
          <View className={classNames("login-popup__action", "login-popup__wx-action")}>
            <Button
              className={classNames("login-popup__confirm", "login-popup__wxConfirm")}
              openType="getPhoneNumber"
              onGetPhoneNumber={handleConfirm}
              onClick={loginHandle}
            >
              手机号快速登录
            </Button>
            <Button className={classNames("login-popup__confirm", "login-popup__wxConfirm")} onClick={onJumpRegister}>
              短信验证码注册/登录
            </Button>
            <Button className={classNames("login-popup__confirm", "login-popup__wxConfirm")} onClick={close}>
              暂不登录
            </Button>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className={classNames(className, 'login-popup-mask', active ? 'actived' : '')}>
      <View className={classNames(className, 'login-popup', active ? 'actived' : '')}>
        <View className="login-popup__title">用户服务协议及隐私保护政策</View>
        <ScrollView className="login-popup__scroll" scrollY>
          <View>
            <View className="login-popup__content">
              感谢选择医脉同道小程序，我们非常重视您的个人信息安全和隐私保护。
              <View className="login-popup__content__br"></View>
              依据最新法律要求，使用我们的产品前，请仔细阅读并同意
              <View
                onClick={() => void navigateTo({ url: '/weapp/general/protocol/index?current=0' })}
                className="login-popup__content__link"
              >
                《用户协议》
              </View>
              、
              <View
                onClick={() => void navigateTo({ url: '/weapp/general/protocol/index?current=1' })}
                className="login-popup__content__link"
              >
                《隐私政策》
              </View>
              ，以便我们向你提供更优质的服务!
              <View className="login-popup__content__br"></View>
              我们承诺将尽全力保护你个人信息及合法权益，再次感谢您的信任!
            </View>
          </View>
        </ScrollView>

        <View className="login-popup__action">
          <Button className="login-popup__confirm" onClick={() => setIsShowLogin(true)}>
            同意
          </Button>
          <Button className={classNames("login-popup__confirm", "login-popup__noConfirm")} onClick={close}>
            不同意
          </Button>
        </View>
      </View>
    </View>
  )
}

export default React.forwardRef(LoginPopup)
