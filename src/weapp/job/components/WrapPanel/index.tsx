import { View } from '@tarojs/components'
import { previewMedia } from '@tarojs/taro'
import c from 'classnames'
import React, { useState } from 'react'

import { IProps } from '@/def/common'
import { IProduct } from '@/def/job'

import './index.scss'

interface WrapPanelProps<TData = previewMedia.Sources | IProduct | string> extends IProps {
  title?: string | React.ReactNode
  data: TData[]
  RowRender: (item: TData, i: number) => React.ReactNode
  callback?: () => void
  overscanRowCount?: number //可视化范围内条数
}
//折叠容器，默认展示几个，可展开折叠
const WrapPanel: React.FC<WrapPanelProps> = props => {
  const { title = '公司相册', data = [], overscanRowCount = 3, RowRender, className } = props
  const [showMore, setShowMore] = useState(false)
  return (
    <View className={c('wrapPanel', className)}>
      <View className="wrapPanel__title">{title}</View>
      <View className="wrapPanel__imgList">
        {data.slice(0, overscanRowCount).map((item, i) => (
          <React.Fragment key={i}>{RowRender(item, i)}</React.Fragment>
        ))}
        {showMore &&
          data
            .slice(overscanRowCount)
            .map((item, i) => (
              <React.Fragment key={i}>{RowRender(item, i + overscanRowCount)}</React.Fragment>
            ))}
      </View>
      {data.length > overscanRowCount && (
        <View
          className={c('at-icon', {
            'at-icon-chevron-down': !showMore,
            'at-icon-chevron-up': showMore,
          })}
          onClick={() => setShowMore(!showMore)}
        />
      )}
    </View>
  )
}

export default WrapPanel
