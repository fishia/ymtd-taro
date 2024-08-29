import { View } from '@tarojs/components'

import LoginButton from '../LoginButton'

import './LoginTipsCard.scss'

export default function LoginTipsCard() {
  return (
    <LoginButton className="login-tips-card">
      <View className="login-tips-card__title">没看到心仪职位？</View>
      <View className="login-tips-card__tips">登录后，将为你推荐符合求职意向的职位</View>
      <View className="login-tips-card__button">立即登录</View>
    </LoginButton>
  )
}
