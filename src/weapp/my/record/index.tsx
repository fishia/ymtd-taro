import { View } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import R from 'ramda'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { AtLoadMore, AtTabs, AtTabsPane } from 'taro-ui'

import { listRecordApi } from '@/apis/user'
import Empty from '@/components/Empty'
import JobCard from '@/components/JobCard'
import ScrollView from '@/components/ScrollView'
import { APP_DEF_PAGE_SIZE, STATIC_MP_IMAGE_HOST } from '@/config'
import { IList, LoadStatusType } from '@/def/common'
import { IEventExposeParams, IJob } from '@/def/job'
import { ApplyStatusType } from '@/def/user'
import { ExpChannelType } from '@/def/volcanoPoint'
import { useShowLoginPopup } from '@/hooks/custom/usePopup'
import useToast from '@/hooks/custom/useToast'
import { useCurrentUserInfo } from '@/hooks/custom/useUser'
import MainLayout from '@/layout/MainLayout'
import { renderJobDetailUrlByParams } from '@/utils/utils'

import './index.scss'

interface IRecordJd {
  id: number
  jd: IJob
}

const tabTitles = ['已投递', '已查看', '合适', '不合适'].map(title => ({ title }))
const flags: ApplyStatusType[] = ['all', 'viewed', 'suitable', 'unsuitable']
const fetchFns: Func1<number, Promise<IList<IRecordJd>>>[] = flags.map(flag => (page: number) =>
  listRecordApi(page, flag)
)

const Record: React.FC = () => {
  const currentUserInfo = useCurrentUserInfo()
  const showLoginPopup = useShowLoginPopup()
  const showToast = useToast()

  const [currentTab, setCurrentTab] = useState<number>(0)
  const [tabPageNum, setTabPageNum] = useState<number[]>([1, 1, 1, 1])

  const [allList, setAllList] = useState<IRecordJd[]>([])
  const [viewedList, setViewedList] = useState<IRecordJd[]>([])
  const [suitableList, setSuitableList] = useState<IRecordJd[]>([])
  const [unsuitableList, setUnsuitableList] = useState<IRecordJd[]>([])

  const [allStatus, setAllStatus] = useState<LoadStatusType>('more')
  const [viewedStatus, setViewedStatus] = useState<LoadStatusType>('more')
  const [suitableStatus, setSuitableStatus] = useState<LoadStatusType>('more')
  const [unsuitableStatus, setUnsuitableStatus] = useState<LoadStatusType>('more')

  const fetchFn = useMemo(() => fetchFns[currentTab], [currentTab])
  const [pageNum, setPageNum] = [
    tabPageNum[currentTab],
    num => {
      const pageNums = [...tabPageNum]
      pageNums[currentTab] = num
      setTabPageNum(pageNums)
    },
  ]
  const [list, setList] = [
    [allList, viewedList, suitableList, unsuitableList][currentTab],
    [setAllList, setViewedList, setSuitableList, setUnsuitableList][currentTab],
  ]
  const [pageStatus, setPageStatus] = [
    [allStatus, viewedStatus, suitableStatus, unsuitableStatus][currentTab],
    [setAllStatus, setViewedStatus, setSuitableStatus, setUnsuitableStatus][currentTab],
  ]

  const shouldAppendList = pageStatus === 'more'
  const appendList = () => {
    if (!shouldAppendList) {
      return
    }

    setPageStatus('loading')
    fetchFn(pageNum).then(pageData => {
      setList(R.uniqBy(item => item.jd.id, [...list, ...pageData.list]))
      setPageNum(pageData.current + 1)
      setPageStatus(pageData.current * APP_DEF_PAGE_SIZE >= pageData.total ? 'noMore' : 'more')
    })
  }

  // 进入页面、初次切换 TAB 时请求

  useEffect(
    () => {
      if (!currentUserInfo) {
        showLoginPopup({ showClear: false })
        return
      }

      if (pageNum === 1 && shouldAppendList) {
        appendList()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentTab, currentUserInfo]
  )

  const handleJobClick = useCallback(
    (job: IJob, eventExposeParams: IEventExposeParams) => {
      if (job.jd.id) {
        navigateTo({ url: renderJobDetailUrlByParams({ ...eventExposeParams, tag: job?.tag }) })
      } else {
        showToast({ content: '已停止招聘' })
      }
    },
    [showToast]
  )

  const RenderJobListContent = useCallback(
    (jobList, status) => {
      return (
        <View className="my-record__content">
          {jobList.length > 0 ? (
            <ScrollView className="my-record__scrollview" loadMore={appendList}>
              {jobList.map((job, i) => {
                const eventExposeParams: IEventExposeParams = {
                  jd_id: job.jd.id,
                  page_no: pageNum,
                  position_no: (i % 10) + 1,
                  exp_channel: ExpChannelType.DELIVER,
                  expose_id: job.exposeId,
                  expName: job.expName,
                  isSeed: job.isSeed,
                  isVirtual: job.isVirtual,
                }
                return (
                  <JobCard
                    key={job.jd.id}
                    data={job.jd}
                    onClick={() => {
                      const arr = [...jobList]
                      arr[i].isSeed = true
                      setList(arr)
                      handleJobClick(job, eventExposeParams)
                    }}
                    eventExposeParams={eventExposeParams}
                    relativeToClassName="my-record__scrollview"
                  />
                )
              })}
              <AtLoadMore
                noMoreText="没有更多了~"
                loadingText="正在加载中~"
                moreText="加载更多~"
                status={status}
              />
            </ScrollView>
          ) : (
            <Empty
              isLoading={status !== 'noMore'}
              picUrl={STATIC_MP_IMAGE_HOST + 'no-job.png'}
              text="没有符合条件的职位记录"
            />
          )}
        </View>
      )
    },
    [currentTab]
  )
  return (
    <MainLayout navBarTitle="投递记录" className="my-record">
      <AtTabs
        className="my-record__tabs"
        current={currentTab}
        tabList={tabTitles}
        onClick={setCurrentTab}
      >
        <AtTabsPane current={currentTab} index={0}>
          {RenderJobListContent(allList, allStatus)}
        </AtTabsPane>
        <AtTabsPane current={currentTab} index={1}>
          {RenderJobListContent(viewedList, viewedStatus)}
        </AtTabsPane>
        <AtTabsPane current={currentTab} index={2}>
          {RenderJobListContent(suitableList, suitableStatus)}
        </AtTabsPane>
        <AtTabsPane current={currentTab} index={3}>
          {RenderJobListContent(unsuitableList, unsuitableStatus)}
        </AtTabsPane>
      </AtTabs>
    </MainLayout>
  )
}

export default Record
