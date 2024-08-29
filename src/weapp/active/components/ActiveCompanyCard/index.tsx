import { View, Image, Text, Button } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import React from 'react'

import moreIcon from '@/assets/imgs/more-icon.png'
import { CompanyCardProps } from '@/def/active'
import { combineStaticUrl } from '@/utils/utils'

import './index.scss'

const ActiveCompanyCard: React.FC<CompanyCardProps> = props => {
  const { detail, showMore } = props

  const go = v => {
    navigateTo({
      url: `/weapp/job/job-detail/index?jd_id=${v}`,
    })
  }

  return (
    <View className="act-company-card">
      <View className="header">
        <Image src={combineStaticUrl(detail.logo)} className="logo" />
        <View className="company-info">
          <View className="company-name">{detail.short_name || detail.name}</View>
          <View className="company-summary">
            {detail.industries.map(item => item.name).join(',')} |{detail.type_name} |
            {detail.scale_name}
          </View>
        </View>
      </View>
      {detail.jds.map((item, index) => {
        const salaryDisplay =
          item.salary === '面议' ? '面议' : item.salary + ' · ' + item.salary_type

        return (
          <View className="job-info-wrap" key={index} onClick={() => go(item.id)}>
            <View className="job-info-item">
              <View className="job-name">{item.name}</View>
              <View className="job-salary">{salaryDisplay}</View>
            </View>
          </View>
        )
      })}
      {showMore ? (
        <Button className="look-more-jobs-btn">
          <Text>查看更多职位</Text>
          <Image src={moreIcon} className="icon-more" />
        </Button>
      ) : null}
    </View>
  )
}

export default ActiveCompanyCard
