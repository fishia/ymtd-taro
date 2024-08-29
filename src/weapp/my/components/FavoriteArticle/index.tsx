import React from 'react'
import c from 'classnames'
import _ from 'lodash'
import { View, Image } from '@tarojs/components'

import { IProps } from '@/def/common'
import { IDiscover } from '@/def/discover'
import { combineStaticUrl } from '@/utils/utils'

import './index.scss'

export interface IFavoriteArticleProps extends IProps {
  article: IDiscover
  onClick?(): void
}

const FavoriteArticle: React.FC<IFavoriteArticleProps> = props => {
  const { onClick = _.noop, article, className, style } = props
  const imageUrl = article?.cover_image?.[0] ?? ''

  return (
    <View onClick={onClick} className={c('favorite-article', className)} style={style}>
      <View className="favorite-article__title">{article.title}</View>
      <Image className="favorite-article__image" src={combineStaticUrl(imageUrl)} />
    </View>
  )
}

export default FavoriteArticle
