import { View } from '@tarojs/components'
import {
  getStorageSync,
  hideLoading,
  navigateTo,
  pxTransform,
  setStorageSync,
  showLoading,
  switchTab,
  useDidShow,
} from '@tarojs/taro'
import { useGetState } from 'ahooks'
import R from 'ramda'
import React, { useEffect, useMemo, useState, useImperativeHandle } from 'react'

import { likeMeListApi, lookMeLisAtApi, lookMeListBApi, newJdTabApi } from '@/apis/job'
import JobCard from '@/components/JobCard'
import CustomNavTab, { statusBarHeight, tabItem } from '@/components/NavTab'
import ResumeStickyAd from '@/components/ResumeStickyAd'
import ScrollView from '@/components/ScrollView'
import { APP_DEF_PAGE_SIZE, IM_INTERACT_IDS } from '@/config'
import { IList, LoadStatusType } from '@/def/common'
import { IEventExposeParams, IJob, IJobSearch, JobStatusType } from '@/def/job'
import { ExpChannel } from '@/def/volcanoPoint'
import useToast from '@/hooks/custom/useToast'
import { useCurrentUserInfo } from '@/hooks/custom/useUser'
import { renderJobDetailUrlByParams } from '@/utils/utils'
import NoJob from '@/weapp/pages/job/components/NoJob'

import LoadMore from './LoadMore'

import './index.scss'

export interface IJobData extends IList<IJob> {
  isShowRedPoint?: boolean
}

export interface InteractRef {
  clearFirstDot: () => void
  rememberLatestId: () => void
  goTab: (i: number) => void
}

const fetchFns: Func2<IJobSearch, boolean, Promise<IJobData>>[] = [
  (params: IJobSearch) => likeMeListApi(params),
  (params: IJobSearch, switchRegion: boolean) =>
    switchRegion ? lookMeListBApi(params) : lookMeLisAtApi(params),
  (params: IJobSearch) => newJdTabApi(params),
]

