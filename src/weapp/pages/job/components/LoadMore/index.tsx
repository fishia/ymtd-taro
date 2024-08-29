import { View, Text } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import c from 'classnames'
import { noop } from 'lodash'
import React from 'react'
import { AtLoadMore } from 'taro-ui'

import { IProps, LoadStatusType } from '@/def/common'

import './index.scss'

export interface ILoadMoreProps extends IProps {
  onClick?(): void
  status: LoadStatusType
  noMoreTextStyle?: string | Object
  moreBtnStyle?: string | Object
  noMoreText?: string
  loadingText?: string
  moreText?: string
  noMoreTitle?: string
  route?: string
}

const LoadMore: React.FC<ILoadMoreProps> = props => {
  const {
    noMoreText = '确定',
    loadingText = '正在加载中~',
    moreText = '加载更多~',
    status = 'more',
    route,
    onClick = noop,
    noMoreTitle,
    noMoreTextStyle = {
      width: '580rpx',
      lineHeight: '60rpx',
      background: '#FFFFFF',
      border: '1px solid #436EF3',
      borderRadius: '2px',
      fontSize: '22rpx',
      fontFamily: 'PingFang SC',
      fontWeight: 400,
      color: '#436EF3',
    },
    className,
    style,
  } = props

  const handleClick = () => {
    onClick && onClick()
    if (route) {
      navigateTo({ url: route })
    }
  }
  return (
    <View className={c({ custom_load_more: status === 'noMore' }, className)} style={style}>
      {status === 'noMore' && noMoreTitle ? (
        <>
          <View className="custom_load_more__title">{noMoreTitle}</View>
          <View className="at-load-more">
            <Text style={noMoreTextStyle} onClick={handleClick}>
              {noMoreText}
            </Text>
          </View>
        </>
      ) : (
        <AtLoadMore
          {...{
            noMoreText,
            loadingText,
            moreText,
            status,
            noMoreTitle,
            noMoreTextStyle,
          }}
        />
      )}
    </View>
  )
}

export default LoadMore
