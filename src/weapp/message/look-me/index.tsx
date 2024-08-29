import { View } from '@tarojs/components'
import { navigateTo, showLoading, switchTab } from '@tarojs/taro'
import { useEffect, useState } from 'react'

import { lookMeLisAtApi, lookMeListBApi } from '@/apis/job'
import JobCard from '@/components/JobCard'
import LoadMore from '@/components/LoadMore'
import ScrollView from '@/components/ScrollView'
import { APP_DEF_PAGE_SIZE } from '@/config'
import { LoadStatusType } from '@/def/common'
import { IEventExposeParams, IJob, IJobSearch, JobStatusType } from '@/def/job'
import useToast from '@/hooks/custom/useToast'
import { renderJobDetailUrlByParams } from '@/utils/utils'
import { IJobData } from '@/weapp/pages/message/components/interact'

import './index.scss'

const LookMe = () => {
  const [pageNum, setPageNum] = useState<number>(1)
  const showToast = useToast()
  const [list, setList] = useState<IJob[]>([])
  const [switchOrigin, setSwitchOrigin] = useState<boolean>(false)
  const [pageStatus, setPageStatus] = useState<LoadStatusType>('more')
  const fetchFns: (params: IJobSearch, switchRegion: boolean) => Promise<IJobData> = (
    params,
    switchRegion
  ) => (switchRegion ? lookMeListBApi(params) : lookMeLisAtApi(params))

  useEffect(() => {
    fetchFns({ page: pageNum }, switchOrigin).then(pageData => {
      const newList = [...list, ...pageData.list]
      setList(newList)

      if (!switchOrigin && pageData.current * APP_DEF_PAGE_SIZE >= pageData.total) {
        setSwitchOrigin(true)
        setPageNum(1)

        return
      }

      if (switchOrigin && pageData.list.length < 10) {
        setPageStatus('noMore')
      }
    })
  }, [switchOrigin, pageNum])

  // 点击列表项
  const handleClick = (job: IJob, eventExposeParams: IEventExposeParams) => {
    if (job.status === JobStatusType.OK) {
      navigateTo({ url: renderJobDetailUrlByParams({ ...eventExposeParams, tag: job?.tag }) })
    } else {
      showToast({ content: '该职位已停止招聘' })
    }
  }

  // 生成职位卡片列表
  const renderJobCardList = (jobList: IJob[], footerTips?: string) => {
    return (
      <View>
        {jobList.map((job, i) => {
          const eventExposeParams: IEventExposeParams = {
            jd_id: job.id,
            page_no: pageNum,
            position_no: (i % 10) + 1,
            page_name: '看过我',
            exp_channel: '看过我',
            expose_id: job.exposeId,
            expName: job.expName,
            isSeed: job.isSeed,
            isVirtual: job.isVirtual,
          }
          return (
            <JobCard
              onClick={() => {
                const arr = [...jobList]
                arr[i].isSeed = true
                setList(arr)
                handleClick(job, eventExposeParams)
              }}
              key={i}
              data={job}
              eventExposeParams={eventExposeParams}
              relativeToClassName="interact-index__scrollview"
              footerTips={footerTips}
              showChatBtn
            />
          )
        })}
      </View>
    )
  }

  // const linkToHome = () => {
  //   switchTab({ url: '/weapp/pages/job/index' })
  // }

  const appendList = () => {
    showLoading({ title: '加载中……' })
    setPageStatus('loading')
    setPageNum(pageNum + 1)
  }

  return (
    <View className="look-me">
      <ScrollView className="look-me__scrollview" loadMore={appendList}>
        <View className="look-me__list">{renderJobCardList(list)}</View>
        <LoadMore
          status={pageStatus}
          noMoreText="没有更多了，只展示90天内的数据"
          // onClick={linkToHome}
        />
      </ScrollView>
    </View>
  )
}

export default LookMe
