import { View } from '@tarojs/components'
import { noop } from 'lodash'
import React from 'react'
import { AtLoadMore } from 'taro-ui'

import { ILoadMoreProps } from '@/components/LoadMore'

import './index.scss'

const LoadMore: React.FC<ILoadMoreProps> = props => {
  const {
    noMoreText = '确定',
    loadingText = '正在加载中~',
    moreText = '加载更多~',
    status = 'more',
    onClick = noop,
  } = props

  return (
    <>
      {status === 'noMore' ? (
        <View className="custom_load_more">
          <View className="custom_load_more__title">{noMoreText}</View>
          <View className="custom_load_more__reloadBtn" onClick={onClick}>
            查看推荐
          </View>
        </View>
      ) : (
        <AtLoadMore
          {...{
            noMoreText,
            loadingText,
            moreText,
            status,
          }}
        />
      )}
    </>
  )
}

export default LoadMore
