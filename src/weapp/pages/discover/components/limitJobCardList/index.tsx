import { Text, View } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'

import JobCard from '@/components/JobCard'
import { ICompany, IEventExposeParams, IJavaJob, IJob, INewCompany } from '@/def/job'
import { sendDataRangersEvent } from '@/utils/dataRangers'
import { jsonToUrl, renderJobDetailUrlByParams, getMappingData } from '@/utils/utils'
import Company from '@/weapp/job/components/Company'

import './index.scss'

export interface ILimitJobCardList {
  overscanRowCount?: number //可视化范围内条数
  company?: INewCompany
  jdList?: IJavaJob[]
  tabTypeName?: string
}

const mapkey = {
  salaryType: 'salary_type',
  educationName: 'education_name',
  workTimeName: 'work_time_name',
  functionTypeName: 'function_type_name',
}
const prefixCls = 'limit-job-card-list'
const LimitJobCardList: React.FC<ILimitJobCardList> = props => {
  const { jdList = [], company, tabTypeName } = props

  // 点击列表项
  const handleClick = (job: IJavaJob, eventExposeParams?: IEventExposeParams) => {
    navigateTo({
      url: renderJobDetailUrlByParams({ jd_id: job.id, page_name: tabTypeName, tag: job?.tag }),
    })
  }

  const renderJobCard = job => (
    <JobCard
      key={job.id}
      onClick={() => handleClick(job)}
      data={{ ...job, status: 1 }}
      openObserverMode={false}
      simple
    />
  )
  const CutOffJobList = () => {
    return (
      <View className={`${prefixCls}__job`}>
        {jdList
          .map((item: any) => ({
            ...(getMappingData(item, mapkey) as IJob),
            keywords: item?.jdKeywords.map((obj: any) => obj.name) || [],
          }))
          .map(renderJobCard)}
      </View>
    )
  }

  //查看更多,小于等于5直接展示，大于5跳转公司主页
  const onLoadMore = (tab = 1) => {
    sendDataRangersEvent('company_click', {
      page_name: '发现公司',
      tab_type: tabTypeName,
    })
    navigateTo({
      url: `/weapp/job/company-index/index?${jsonToUrl({
        id: company?.id,
        tab,
      })}`,
    })
  }
  return (
    <View className={prefixCls}>
      <View className={`${prefixCls}__recruitList`}>
        <Company
          data={
            {
              ...getMappingData(company, {
                scaleName: 'scale_name',
                typeName: 'type_name',
              }),
              industries: company?.industryNameList?.map(item => ({ id: item, name: item })) || [],
            } as ICompany
          }
          onClick={() => onLoadMore(0)}
        />
        <View className={`${prefixCls}__jobCardList`}>{jdList && <CutOffJobList />}</View>
        {company?.positionNum && company?.positionNum > 3 ? (
          <View className={`${prefixCls}__btn`} onClick={() => onLoadMore()}>
            <Text>查看更多职位</Text>
            <View className="at-icon at-icon-chevron-right" style={{ marginBottom: '2rpx' }} />
          </View>
        ) : null}
      </View>
    </View>
  )
}

export default LimitJobCardList
