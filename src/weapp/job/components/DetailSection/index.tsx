import { View } from '@tarojs/components'
import c from 'classnames'
import React from 'react'

import { IProps } from '@/def/common'

import './index.scss'

interface IDetailSectionProps extends IProps {
  title: string
  list?: string[]
  text?: string
  border?: boolean
}
const DetailSection: React.FC<IDetailSectionProps> = props => {
  const {
    title,
    list = [],
    border = false,
    text = '',
    children = null,
    className = '',
    style,
  } = props
  return (
    <View className={c('detail-section', className)} style={style}>
      <View className={c('detail-section__content', { 'detail-section__border': border })}>
        <View className="detail-section__title">{title}</View>
        {list.map((v, idx) => (
          <View className="detail-section__text" key={idx}>
            {`${idx + 1}.${v}`}
          </View>
        ))}
        {text && (
          <View className="detail-section__text" dangerouslySetInnerHTML={{ __html: text }}></View>
        )}
        {children}
        {/* {border && <View className="detail-section__line" />} */}
      </View>
    </View>
  )
}

export default DetailSection
