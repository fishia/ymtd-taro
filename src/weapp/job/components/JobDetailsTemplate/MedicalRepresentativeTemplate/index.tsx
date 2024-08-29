import React, { useEffect, useMemo } from 'react'
import R from 'ramda'
import _ from 'lodash'
import { View } from '@tarojs/components'

import { IMedicalRepresentativeJob } from '@/def/job'
import { formatStringToHtml } from '@/services/StringService'
import Line from '@/components/Line'
import { IJobDetailsTemplateProps } from '..'
import DetailSection from '../../DetailSection'

import './index.scss'

const DetailsRecord: React.FC<{ title: string; value?: any }> = props => {
  const { title, value } = props

  if (value === '' || R.isNil(value) || R.isEmpty(value)) {
    return null
  }

  return (
    <View className="job-detail-mr__record">
      <View className="job-detail-mr__record__title">{title}</View>
      <View className="job-detail-mr__record__value">
        {Array.isArray(value)
          ? value.map((item, i) => (
            <View className="job-detail-mr__record__value__tag" key={i}>
              {item}
            </View>
          ))
          : value}
      </View>
    </View>
  )
}

const MedicalRepresentativeTemplate: React.FC<
  IJobDetailsTemplateProps<IMedicalRepresentativeJob>
> = props => {
  const { jobInfo, afterLoaded = _.noop } = props

  const jobType = jobInfo.property_name ? ' · ' + jobInfo.property_name : ''
  const workAddress = useMemo(() => {
    if (!jobInfo.addresses || jobInfo.addresses.length <= 0) {
      return null
    }

    const address = jobInfo.addresses[0]

    if (address.city === address.province) {
      return address.city
    } else if (!address.city) {
      return address.province
    }

    return address.province + '-' + address.city
  }, [jobInfo])

  const description = useMemo(() => formatStringToHtml(jobInfo.desc || ''), [jobInfo])

  useEffect(afterLoaded, [afterLoaded, jobInfo])

  return (
    <View className="job-detail-mr">
      <DetailSection title="职位描述">
        {jobInfo.product_direction && jobInfo.product_direction.length > 0 ? (
          <View className="job-detail-mr__tags">
            {jobInfo.product_direction.map((item, i) => (
              <View className="job-detail-mr__pdtag" key={i}>
                {item}
              </View>
            ))}
          </View>
        ) : null}

        <DetailsRecord title="产品名称：" value={jobInfo.product_name} />
        <DetailsRecord title="销售终端：" value={jobInfo.sales_terminal} />
        <DetailsRecord title="工作地点：" value={workAddress} />
        <DetailsRecord title="负责区域：" value={jobInfo.area} />
        <DetailsRecord title="市场分类：" value={jobInfo.market_category} />
        <DetailsRecord title="岗位级别：" value={jobInfo.jd_level} />
        <DetailsRecord title="薪资构成：" value={jobInfo.salary_composition} />
      </DetailSection>

      <DetailSection title={'任职要求' + jobType}>
        <DetailsRecord title="学术经验：" value={jobInfo.academic_experience} />
        <DetailsRecord title="专业要求：" value={jobInfo.major_require} />

        <View
          className="job-detail-mr__desc"
          dangerouslySetInnerHTML={{ __html: description }}
        ></View>
      </DetailSection>
      <Line />

      {jobInfo.jd_highlights && jobInfo.jd_highlights.length > 0 ? (
        <DetailSection title="职位亮点">
          <View className="job-detail-mr__desc">{jobInfo.jd_highlights.join('、')}</View>
        </DetailSection>
      ) : null}

      <Line />
    </View>
  )
}

export default MedicalRepresentativeTemplate
