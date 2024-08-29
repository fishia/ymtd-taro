import React from 'react'
import _ from 'lodash'
import { ScrollView as TaroScrollView } from '@tarojs/components'
import { ScrollViewProps } from '@tarojs/components/types/ScrollView'

import { IProps } from '@/def/common'

export interface IScrollViewProps extends ScrollViewProps, Omit<IProps, 'ref'> {
  loadMore?(): void
}

const ScrollView: React.FC<IScrollViewProps> = props => {
  const {
    onScrollToLower = _.noop,
    loadMore = _.noop,
    lowerThreshold = 350,
    className,
    style,
    children
  } = props

  return (
    <TaroScrollView
      lowerThreshold={lowerThreshold}
      className={className}
      style={style}
      onScrollToLower={() => {
        onScrollToLower()
        loadMore()
      }}
      scrollWithAnimation
      enhanced
      scrollY
      {...props}
    >
      {children}
    </TaroScrollView>
  )
}

export default ScrollView
