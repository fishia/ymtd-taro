import { View } from '@tarojs/components'
import c from 'classnames'
import React from 'react'

import LoginButton from '@/components/LoginButton'
import { STATIC_MP_IMAGE_HOST } from '@/config'
import { IProps } from '@/def/common'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import './index.scss'

export interface ILoginTipsBarProps extends IProps {
  onClick?(): void
  visible?: boolean
}

const newJdCount = (function () {
  const now = new Date()
  const nowDate = now.getDate()

  const day2 = new Date()
  day2.setMonth(now.getMonth() + 1)
  day2.setDate(0)
  const maxDate = day2.getDate()

  const date = nowDate % 2 === 0 || nowDate === maxDate ? nowDate : maxDate - nowDate

  return Math.floor(8000 + (date / maxDate) * 998)
})()

const LoginTipsBar: React.FC<ILoginTipsBarProps> = props => {
  const { visible = false, className, style } = props

  const onSendDataRanger = () => {
    sendDataRangersEventWithUrl('register_and_login_click', {
      button_name: '注册登录',
    })
  }

  return (
    <LoginButton
      className={c(
        'job-index__login-tips',
        { 'job-index__login-tips--visible': visible },
        className
      )}
      style={style}
    >
      <View onClick={onSendDataRanger} className="job-index__login-tips-wrapper">
        <View className="job-index__login-tips__text">
          {/* 今日上新高薪名企职位<View className="job-index__login-tips__text-hl">{newJdCount}</View>个
           */}
          上新海量高匹配热招职位，高效求职
        </View>
        {/* <Image
          className="job-index__login-tips__img"
          src={STATIC_MP_IMAGE_HOST + 'new-login-tips.png'}
          mode="widthFix"
        /> */}
        <View className="job-index__login-tips__btn">登录查看</View>
      </View>
    </LoginButton>
  )
}

export default LoginTipsBar
