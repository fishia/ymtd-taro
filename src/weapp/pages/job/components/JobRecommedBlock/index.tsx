import React from 'react'
import { View } from '@tarojs/components'
import c from 'classnames'
import _ from 'lodash'

import LoginButton from '@/components/LoginButton'

import { IProps } from '@/def/common'

import './index.scss'

export interface IJobRecommedBlockProps extends IProps {
  onClick?(): void
}

const JobRecommedBlock: React.FC<IJobRecommedBlockProps> = props => {
  const {
    onClick = _.noop,
    className
  } = props

  const rootCls = 'job-recommed-block'
  const sendRangersData = {
    type: '职位推荐不精准',
    page_name: '职位推荐页',
    button_name: '登录注册'
  }

  return (
    <>
      <View className={`${rootCls}`}>
        <View className={`${rootCls}__tip`}>职位推荐不精准？</View>
        <View className={`${rootCls}__content`}>登录并完成简历创建，为你推荐更高匹配职位</View>
        <View className={`${rootCls}__operateBlock`}>
          {/* <View className={c(`${rootCls}__button`, className)} onClick={onClick}>登录/注册</View> */}
          <LoginButton className={c(`${rootCls}__button`, className)} sendRangersData={sendRangersData}>登录/注册</LoginButton>
        </View>
      </View>
    </>
  )
}

export default JobRecommedBlock
