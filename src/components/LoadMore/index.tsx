import React from 'react'
import { AtLoadMore } from 'taro-ui'
import { AtLoadMoreProps } from 'taro-ui/types/load-more'

import { IProps, LoadStatusType } from '@/def/common'

import './index.scss'

export interface ILoadMoreProps extends IProps, AtLoadMoreProps {
  status?: LoadStatusType
}

const LoadMore: React.FC<ILoadMoreProps> = props => (
  <AtLoadMore
    noMoreText="没有更多了~"
    loadingText="正在加载中..."
    moreText="加载更多"
    customStyle={props.style}
    {...props}
  />
)

export default LoadMore
