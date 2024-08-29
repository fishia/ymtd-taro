import React from 'react'
import c from 'classnames'
import { View } from '@tarojs/components'
import { noop } from 'lodash'

import { STATIC_MP_IMAGE_HOST } from '@/config'
import { IProps } from '@/def/common'
import Button from '@/components/Button'
import Empty from '@/components/Empty'

import './index.scss'

export interface NoResumeProps extends IProps {
  onCreateClick?(): void
}

const NoResume: React.FC<NoResumeProps> = props => {
  const { className, style, onCreateClick: onButtonClick = noop } = props

  return (
    <View className={c(className, 'resume-no-resume')} style={style}>
      <View className="resume-no-resume__empty">
        <Empty
          picUrl={STATIC_MP_IMAGE_HOST + 'no-resume.png'}
          text="您尚未创建简历，请先创建您的个人简历"
        />
        <Button className="resume-no-resume__button" onClick={onButtonClick}>
          创建简历
        </Button>
      </View>
    </View>
  )
}

export default NoResume
