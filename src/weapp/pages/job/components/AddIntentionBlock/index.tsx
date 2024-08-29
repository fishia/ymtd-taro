import { View, Text } from '@tarojs/components'
import c from 'classnames'
import _ from 'lodash'
import React from 'react'

import LoginButton from '@/components/LoginButton'
import { IProps } from '@/def/common'

import './index.scss'

export interface IJobSubscribeBlockProps extends IProps {
  title?: string | React.ReactElement
  subTitle?: string | React.ReactElement
  content?: string | React.ReactElement
  buttonText?: string
  onClick?(): void
}

const JobSubscribeBlock: React.FC<IJobSubscribeBlockProps> = props => {
  const {
    onClick = _.noop,
    className,
    style,
    title = '职位定制',
    subTitle = '无需大海捞针找工作',
    content = '根据地区/职位类型等推荐更精准职位',
    buttonText = '添加意向',
  } = props

  const rootCls = 'job-subscribe-block',
    leftPrefixCls = `${rootCls}__left`,
    rightPrefixCls = `${rootCls}__right`

  return (
    <LoginButton className={c(rootCls, className)} onClick={onClick} style={style}>
      <View className={`${rootCls}__wrapper`}>
        <View className={leftPrefixCls}>
          <View className={`${leftPrefixCls}__title`}>
            {title}
            <Text className={`${leftPrefixCls}__subTitle`}>{subTitle}</Text>
          </View>
          <View className={`${leftPrefixCls}__text`}>{content}</View>
        </View>
        <View className={rightPrefixCls}>
          <View className={`${rightPrefixCls}__iconText`}>{buttonText}</View>
        </View>
      </View>
    </LoginButton>
  )
}

export default JobSubscribeBlock
