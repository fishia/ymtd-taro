import React, { ReactNode } from 'react'
import c from 'classnames'
import { View, Image } from '@tarojs/components'

import { IProps } from '@/def/common'

import './index.scss'

export interface IEmptyProps extends IProps {
  text: string | ReactNode
  picUrl?: string
  isLoading?: boolean
}

const Empty: React.FC<IEmptyProps> = props => {
  const { picUrl = '', isLoading = false, text, className, style } = props

  return (
    <View style={style} className={c(className, 'hd-empty')}>
      {picUrl && <Image className="hd-empty__image" src={picUrl} mode="aspectFit" />}

      <View className="hd-empty__content">{isLoading ? '加载中...' : text}</View>
    </View>
  )
}

export default Empty
