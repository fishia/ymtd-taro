import { View } from '@tarojs/components'
import { navigateTo, redirectTo } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { AtTabs, AtTabsPane } from 'taro-ui'

import { listHrJobsApi, detailHrInfoApi } from '@/apis/job'
import JobCard from '@/components/JobCard'
import Line from '@/components/Line'
import LoadMore from '@/components/LoadMore'
import ScrollView from '@/components/ScrollView'
import { APP_DEF_PAGE_SIZE } from '@/config'
import { LoadStatusType } from '@/def/common'
import { IEventExposeParams, IHrInfo, IJobWithIndex, JobStatusType } from '@/def/job'
import { ExpChannelType } from '@/def/volcanoPoint'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import useToast from '@/hooks/custom/useToast'
import MainLayout from '@/layout/MainLayout'
import { renderJobDetailUrlByParams } from '@/utils/utils'
import NoJob from '@/weapp/pages/job/components/NoJob'

import HrInfo from '../components/HrInfo'

import './index.scss'

const tabList = [{ title: '在招职位' }]

const HrJob = () => {
  const routerParams = useRouterParam()
  const defaultTab = routerParams.tab ? Number(routerParams.tab) : 0
  const [current, setCurrent] = useState<number>(defaultTab)

  const paramId = routerParams.id ? +routerParams.id : routerParams.scene
  const showToast = useToast()
  const [hrData, setHrData] = useState<IHrInfo>()
  const [pageNum, setPageNum] = useState<number>(1)
  const [list, setList] = useState<IJobWithIndex[]>([])
  const [status, setStatus] = useState<LoadStatusType>('more')
  // 请求招聘者主页
  useEffect(() => {
    if (!paramId) {
      redirectTo({ url: '/weapp/general/error/index' })
      return
    }
    detailHrInfoApi(paramId).then((res: any) => {
      if (res === null) {
        return
      }
      setHrData(res)
    })
  }, [paramId])

  // 请求追加列表
  const appendList = () => {
    if (!paramId || status === 'loading' || status === 'noMore') {
      return
    }

    setStatus('loading')
    listHrJobsApi(paramId, { page: pageNum }).then(pageData => {
      const listData = pageData.list

      setList(
        [...list, ...listData].map((item, i) => ({
          ...item,
          page_no: pageData.current,
          position_no: (i % 10) + 1,
        }))
      )
      setPageNum(pageData.current + 1)
      setStatus(pageData.current * APP_DEF_PAGE_SIZE >= pageData.total ? 'noMore' : 'more')
    })
  }

  // 进入页面后初次加载
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(appendList, [])

  // 点击列表项
  const handleClick = (job: IJobWithIndex, eventExposeParams, i) => {
    if (job.status === JobStatusType.OK) {
      const arr = [...list]
      arr[i].isSeed = true
      setList(arr)
      navigateTo({ url: renderJobDetailUrlByParams({ ...eventExposeParams, tag: job?.tag }) })
    } else {
      showToast({ content: '该职位已停止招聘' })
    }
  }

  // 没有更多且长度为 0 时渲染空状态
  if (!paramId || (status === 'noMore' && list.length <= 0)) {
    return (
      <MainLayout className="hr-job_index">
        <NoJob />
      </MainLayout>
    )
  }

  return (
    <MainLayout navBarTitle="招聘者主页" className="hr-job_index">
      {hrData && (
        <View className="hr-job_index__card">
          <HrInfo data={hrData} isLink={false} />
        </View>
      )}
      {hrData && <Line style={{ height: '1px' }} />}
      <ScrollView lowerThreshold={300} loadMore={appendList} className="hr-job_index__scrollView">
        {/* <View className="hr-job_index__title">在招职位</View> */}
        <AtTabs
          current={current}
          tabList={tabList}
          onClick={idx => {
            setCurrent(idx)
          }}
          // customStyle={{ top }}
        ></AtTabs>
        <AtTabsPane current={current} index={0}>
          <View className="hr-job_index__jobList">
            {list.map((job, i) => {
              const eventExposeParams: IEventExposeParams = {
                jd_id: job.id,
                page_no: job.page_no,
                position_no: job.position_no,
                exp_channel: ExpChannelType.HRHOME,
                expose_id: job.exposeId,
                expName: job.expName,
                isSeed: job.isSeed,
                isVirtual: job.isVirtual,
                hr_id: job.hr.id,
              }
              return (
                <JobCard
                  key={job.id}
                  className="hr-job_index__position"
                  data={job!}
                  onClick={() => handleClick(job, eventExposeParams, i)}
                  eventExposeParams={eventExposeParams}
                  relativeToClassName="hr-job_index__scrollView"
                  showChatBtn
                />
              )
            })}
            <LoadMore status={status} noMoreText="暂无更多职位啦~" />
          </View>
        </AtTabsPane>
      </ScrollView>
    </MainLayout>
  )
}
export default HrJob
