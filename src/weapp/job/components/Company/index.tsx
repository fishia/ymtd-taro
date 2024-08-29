import { View, Image, ITouchEvent, Text } from '@tarojs/components'
import R from 'ramda'
import React from 'react'

import Tag from '@/components/Tag'
import { IProps } from '@/def/common'
import { ICompany } from '@/def/job'
import { isValidString } from '@/services/StringService'
import { combineStaticUrl } from '@/utils/utils'

import './index.scss'

export interface ICompanyProps extends IProps {
  data: ICompany
  isLink?: boolean
  detail?: boolean
  onClick?: (companyId: number, is_open: number) => void
}

const Company: React.FC<ICompanyProps> = props => {
  const { data, isLink = true, className, style, children, detail = false, onClick } = props
  const {
    logo,
    name,
    id,
    type_name,
    address,
    industries,
    scale_name,
    is_open,
    activityTagUrl,
    attractionTag,
    positionNum,
  } = data
  const industry = R.compose(
    R.join('/'),
    R.filter(isValidString),
    R.map(R.prop('name'))
  )(industries)

  const handleClick = (e: ITouchEvent) => {
    e.stopPropagation()
    onClick && onClick(id, is_open)
  }
  const tags: string[] = [type_name, industry, scale_name]
  const tagsText = tags.filter(isValidString).join('  |  ')
  return (
    <View className={['job-company', className].join(' ')} style={style} onClick={handleClick}>
      <View className="job-company__top">
        {logo && (
          <Image src={combineStaticUrl(logo)} mode="aspectFit" className="job-company__icon" />
        )}
        <View className="job-company__right">
          <View className="job-company__title">{name}</View>
          {activityTagUrl && (
            <View className="job-company__label">
              <Tag iconSrc={activityTagUrl} />
            </View>
          )}
          <View className="job-company__intro">{tagsText}</View>
        </View>
        {isLink && <View className="at-icon at-icon-chevron-right" />}
      </View>
      {attractionTag && (
        <View className="job-company__attractTags">
          {attractionTag.split(',').map((item, i) => (
            <View className="job-company__attractTag" key={i}>
              {item}
            </View>
          ))}
        </View>
      )}
      {positionNum ? (
        <View className="job-company__jobCount">
          <Text className="job-company__jobCountNum">{positionNum}</Text>个在招职位
        </View>
      ) : null}
      {children}
    </View>
  )
}

export default Company
