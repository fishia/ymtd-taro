import React from 'react'
import R from 'ramda'
import c from 'classnames'
import _ from 'lodash'
import { View, Image, Text } from '@tarojs/components'

import { ICompany } from '@/def/job'
import { IProps } from '@/def/common'
import { combineStaticUrl } from '@/utils/utils'
import { isValidString, textHighLight } from '@/services/StringService'

import './index.scss'

export interface IFavoriteCompanyProps extends IProps {
  company: ICompany
  keyword?: string
  onClick?(): void
}

const FavoriteCompany: React.FC<IFavoriteCompanyProps> = props => {
  const { className, style, company, keyword = '', onClick = _.noop } = props
  const { name, logo, type_name, industries, jd_num } = company

  const industry = R.compose(
    R.join('/'),
    R.slice(0, 2),
    R.flatten,
    R.map(R.split('/')),
    R.filter(isValidString),
    R.map(R.prop('name'))
  )(industries)

  const showType = isValidString(type_name)

  const showIndustry = isValidString(industry)

  return (
    <View onClick={onClick} className={c('favorite-company', className)} style={style}>
      <View className="favorite-company__left">
        <View
          className="favorite-company__title"
          dangerouslySetInnerHTML={{ __html: textHighLight(name, keyword) }}
        ></View>
        <View className="favorite-company__intro">
          {showType && (
            <View className={c({ 'favorite-company__tip': showIndustry })}>{type_name}</View>
          )}
          {showIndustry && <View className="favorite-company__industry">{industry}</View>}
          <View className={c({ 'favorite-company__num': showIndustry })}>
            <Text className="text--emphasize">{jd_num}</Text>
            个在招职位
          </View>
        </View>
      </View>
      {logo && (
        <Image src={combineStaticUrl(logo)} mode="aspectFit" className="favorite-company__icon" />
      )}
    </View>
  )
}

export default FavoriteCompany
