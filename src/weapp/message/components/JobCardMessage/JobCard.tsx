import { View, Image, Text } from '@tarojs/components'
import c from 'classnames'
import R from 'ramda'
import React, { useMemo } from 'react'

import colors from '@/assets/colors'
import TopSvg from '@/assets/imgs/top.svg'
import UrgentJobSvg from '@/assets/imgs/urgentJob.svg'
import Line from '@/components/Line'
import { IProps } from '@/def/common'
import { IJob, IMedicalRepresentativeJob, JobTemplateType } from '@/def/job'
import { isValidString, textHighLight } from '@/services/StringService'
import { combineStaticUrl } from '@/utils/utils'

import './JobCard.scss'

export interface IJobCardProps extends IProps {
  top?: boolean //置顶标签
  disabled?: boolean //是否停止招聘
  data: IJob
  className?: string
  simple?: boolean
  date?: boolean
  keyword?: string
  onClick?: (id: number | null) => void
  active?: boolean
  showTop?: boolean
  messageCard?: boolean
}

const getAddress = v => {
  return R.prop('city', v) || R.prop('province', v)
}

const JobCard: React.FC<IJobCardProps> = props => {
  const {
    className,
    style,
    // disabled = false,
    data,
    simple = false,
    onClick,
    keyword = '',
    active = false,
    showTop = true,
    messageCard: noLine = false,
  } = props

  const {
    company,
    id,
    name,
    salary,
    salary_month,
    work_time_name,
    education_name,
    addresses,
    is_top,
    status,
    status_name,
    benefits,
    is_priority,
    salary_type,
  } = data

  const displaySalary = useMemo(() => {
    const job = data as IMedicalRepresentativeJob
    const salaryText = salary || salary_month
    const salaryTimes =
      !salaryText || !job.salary_type || salaryText === '面议' ? '' : ' · ' + job.salary_type

    return salaryText + salaryTimes
  }, [data, salary, salary_month])

  const tags = useMemo(() => {
    const job = data as IMedicalRepresentativeJob
    const result: string[] = []
    // const location = R.compose(R.head, R.filter(isValidString), R.map(getAddress))(addresses)
    switch (data.template_type) {
      case JobTemplateType.MEDICAL_REPRESENTATIVE:
        // result.push(location as string)
        const productNames = R.take(2, job?.product_name?.split(/,/) || [])
        productNames.forEach(item => void result.push(item))

        R.take(4 - productNames.length, job.product_direction || []).forEach(
          item => void result.push(item)
        )

        return result
      case JobTemplateType.COMMON_TEMPLATE:
        // result.push(location as string)
        ;(job.keywords || []).forEach(item => void result.push(item))
        return result
      default:
        result.push(R.compose(R.join(' | '), R.filter(isValidString), R.map(getAddress))(addresses))
        result.push(work_time_name)
        result.push(education_name)
        if (benefits)
          R.compose(
            R.forEach((x: string) => result.push(x)),
            R.filter(isValidString),
            R.map(R.prop('name'))
          )(benefits)
        return result
    }
  }, [addresses, data, education_name, work_time_name, benefits])

  //const updateShow = computeRelativeTime(updated_at)

  // simple用于职位记录和职位收藏，这两个页面需用控制职位的状态
  const isValid = status === 1 || status_name === '上线' || !simple

  const handleClick = () => {
    const callId = isValid ? id : null
    onClick && onClick(callId)
  }

  const renderAddress = () => {
    const location = R.compose(
      R.head,
      R.filter(isValidString),
      R.map(getAddress)
    )(addresses) as string

    return <View className="hd-message-jobcard__company_address">{location}</View>
  }
  return (
    <>
      <View
        className={c('hd-message-jobcard', className, { 'hd-message-jobcard--disabled': !isValid })}
        style={style}
        onClick={handleClick}
      >
        <View className="hd-message-jobcard__basic">
          <View
            className={c(
              'hd-message-jobcard__title',
              { 'hd-message-jobcard__title--top': (showTop && is_top) || is_priority },
              {
                'hd-message-jobcard__title--is_priority':
                  (showTop && is_top && is_priority) ||
                  (((showTop && is_top) || is_priority) && salary_type),
              }
            )}
            dangerouslySetInnerHTML={{ __html: textHighLight(name, keyword) }}
          ></View>
          {is_priority ? <Image className="hd-message-jobcard__urgent" src={UrgentJobSvg} /> : null}
          {is_top ? <Image className="hd-message-jobcard__top" src={TopSvg} /> : null}
          {isValid ? (
            <View className="hd-message-jobcard__salary">{displaySalary}</View>
          ) : (
            <View className="hd-message-jobcard__salary" style={{ color: colors.textColor }}>
              停止招聘
            </View>
          )}
        </View>
        <View className="hd-message-jobcard__require">
          {tags.map(
            (item, i) =>
              item && (
                <View className="job-require__item" key={i}>
                  {item}
                </View>
              )
          )}
        </View>
        <View className={c('hd-message-jobcard__wanted', 'hd-message-jobcard__company')}>
          {company?.logo && (
            <Image
              src={combineStaticUrl(company.logo)}
              mode="aspectFit"
              className="hd-message-jobcard__icon"
            />
          )}
          {company?.name && (
            <View
              className="hd-message-jobcard__jobhunter"
              dangerouslySetInnerHTML={{ __html: textHighLight(company.name, keyword) }}
            ></View>
          )}
          {renderAddress()}
        </View>
      </View>
      {active ? <View className="acLine"></View> : noLine ? null : <Line />}
    </>
  )
}

export default JobCard
