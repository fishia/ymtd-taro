import { View } from '@tarojs/components'

import LoginButton, { ILoginButtonProps } from '../LoginButton'

import './ListTailLoginTips.scss'

export default function ListTailLoginTips(props: ILoginButtonProps) {
  return (
    <LoginButton {...props} className="list-tail-login-tips">
      {/* <View className="list-tail-login-tips__title">更多精准职位，登录后即可查看</View> */}
      <View className="list-tail-login-tips__button">立即登录</View>
    </LoginButton>
  )
}
