import { View } from '@tarojs/components'
import c from 'classnames'
import { noop } from 'lodash'
import React from 'react'

import Button from '@/components/Button'
import Empty from '@/components/Empty'
import { STATIC_MP_IMAGE_HOST } from '@/config'
import { IProps } from '@/def/common'

import './index.scss'

export interface NoResumeProps extends IProps {
  onLoginClick?(): void
}

const NoResume: React.FC<NoResumeProps> = props => {
  const { className, style, onLoginClick = noop } = props

  return (
    <View className={c(className, 'resume-no-login')} style={style}>
      <View className="resume-no-login__empty">
        <Empty
          picUrl={STATIC_MP_IMAGE_HOST + 'no-login.png'}
          text="您尚未登录，请登录以后查看您的简历"
        />
        <Button className="resume-no-login__button" onClick={onLoginClick}>
          立即登录
        </Button>
      </View>
    </View>
  )
}

export default NoResume
