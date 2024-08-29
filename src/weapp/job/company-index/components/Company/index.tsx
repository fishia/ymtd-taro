import { View, Image, ITouchEvent } from '@tarojs/components'
import c from 'classnames'
import R from 'ramda'
import React from 'react'

import Tag from '@/components/Tag'
import { IProps } from '@/def/common'
import { INewCompany } from '@/def/job'
import { isValidString } from '@/services/StringService'
import { combineStaticUrl } from '@/utils/utils'

import './index.scss'

export interface ICompanyProps extends IProps {
  data: INewCompany
  isLink?: boolean
  detail?: boolean
  onClick?: (companyId: number, isOpen: number) => void
}

const Company: React.FC<ICompanyProps> = props => {
  const { data, isLink = true, className, style, children, detail = false, onClick } = props
  const {
    logo,
    name,
    id,
    type_name,
    industries,
    scale_name: scaleName,
    is_open: isOpen,
    activityTagUrl,
    stageName,
    establishYear,
    attractionTag,
  } = data
  const industry = R.compose(
    R.join('、'),
    R.filter(isValidString),
    R.map(R.prop('name'))
  )(industries)

  const showType = isValidString(type_name)
  const showIndustry = isValidString(industry)
  const showScale = isValidString(scaleName)

  const handleClick = (e: ITouchEvent) => {
    e.stopPropagation()
    onClick && onClick(id, isOpen)
  }
  return (
    <View className={['company-card', className].join(' ')} style={style} onClick={handleClick}>
      <View className="company-card__top">
        <View className="company-card__right">
          <View className="company-card__title">{name}</View>
          {activityTagUrl && (
            <View className="company-card__label">
              <Tag iconSrc={activityTagUrl} />
            </View>
          )}
          <View className="company-card__intro">
            {showType && <View className="company-card__tag">{type_name}</View>}
            {showScale && <View className="company-card__tag">{scaleName}</View>}
            {stageName && <View className="company-card__tag">{stageName}</View>}
            {establishYear && <View className="company-card__tag">{establishYear}</View>}
            {/* {showIndustry && <View className="company-card__industry">{industry}</View>} */}
          </View>
        </View>
        {logo && (
          <Image src={combineStaticUrl(logo)} mode="aspectFit" className="company-card__icon" />
        )}
      </View>
      {/* {attractionTag && (
        <View className="company-card__attractTags">
          {attractionTag.split(',').map((item, i) => (
            <View className="company-card__attractTag" key={i}>
              {item}
            </View>
          ))}
        </View>
      )} */}
      {children}
    </View>
  )
}

export default Company
