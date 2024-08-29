import { View } from '@tarojs/components'
import c from 'classnames'
import React, { CSSProperties } from 'react'

import Empty from '@/components/Empty'
import { STATIC_MP_IMAGE_HOST } from '@/config'

import './index.scss'

interface NoJobProps {
  custom?: boolean
  onClick?: () => void
  title?: string | React.ReactNode
  description?: string | React.ReactNode
  btnText?: string
  imgName?: string
  style?: CSSProperties
}
const NoJob: React.FC<NoJobProps> = props => {
  const { custom = false, onClick, title, description, btnText, imgName = 'no-job', style } = props

  return (
    <View style={style}>
      <Empty
        picUrl={`${STATIC_MP_IMAGE_HOST}${imgName}.png`}
        className={c('job-index__no-job', { 'custom-image': custom })}
        text={
          custom ? (
            <View className="job-index__reload__content">
              {title && <View className="job-index__reload__text">{title}</View>}
              {description && <View className="job-index__reload__description">{description}</View>}
              {btnText && (
                <View className="job-index__reloadBtn" onClick={onClick}>
                  {btnText}
                </View>
              )}
            </View>
          ) : (
            title || '没有符合条件的职位记录'
          )
        }
      />
    </View>
  )
}

export default NoJob
