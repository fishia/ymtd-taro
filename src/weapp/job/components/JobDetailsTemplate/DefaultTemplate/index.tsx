import React, { useEffect, useState } from 'react'
import R from 'ramda'
import _ from 'lodash'
import c from 'classnames'
import { View } from '@tarojs/components'

import { IDefaultJob } from '@/def/job'
import { delayQuerySelector } from '@/utils/taroUtils'
import { formatStringToHtml } from '@/services/StringService'
import Line from '@/components/Line'
import DetailSection from '../../DetailSection'
import { IJobDetailsTemplateProps } from '..'

import './index.scss'

const DefaultTemplate: React.FC<IJobDetailsTemplateProps<IDefaultJob>> = props => {
  const { jobInfo, afterLoaded = _.noop } = props

  const welfare = R.map(R.prop('name'))(jobInfo.benefits || [])
  const description = formatStringToHtml(jobInfo.desc || '')
  const demand = formatStringToHtml(jobInfo.requirement || '')
  const salaryStructure = formatStringToHtml(jobInfo.salary_structure || '')

  const [descFold, setDescFold] = useState(0)

  useEffect(() => {
    setTimeout(() => {
      delayQuerySelector('.job-detail__description', 100).then(temprect => {
        if (temprect?.[0]?.height > 200) {
          setDescFold(1)
        }
        afterLoaded()
      })
    }, 0)
  }, [afterLoaded, jobInfo])

  return (
    <>
      <View className={c('job-detail__brief', { 'job-detail__brief--fold': descFold === 1 })}>
        {descFold === 1 && (
          <View className="job-detail__viewall" onClick={() => void setDescFold(2)}>
            查看全部
          </View>
        )}

        {description && (
          <DetailSection title="职位描述" border={!!demand}>
            {welfare.length > 0 && (
              <>
                {welfare.map(v => (
                  <View className="job-detail__tag" key={v}>
                    {v}
                  </View>
                ))}
              </>
            )}
            <View
              className={c('job-detail__description', {
                'job-detail__description--fold': descFold === 1,
              })}
              dangerouslySetInnerHTML={{ __html: description }}
            ></View>
          </DetailSection>
        )}
        {demand && <DetailSection title="任职要求" border={!!salaryStructure} text={demand} />}
        {salaryStructure && (
          <DetailSection title="薪酬结构" border={false} text={salaryStructure} />
        )}
      </View>
      {(description || demand || salaryStructure) && <Line style={{ height: "1PX" }} />}

    </>
  )
}

export default DefaultTemplate
