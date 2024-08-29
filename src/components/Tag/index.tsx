import { Image, View } from '@tarojs/components'
import { ViewProps } from '@tarojs/components/types/View'
import c from 'classnames'
import _ from 'lodash'
import React from 'react'

import './index.scss'

export type TagType = 'yello' | 'red'

export interface ITagProps extends ViewProps {
  tagType?: TagType
  iconSrc?: string // icon地址
}

const Tag: React.FC<ITagProps> = props => {
  const { children, tagType = 'yello', className, style, iconSrc = '' } = props

  return (
    <View style={style} className={c('hd-tag', `hd-tag--${tagType}`, className)} {...props}>
      {iconSrc && <Image src={iconSrc} mode="heightFix" />}
      {children}
    </View>
  )
}

export default Tag
