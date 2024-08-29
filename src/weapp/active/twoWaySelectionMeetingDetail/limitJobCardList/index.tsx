import { Text, View } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import { useState } from 'react'

import { IMeetingCompany } from '@/def/active'
import { IEventExposeParams, IJob } from '@/def/job'
import useToast from '@/hooks/custom/useToast'
import { jsonToUrl, renderJobDetailUrlByParams } from '@/utils/utils'

import ActiveJobCard from '../../components/ActiveJobCard'
import SimpleCompanyCard from '../../components/SimpleCompanyCard'

import './index.scss'

export interface ILimitJobCardList extends IMeetingCompany {
  overscanRowCount?: number //可视化范围内条数
}

const prefixCls = 'limit-job-card-list'
const LimitJobCardList: React.FC<ILimitJobCardList> = props => {
  const { jds: jdList = [], jd_count = 0, overscanRowCount = 2, ...companyData } = props

  const showToast = useToast()
  const [showMore, setShowMore] = useState(false)
  // 点击列表项
  const handleClick = (job: IJob, eventExposeParams?: IEventExposeParams) => {
    navigateTo({ url: renderJobDetailUrlByParams({ jd_id: job.id, tag: job?.tag }) })
  }

  const CutOffJobList = () => {
    const frontPartJobList: IJob[] = jdList.slice(0, overscanRowCount),
      latterPartJobList: IJob[] = jdList.slice(overscanRowCount)
    return (
      <View className={`${prefixCls}__job`}>
        {frontPartJobList.map((job, i) => {
          return (
            <ActiveJobCard
              key={i}
              onClick={() => handleClick(job)}
              data={{ ...job, status: 1 }}
              relativeToClassName={`${prefixCls}__scrollView`}
            />
          )
        })}
        {latterPartJobList.length && showMore
          ? latterPartJobList.map((job, i) => {
              return (
                <ActiveJobCard
                  key={i}
                  onClick={() => handleClick(job)}
                  data={{ ...job, status: 1 }}
                  relativeToClassName={`${prefixCls}__scrollView`}
                />
              )
            })
          : null}
      </View>
    )
  }

  //查看更多,小于等于5直接展示，大于5跳转公司主页
  const onLoadMore = () => {
    if (jd_count <= 5) setShowMore(true)
    else {
      navigateTo({
        url: `/weapp/job/company-index/index?${jsonToUrl({
          id: companyData.id,
          v: 0,
        })}`,
      })
    }
  }
  return (
    <View className={prefixCls}>
      <View className={`${prefixCls}__recruitList`}>
        <SimpleCompanyCard companyData={companyData} />
        <View className={`${prefixCls}__jobCardList`}>{jdList && <CutOffJobList />}</View>
        {jd_count > 2 && !showMore ? (
          <View className={`${prefixCls}__btn`} onClick={() => onLoadMore()}>
            <Text>查看更多职位</Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}

export default LimitJobCardList