const noTips = ['暂无HR收藏过你', '暂无HR看过你', '暂无新职位']
const Interact = ({ onChangeTabs }, ref) => {
  const showToast = useToast()
  const userInfo = useCurrentUserInfo()!
  const isHideResume = userInfo ? !userInfo.is_open : false

  const [currentTab, setCurrentTab] = useState(0)
  const [tabPageNum, setTabPageNum, getTabPageNum] = useGetState<number[]>([1, 1, 1])
  const [tabLatestId, setTabLatestId, getTabLatestId] = useGetState<number[]>(
    getStorageSync(IM_INTERACT_IDS) || [0, 0, 0]
  )
  const [tabJobList, setTabJobList, getTabJobList] = useGetState<IJob[][]>([[], [], []])
  const [tabStatus, setTabStatus, getTabStatus] = useGetState<LoadStatusType[]>([
    'more',
    'more',
    'more',
  ])
  const [tabList, setTabList, getTabList] = useGetState<tabItem[]>([
    { title: '对我感兴趣' },
    { title: '看过我' },
    { title: '新职位' },
  ])
  const [switchOrigin, setSwitchOrigin] = useState(false)
  const [scrollTop, setScrollTop] = useState(0)

  useImperativeHandle(ref, () => ({
    clearFirstDot: () =>
      updateState(setTabList, getTabList(), 0, {
        ...tabList[0],
        new: false,
      }),
    rememberLatestId: () => {
      setTabLatestId(tabJobList.map(item => item[0]?.id || 0))
    },
    goTab: (i: number) => setCurrentTab(i),
  }))

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
    tabJobList[currentTab],
    jobs => {
      const pageJobList: IJob[][] = [...tabJobList]
      pageJobList[currentTab] = jobs
      setTabJobList(pageJobList)
    },
  ]
  const [pageStatus, setPageStatus] = [
    tabStatus[currentTab],
    bool => {
      const pageStatuses = [...tabStatus]
      pageStatuses[currentTab] = bool
      setTabStatus(pageStatuses)
    },
  ]
  const lastestId = tabLatestId[currentTab] || 0
  // TODO记录每个tab红点状态
  const [newDots, setNewDots] = [
    tabList[currentTab].new,
    bool => {
      const pageTabList = [...tabList]
      pageTabList[currentTab].new = bool
      setTabList(pageTabList)
      onChangeTabs(R.any(R.equals(true))(pageTabList.map(item => item.new || false)))
    },
  ]

  const updateState = (
    fn: React.Dispatch<React.SetStateAction<any>>,
    state: any,
    index: number,
    value: any
  ) => {
    const newState = [...state]
    newState[index] = value
    fn(newState)
  }

  const initData = () => {
    setCurrentTab(0)
    setSwitchOrigin(false)
    setTabPageNum([1, 1, 1])
    setTabJobList([[], [], []])
    setTabStatus(['more', 'more', 'more'])
  }

  // 组件加载时去获取每个tab首位id和红点状态
  useDidShow(() => {
    initData()
    setTimeout(() => {
      fetchFns.forEach((fn, i) =>
        fn({ page: 1, lastestId: tabLatestId[i] || 0 }, false)
          .then(async data => {
            if (data) {
              updateState(setTabJobList, getTabJobList(), i, data.list)
              updateState(setTabList, getTabList(), i, {
                ...tabList[i],
                new: data.isShowRedPoint,
              })
              if (i === 1 && data.current * APP_DEF_PAGE_SIZE >= data.total) {
                await checkDataFinisied(data)
              } else {
                await updateState(setTabPageNum, getTabPageNum(), i, data.current + 1)
                await updateState(
                  setTabStatus,
                  getTabStatus(),
                  i,
                  data.current * APP_DEF_PAGE_SIZE >= data.total ? 'noMore' : 'more'
                )
              }
            }
          })
          .catch(err => {
            showToast({ content: '互动接口异常\n' + err.message })
          })
      )
    }, 0)
  })

  useEffect(() => {
    setStorageSync(IM_INTERACT_IDS, getTabLatestId())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabLatestId])

  useEffect(() => {
    onChangeTabs(R.any(R.equals(true))(tabList.map(item => item.new || false)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabList])

  // 判断看过我数据源1是否结束,如果结束则继续请求源2
  const checkDataFinisied = (data: IJobData) => {
    if (!switchOrigin) {
      setSwitchOrigin(true)
      fetchFns[1]({ page: 1, lastestId: getTabLatestId()[1] || 0 }, true).then(pageData => {
        let tempJobList: IJob[] = R.uniqBy(item => item.id, [
          ...getTabJobList()[1],
          ...pageData.list,
        ])
        updateState(setTabJobList, getTabJobList(), 1, tempJobList)
        updateState(setTabPageNum, getTabPageNum(), 1, pageData.current + 1)
        updateState(
          setTabStatus,
          getTabStatus(),
          1,
          pageData.current * APP_DEF_PAGE_SIZE >= pageData.total ? 'noMore' : 'more'
        )
      })
    } else {
      updateState(setTabStatus, getTabStatus(), 1, 'noMore')
    }
  }

  const shouldAppendList = pageStatus === 'more'

  // 纯做加载更多，初始化交给useDidshow
  const appendList = () => {
    // 没有红点时不重新加载
    if (!shouldAppendList) {
      return
    }
    showLoading({ title: '加载中...' })
    setPageStatus('loading')
    fetchFn({ page: pageNum, lastestId }, switchOrigin)
      .then(pageData => {
        let tempJobList: IJob[] = R.uniqBy(item => item.id, [...list, ...pageData.list])
        setList(tempJobList)
        if (currentTab === 1 && pageData.current * APP_DEF_PAGE_SIZE >= pageData.total) {
          checkDataFinisied(pageData)
        } else {
          setPageNum(pageData.current + 1)
          setPageStatus(pageData.current * APP_DEF_PAGE_SIZE >= pageData.total ? 'noMore' : 'more')
        }
      })
      .finally(() => void hideLoading())
  }

  // 切换 TAB 时去除红点

  useEffect(
    () => {
      setScrollTop(Math.random())
      if (newDots) {
        setNewDots(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentTab]
  )

  //按日期聚合之后生成新数组遍历
  const renderNewListByDate = useMemo(() => {
    return Object.entries(R.groupBy(item => item.associatedTime || '', tabJobList[0]))
  }, [tabJobList])

  //
  const showTips = useMemo(() => isHideResume, [isHideResume])

  // 点击列表项
  const handleClick = (job: IJob, eventExposeParams: IEventExposeParams) => {
    if (job.status === JobStatusType.OK) {
      navigateTo({ url: renderJobDetailUrlByParams({ ...eventExposeParams, tag: job?.tag }) })
    } else {
      showToast({ content: '该职位已停止招聘' })
    }
  }

  // 生成职位卡片列表
  const RenderJobCardList = (jobList: IJob[], footerTips?: string) => {
    return (
      <View>
        {jobList.map((job, i) => {
          const eventExposeParams: IEventExposeParams = {
            jd_id: job.id,
            page_no: pageNum,
            position_no: (i % 10) + 1,
            page_name: tabList[currentTab].title,
            exp_channel: ExpChannel[tabList[currentTab].title],
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

  const linkToHome = () => {
    switchTab({ url: '/weapp/pages/job/index' })
  }

  // 生成页面内容
  const RenderContent = () => {
    // 没有更多且长度为 0 时渲染空状态
    if (pageStatus === 'noMore' && list.length <= 0) {
      const isShowResumeStickyAd = currentTab === 1

      return (
        <>
          {isShowResumeStickyAd && <ResumeStickyAd adKey="chat-look-me" className="message__ad" />}
          <NoJob
            style={{
              paddingTop: pxTransform(198),
              borderTop: isShowResumeStickyAd ? 'none' : '1px solid #E2E4EE',
            }}
            custom
            onClick={linkToHome}
            title={noTips[currentTab]}
            btnText="查看推荐"
          />
        </>
      )
    } else {
      return (
        <ScrollView
          loadMore={appendList}
          className="interact-index__scrollview"
          scrollTop={scrollTop}
          style={{
            top: showTips
              ? `calc(${statusBarHeight}px + ${pxTransform(96 + 88 + 84)})`
              : `calc(${statusBarHeight}px + ${pxTransform(96 + 88)})`,
          }}
        >
          <View className="interact-index__list">
            {currentTab === 1 ? (
              <ResumeStickyAd adKey="chat" className="message__ad-look-me" />
            ) : null}
            {currentTab > 0
              ? RenderJobCardList(list)
              : renderNewListByDate.map((item, i) => (
                  <View className="interact-index__aggregateCard" key={i}>
                    <View className="interact-index__aggregateCard__title">{item[0]}</View>
                    {RenderJobCardList(item[1], '收藏了我')}
                  </View>
                ))}
            <LoadMore
              status={pageStatus}
              noMoreText={currentTab === 1 ? '没有更多了，只展示90天内的数据' : '没有更多了'}
              onClick={linkToHome}
            />
          </View>
        </ScrollView>
      )
    }
  }

  return (
    <View className="interact-index">
      <View
        className="interact-index__content"
        style={{
          top: `calc(${statusBarHeight}px + ${pxTransform(88)})`,
        }}
      >
        <CustomNavTab
          className="customTab"
          tabList={tabList}
          current={currentTab}
          onClick={setCurrentTab}
          fixed={false}
          underLine
        />
        <View>
          {showTips && (
            <View className="interact-index__tips">
              <View className="interact-index__text">你已隐藏简历，公开后获得更多求职机会</View>
              <View
                className="interact-index__text"
                onClick={() => {
                  navigateTo({ url: '/weapp/my/privacy/index' })
                }}
              >
                去开启
                <View className="at-icon at-icon-chevron-right" />
              </View>
            </View>
          )}
        </View>
        {RenderContent()}
      </View>
    </View>
  )
}
export default React.forwardRef(Interact)
