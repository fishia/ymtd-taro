import { View, Text, Image } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import c from 'classnames'
import _ from 'lodash'
import R from 'ramda'
import React, { useMemo, useState } from 'react'

import { jdAggregateZone } from '@/apis/job'
import HeadhuntingSvg from '@/assets/imgs/headhunting.svg'
import TopSvg from '@/assets/imgs/top.svg'
import UrgentJobSvg from '@/assets/imgs/urgentJob.svg'
import { IProps } from '@/def/common'
import { IJob, IMedicalRepresentativeJob } from '@/def/job'
import { useAsync } from '@/hooks/sideEffects/useAsync'
import { isValidString } from '@/services/StringService'
import { sendHongBaoEvent } from '@/utils/dataRangers'
import { jsonToUrl } from '@/utils/utils'

import './index.scss'

export interface IPositionProps extends IProps {
  data: IJob
  withIcon?: boolean
  border?: boolean
  simple?: boolean
  onClick?(): void
  choiceTag?: string
}

const getAddress = v => {
  return R.prop('city', v) || R.prop('province', v)
}

const Position: React.FC<IPositionProps> = props => {
  const {
    data,
    border = true,
    className,
    style,
    withIcon = true,
    simple = false,
    onClick = _.noop,
    choiceTag,
  } = props
  const {
    name,
    salary,
    salary_month,
    addresses,
    work_time_name,
    education_name,
    is_priority,
    is_top = false,
    isHeadhuntingJd,
    newTag,
    company,
    tag,
  } = data

  const { value: tabList } = useAsync(() => {
    return jdAggregateZone()
  }, [])

  const [showPriorityTips, setShowPriorityTips] = useState(true)
  const location = R.compose(R.join(' | '), R.filter(isValidString), R.map(getAddress))(addresses)

  const salaryDisplay = useMemo(() => {
    const job = data as IMedicalRepresentativeJob
    const salaryText = salary || salary_month
    const salaryTimes =
      !salaryText || !job.salary_type || salaryText === '面议' ? '' : ' · ' + job.salary_type

    return salaryText + salaryTimes
  }, [data, salary, salary_month])

  const goChoice = () => {
    const params = {
      type: 14,
      tag: choiceTag ? choiceTag : tag,
      choiceList: JSON.stringify(tabList),
    }

    sendHongBaoEvent('tipsclick', {
      tips_name: '职位详情tips',
    })

    navigateTo({
      url: `/weapp/job/job-choiceness/index?${jsonToUrl(params)}`,
    })
  }

  return (
    <View className={[className, 'job-position'].join(' ')} onClick={onClick}>
      <View className="job-position__basic" style={style}>
        <View className={c('job-position__basic-title', { 'line-ellipsis': simple })}>
          <View className="job-position__basic-name">
            {name}
            {is_priority || is_top || isHeadhuntingJd ? (
              <>
                {is_priority ? (
                  <Image className="job-position__basic__urgent" src={UrgentJobSvg} />
                ) : null}
                {is_top ? <Image className="job-position__basic__top" src={TopSvg} /> : null}
                {isHeadhuntingJd && !is_top && !is_priority ? (
                  <Image className="job-position__basic__hunter" src={HeadhuntingSvg} />
                ) : null}
              </>
            ) : newTag ? (
              <View className="job-position__basic__new">{newTag}</View>
            ) : null}
          </View>
        </View>
        <View className={c('job-position__basic-salary', { 'line-ellipsis': simple })}>
          {salaryDisplay}
        </View>
      </View>
      <View className="job-position__company">
        <Text className="icon iconfont iconcompany" />
        职位所属公司：{company.name}
      </View>
      <View
        className="job-position__require"
        style={border ? { borderBottom: '1px solid $bgColor' } : { borderBottom: 'none' }}
      >
        <View className="job-position__require__left">
          {location && (
            <Text className="job-position__require-item">
              {withIcon && <Text className="icon iconfont icondidian" />}
              {location}
            </Text>
          )}
          {work_time_name && (
            <Text className="job-position__require-item">
              {withIcon && <Text className="icon iconfont icongongling" />}

              {work_time_name}
            </Text>
          )}
          {education_name && (
            <Text className="job-position__require-item">
              {withIcon && <Text className="icon iconfont iconxueli" />}
              {education_name}
            </Text>
          )}
        </View>
      </View>
      {choiceTag || tag ? (
        <View className="job-position__fireTips" onClick={goChoice}>
          <View className="fireTipsLeft">
            <View className="icon iconfont iconfire" />
            职位入选【{choiceTag ? choiceTag : tag}】
          </View>
          <View className="fireTipsRignt">
            <Text>查看榜单详情</Text>
            <View className="icon iconfont iconright" />
          </View>
        </View>
      ) : null}
    </View>
  )
}

export default Position
