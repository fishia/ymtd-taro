import React from 'react'
import c from 'classnames'

import { IProps } from '@/def/common'
import Empty from '@/components/Empty'

import './index.scss'
import emptyImageUrl from './no-favorite.png'

const textMap: Record<NoFavoriteType, string> = {
  job: '暂无收藏的职位',
  company: '暂无收藏的公司',
  article: '暂无收藏的文章',
}

export type NoFavoriteType = 'job' | 'company' | 'article'

export interface INoFavoriteProps extends IProps {
  type?: NoFavoriteType
  isLoading?: boolean
}

const NoFavorite: React.FC<INoFavoriteProps> = props => {
  const { type = 'job', isLoading = false, className, style } = props

  return (
    <Empty
      className={c('my-favorite__no-favorite', className)}
      style={style}
      picUrl={emptyImageUrl}
      text={isLoading ? '加载中...' : textMap[type]}
    />
  )
}

export default NoFavorite
