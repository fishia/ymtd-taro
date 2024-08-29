import { View } from '@tarojs/components'
import c from 'classnames'
import _ from 'lodash'
import React, { useState, useEffect } from 'react'
import { showToast } from '@tarojs/taro'

import { IProps } from '@/def/common'

import { fetchCityByIpApi } from '@/apis/user'

import LoginButton from '@/components/LoginButton'

import './index.scss'

export interface IJobAreaBlockProps extends IProps {
  onClick?(): void
}

const JobAreaBlock: React.FC<IJobAreaBlockProps> = props => {
  const {
    onClick = _.noop,
    className
  } = props

  const [cityName, setCityName] = useState("")

  const confirmText = "请先完成登录并创建简历后为你推荐更高匹配的职位"

  const rootCls = 'job-area-block',
    leftPrefixCls = `${rootCls}__left`,
    rightPrefixCls = `${rootCls}__right`
  
  const sendRangersData = {
    type: '工作城市',
    page_name: '职位推荐页',
  }
  
  const getLocationCity = () => {
    fetchCityByIpApi()
      .then(cityInfo => {
        setCityName(cityInfo.name)
      })
      .catch(() => {
        showToast({ title: '获取当前所在地失败' })
      })
  }
  
  useEffect(() => {
    getLocationCity()
  }, [])

  return (
    <>
      <View className={`${rootCls}`}>
        <View className={`${rootCls}__content`}>是在{ cityName }找工作吗？</View>
        <View className={`${rootCls}__operateBlock`}>
          {/* <View className={c(`${rootCls}__button`, leftPrefixCls, className)} onClick={onClick}>不是</View>
          <View className={c(`${rootCls}__button`, rightPrefixCls, className)} onClick={onClick}>是</View> */}
          <LoginButton
            className={c(`${rootCls}__button`, leftPrefixCls, className)}
            sendRangersData={{...sendRangersData, button_name: '不是'}}
            confirmText={confirmText}
          >
            不是
          </LoginButton>
          <LoginButton
            className={c(`${rootCls}__button`, rightPrefixCls, className)}
            sendRangersData={{...sendRangersData, button_name: '是'}}
            confirmText={confirmText}
          >
            是的
          </LoginButton>
        </View>
      </View>
    </>
  )
}

export default JobAreaBlock