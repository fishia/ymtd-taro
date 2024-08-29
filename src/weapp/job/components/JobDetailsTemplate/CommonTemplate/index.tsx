import { View } from '@tarojs/components'
import _ from 'lodash'
import R from 'ramda'
import React, { useEffect, useMemo } from 'react'

import { IMedicalRepresentativeJob } from '@/def/job'
import { formatStringToHtml } from '@/services/StringService'

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

const CommonTemplate: React.FC<IJobDetailsTemplateProps<IMedicalRepresentativeJob>> = props => {
  const { jobInfo, afterLoaded = _.noop } = props

  const jobType = jobInfo.property_name ? ' · ' + jobInfo.property_name : ''

  const description = useMemo(() => formatStringToHtml(jobInfo.desc || ''), [jobInfo])

  useEffect(afterLoaded, [afterLoaded, jobInfo])

  return (
    <View className="job-detail-mr">
      <DetailSection title="职位详情">
        {jobInfo.keywords && jobInfo.keywords.length > 0 ? (
          <View className="job-detail-mr__tags">
            {jobInfo.keywords.map((item, i) => (
              <View className="job-detail-mr__pdtag" key={i}>
                {item}
              </View>
            ))}
          </View>
        ) : null}
      </DetailSection>

      {/* <DetailSection title={'任职要求' + jobType}>
        <DetailsRecord title="学术经验：" value={jobInfo.academic_experience} />
        <DetailsRecord title="专业要求：" value={jobInfo.major_require} /> */}

      <View
        className="job-detail-mr__desc"
        dangerouslySetInnerHTML={{ __html: description }}
      ></View>
      {/* </DetailSection> */}

      {jobInfo.highlights && jobInfo.highlights.length > 0 ? (
        // <DetailSection title="职位亮点">
        //   <View className="job-detail-mr__desc">
        //     {jobInfo.highlights.map(item => item).join('、')}
        //   </View>
        // </DetailSection>
        <View className="job-detail-mr__desc">
          <View>职位亮点：</View>
          {jobInfo.highlights.map(item => item).join('、')}
        </View>
      ) : null}
    </View>
  )
}

export default CommonTemplate
