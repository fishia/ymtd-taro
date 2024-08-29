import { View, Text, Image } from '@tarojs/components'
import c from 'classnames'
import { noop } from 'lodash'
import { FC } from 'react'

import { IProps } from '@/def/common'
import { ICompany } from '@/def/job'
import { isValidString, textHighLight } from '@/services/StringService'
import { combineStaticUrl } from '@/utils/utils'

import './CompanyCard.scss'

export interface ICompanyCardProps extends IProps {
  companyInfo: ICompany
  keyword?: string
  onClick?(position: 'company' | 'jd'): void
}

const CompanyCard: FC<ICompanyCardProps> = props => {
  const { onClick = noop, companyInfo, keyword = '', className, style } = props
  const { name, industries = [], type_name, scale_name, jd_num, logo, attractionTag } =
    companyInfo || {}

  const tags: string[] = [type_name, (industries || [])[0]?.name, scale_name]
  const tagsText = tags.filter(isValidString).join(' | ')

  return (
    <View className={c('job-search__company-card', className)} hoverClass="hover" style={style}>
      <View onClick={() => void onClick('company')} className="job-search__company-card__main">
        <Image
          className="job-search__company-card__logo"
          src={combineStaticUrl(logo || '')}
          mode="scaleToFill"
        />
        <View className="job-search__company-card__info">
          <View
            className="job-search__company-card__name"
            dangerouslySetInnerHTML={{ __html: textHighLight(name, keyword) }}
          ></View>
          <View className="job-search__company-card__tags">{tagsText}</View>
          {attractionTag && (
            <View className="job-search__company-card__attractTags">
              {attractionTag.split(',').map((item, i) => (
                <View className="job-search__company-card__attractTag" key={i}>
                  {item}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
      <View onClick={() => void onClick('jd')} className="job-search__company-card__jd-count">
        <Text className="job-search__company-card__jd-count__num">{jd_num || 0}</Text>个在招职位
        <View className="job-search__company-card__jd-count__arrow at-icon at-icon-chevron-right"></View>
      </View>
    </View>
  )
}

export default CompanyCard
