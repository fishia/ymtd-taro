/*
 * @Author: CC 13916343936@163.com
 * @Date: 2023-07-13 13:47:28
 * @LastEditors: CC 13916343936@163.com
 * @LastEditTime: 2023-07-13 17:58:45
 * @FilePath: \ymtd-taro\src\weapp\job\components\JobDetailCompany\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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

const defaultLogoUrl =
  'https://kr-ymtd.oss-cn-beijing.aliyuncs.com/mp/common/default-company-logo.png'

const JobDetailCompany: React.FC<ICompanyProps> = props => {
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
    attractionTag = '',
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
      <View className="job-company__header">职位所属公司</View>
      <View className="job-company__top">
        {/* {logo && ( */}
        <Image
          src={
            is_open === 1
              ? combineStaticUrl(logo || defaultLogoUrl)
              : combineStaticUrl(defaultLogoUrl)
          }
          mode="aspectFit"
          className="job-company__icon"
        />
        {/* )} */}
        <View className="job-company__right">
          <View className="job-company__title">{name}</View>
          {activityTagUrl && (
            <View className="job-company__label">
              <Tag iconSrc={activityTagUrl} />
            </View>
          )}
          <View className="job-company__intro">{tagsText}</View>
        </View>
        {is_open === 1 && isLink && <View className="at-icon at-icon-chevron-right" />}
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
      {/* {positionNum ? (
        <View className="job-company__jobCount">
          <Text className="job-company__jobCountNum">{positionNum}</Text>个在招职位
        </View>
      ) : null} */}
      {children}
    </View>
  )
}

export default JobDetailCompany
