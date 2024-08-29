import React from 'react'
import { View } from '@tarojs/components'
import c from 'classnames'
import _ from 'lodash'

import { IProps } from '@/def/common'

import './index.scss'

export interface ICellProps extends IProps {
  title: string
  isLink?: boolean
  icon?: string
  onClick?(): void
}

const Cell: React.FC<ICellProps> = props => {
  const { title = '', icon, isLink = true, onClick = _.noop, children, className, style } = props

  return (
    <View className={c('hd-cell', className)} style={style} onClick={onClick}>
      {icon && <View className={c('hd-cell__icon icon iconfont', icon)} />}
      <View className="hd-cell__title">{title}</View>
      {children && <View className="hd-cell__content">{children}</View>}
      {isLink && <View className="at-icon at-icon-chevron-right hd-cell__link" />}
    </View>
  )
}

export default Cell
