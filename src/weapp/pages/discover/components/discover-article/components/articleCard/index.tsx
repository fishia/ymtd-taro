import { View, Text, Image } from '@tarojs/components'
import c from 'classnames'
import React from 'react'

import { IDiscover } from '@/def/discover'
import { combineStaticUrl } from '@/utils/utils'

import './index.scss'

interface IArticleCardProps {
  is_top?: boolean
  is_hot?: boolean
  data: IDiscover
  className?: string
  onClick?: (id: number | null) => void
}

const ArticleCard: React.FC<IArticleCardProps> = props => {
  const { className, data, onClick } = props
  const { id, title, updated_at, cover_image: coverImage } = data
  const typeName =
    title.indexOf('【') > -1 && title.indexOf('】') > -1
      ? title.substring(title.indexOf('【'), title.indexOf('】') + 1)
      : ''

  const cover_image = coverImage || []

  const handleClick = () => {
    onClick && onClick(id)
  }
  return (
    <>
      <View className={c('hd-articleCard', className)} onClick={handleClick}>
        {cover_image.length ? (
          <View className="hd-articleCard__img-bar">
            <Image
              className="hd-articleCard__img"
              src={combineStaticUrl(cover_image[0])}
              mode="aspectFill"
            />
          </View>
        ) : null}
        <View className="hd-articleCard__rightContent">
          <View className="hd-articleCard__title">
            {title && (
              <View className="hd-articleCard__title__text">
                {typeName && <Text className="hd-articleCard__title__status">{typeName}</Text>}
                {typeName ? title.substring(typeName.length) : title}
              </View>
            )}
          </View>
          <View className={c({ inlineDisplay: !cover_image.length })}>
            <View className="hd-articleCard__time">医药日报</View>
            <View className="hd-articleCard__time">{updated_at}</View>
          </View>
        </View>
      </View>
    </>
  )
}

export default ArticleCard
