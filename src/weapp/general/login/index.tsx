import { useState } from 'react'
import _ from 'lodash'
import { Button, View, Image, Text } from '@tarojs/components'
import { login, navigateTo, switchTab, useDidShow, makePhoneCall } from '@tarojs/taro'

import { useIsLogin, useWxLogin } from '@/hooks/custom/useUser'
import MainLayout from '@/layout/MainLayout'

import nologinBg from './imgs/nologin.png'
import ymtdTitle from './imgs/ymtd.png'
import './index.scss'
import ProtocolCheckBox, { ICheckboxProps } from '@/components/ProtocolCheckBox'
import { sendHongBaoEvent } from '@/utils/dataRangers'

const LoginFast = () => {
  const [code, setCode] = useState<string>('')
  const wxlogin = useWxLogin()
  const isLogined = useIsLogin()

  const [isPending, setIsPending] = useState<boolean>(false)
  const [checked, setChecked] = useState<boolean>(false)
  const [tipsVisible, setTipsVisible] = useState<boolean>(false)

  useDidShow(() => {
    if (isLogined) {
      switchTab({ url: '/weapp/pages/message/index' })
    }
  })

  // 默认授权手机号登录
  const handleConfirm = (e: any) => {
    if (e?.detail?.encryptedData) {
      wxlogin(
        code,
        e.detail.encryptedData,
        e.detail.iv,
        () => void switchTab({ url: '/weapp/pages/message/index' })
      ).catch(_.noop)
    } else {
      console.log('获取手机号 API 调用失败，可能是用户点了拒绝', e?.detail?.errMsg)
      setIsPending(false)
    }
  }

  const loginHandle = () => {
    sendHongBaoEvent('QuickLoginClick')
    setIsPending(true)
    login()
      .then(res => res.code)
      .then(setCode)
  }
  //是否勾选协议
  const ProtocolCheckBoxProps: ICheckboxProps = {
    checked,
    onCheck: bool => {
      setChecked(bool)
      setTipsVisible(false)
    },
    tipsVisible,
    className: 'login_index__checkBoxWrap',
  }
  return (
    <MainLayout>
      <View className="login_index">
        <View className="login_index__title">
          <Image src={ymtdTitle} mode="scaleToFill" />
        </View>
        <View className="login_index__subTitle">医药人跳槽，上医脉同道</View>
        <View className="login_index__bg_image">
          <Image src={nologinBg} mode="scaleToFill" />
        </View>
        <View className="login_index__action">
          <Button
            className="login_index__action-confirm"
            openType={checked ? 'getPhoneNumber' : ''}
            onGetPhoneNumber={handleConfirm}
            onClick={checked ? loginHandle : () => setTipsVisible(true)}
            disabled={isPending}
          >
            <View className="icon iconfont iconWeChat" />
            {isPending ? '登录中...' : '微信极速登录'}
          </Button>
        </View>
        <View
          className="login_index__text"
          onClick={() => {
            navigateTo({
              url: '/weapp/landing/hr/index',
            })
          }}
        >
          我是HR，我要招人
        </View>
        <ProtocolCheckBox {...ProtocolCheckBoxProps} />
        <View className="login_index__tel">
          <Text>注册/登录有问题请打：</Text>
          <Text
            className="phone"
            onClick={() => void makePhoneCall({ phoneNumber: '0512-62626030' })}
          >
            0512-6262-6030
          </Text>
        </View>
      </View>
    </MainLayout>
  )
}

export default LoginFast
