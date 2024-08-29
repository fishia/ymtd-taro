import { View } from '@tarojs/components'
import { navigateTo, pxTransform } from '@tarojs/taro'
import c from 'classnames'
import classNames from 'classnames'
import R from 'ramda'
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { AtLoadMore } from 'taro-ui'

import { listZoneJobsApi, getJobFiltersApi, fetchtRecommendPosition } from '@/apis/job'
import DropDownMenu, { OptionsType } from '@/components/DropDownMenu'
import JobCard from '@/components/JobCard'
import ScrollView from '@/components/ScrollView'
import { APP_DEF_PAGE_SIZE } from '@/config'
import { PageStatus, IChoose } from '@/def/common'
import {
  IJobWithIndex,
  IJobList,
  IJobSearch,
  JobFilterIdMap,
  JobFilterNameMap,
  IJob,
  IEventExposeParams,
  ZonesJobFilterIdMap,
} from '@/def/job'
import { ExpChannel, ExpChannelType } from '@/def/volcanoPoint'
import { useCurrentCity, useUpdateCurrentCity } from '@/hooks/custom/useCity'
import useOnce from '@/hooks/custom/useOnce'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import useSelectLocation from '@/hooks/custom/useSelectLocation'
import useToast from '@/hooks/custom/useToast'
import { useAsyncFn } from '@/hooks/sideEffects/useAsync'
import useList from '@/hooks/state/useList'
import { mapIValueToIPair } from '@/services/ObjectService'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'
import { renderJobDetailUrlByParams, renderValidParams, getJobType } from '@/utils/utils'
import NoJob from '@/weapp/pages/job/components/NoJob'

import './index.scss'

interface IProps {
  title: string
  type: number
  functionName?: string
  jobFilters: IJobSearch
  className: string
  changeJobFilters: (params: IJobSearch) => void
  scrollHeight?: string
  filterClick?: (e: boolean) => void
}

const topNavHeight = 0
const ZonesList: React.FC<IProps> = props => {
  const {
    title,
    type,
    functionName,
    jobFilters,
    changeJobFilters,
    className,
    scrollHeight,
    filterClick,
  } = props

  const noJobTitle =
    String(type) === ExpChannelType.DIAMON5 ? '没有符合的职位，换一个条件试试吧' : ''

  const pageParam = useRouterParam()
  const city = useCurrentCity()
  const selectLocation = useSelectLocation()
  const updateCity = useUpdateCurrentCity()

  const [zoneRecommedIndex, setZoneRecommedIndex] = useState(-1)
  const { needShow: needShowZoneRecommedJobCard, setCurrentTips: setZoneRecommedJobCard } = useOnce(
    'showZoneRecommedJob',
    true
  )
  const [recommedJobCardData, setRecommedJobCardData] = useState<IJob[]>([])
  const isSameCardRef = useRef<any>(null)

  const showToast = useToast()

  const [list, { clear, push, set }] = useList<IJobWithIndex>()
  const [filterShow, setFilterShow] = useState<string>('')
  const [jobOptions, setJobOptions] = useState<OptionsType[]>([])
  const [companyOptions, setCompanyOptions] = useState<OptionsType[]>([])

  const [fetchState, fetchMethod] = useAsyncFn<() => Promise<IJobList>>(() => {
    return listZoneJobsApi(type, renderValidParams({ ...jobFilters, cityId: city.id }))
  }, [JSON.stringify({ jobFilters, city, type })])
  const [pageStatus, setPageStatus] = useState<PageStatus>(PageStatus.FINISHED)
  const loadStatus = useMemo(() => {
    const switchFn = R.cond([
      [R.prop('error'), R.always(undefined)],
      [R.prop('loading'), R.always('loading')],
      [
        R.T,
        state => {
          const { current, total } = R.pathOr({ current: 1, total: 0, list: [] }, ['value'], state)

          if (current * APP_DEF_PAGE_SIZE >= total) {
            return 'noMore'
          } else {
            return 'more'
          }
        },
      ],
    ])
    return switchFn(fetchState)
  }, [fetchState])
  const initFilterOptions = useCallback(() => {
    getJobFiltersApi().then(res => {
      setJobOptions([
        {
          series: { id: JobFilterIdMap.SALARY_SCOPE, name: JobFilterNameMap.SALARY_SCOPE },
          data: mapIValueToIPair(res[JobFilterIdMap.SALARY_SCOPE]),
        },
        {
          series: { id: JobFilterIdMap.WORK_TIME, name: JobFilterNameMap.WORK_TIME },
          data: mapIValueToIPair(res[JobFilterIdMap.WORK_TIME]),
        },
        {
          series: { id: JobFilterIdMap.EDUCATION, name: JobFilterNameMap.EDUCATION },
          data: mapIValueToIPair(res[JobFilterIdMap.EDUCATION]),
        },
        {
          series: { id: JobFilterIdMap.JD_PROPERTY, name: JobFilterNameMap.JD_PROPERTY },
          data: mapIValueToIPair(res[JobFilterIdMap.JD_PROPERTY]),
        },
      ])
      setCompanyOptions([
        {
          series: { id: JobFilterIdMap.COMPANY_TYPE, name: JobFilterNameMap.COMPANY_TYPE },
          data: mapIValueToIPair(res[JobFilterIdMap.COMPANY_TYPE]),
        },
        {
          series: { id: JobFilterIdMap.COMPANY_SCALE, name: JobFilterNameMap.COMPANY_SCALE },
          data: mapIValueToIPair(res[JobFilterIdMap.COMPANY_SCALE]),
        },
        {
          series: {
            id: JobFilterIdMap.COMPANY_INDUSTRY,
            name: JobFilterNameMap.COMPANY_INDUSTRY,
            multiLevel: true,
          },
          data: mapIValueToIPair(
            res[JobFilterIdMap.COMPANY_INDUSTRY].map(item => ({
              series: { id: JobFilterIdMap.COMPANY_INDUSTRY, name: item.name },
              data: mapIValueToIPair(item.options),
            }))
          ),
        },
      ])
    })
  }, [])

  useEffect(initFilterOptions, [initFilterOptions])
  // 处理搜索结果
  const handleFetchValue = fetchValue => {
    const { page } = jobFilters
    const resultList: IJobWithIndex[] = R.pathOr([], ['value', 'list'], fetchValue).map(
      (item: IJob, i) => ({
        page_no: page || 1,
        position_no: (i % 20) + 1,
        ...item,
      })
    )
    if (R.isEmpty(resultList)) {
      if (R.isEmpty(list) || page === 1) {
        clear()
        setPageStatus(PageStatus.EMPTY)
      }
    } else {
      page === 1 ? set(resultList) : push(...resultList)
      pageStatus !== PageStatus.FINISHED && setPageStatus(PageStatus.FINISHED)
    }
  }

  // 监听请求变化
  useEffect(() => {
    const switchFn = R.cond([
      [
        R.prop('loading'),
        () => {
          // return
        },
      ],
      [
        R.prop('error'),
        state => {
          const content = R.pathOr('加载失败', ['error', 'errorMessage'])(state)
          showToast({ content })
          return
        },
      ],
      [
        R.prop('value'),
        state => {
          handleFetchValue(state)
          return
        },
      ],
      [R.T, () => {}],
    ])
    switchFn(fetchState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchState, showToast])
  // 重选城市后Load加载,分页置为1
  useEffect(() => {
    updateJobFilters({
      page: 1,
    })
  }, [city])

  useEffect(() => {
    fetchMethod()
  }, [fetchMethod])

  //上拉加载
  const handleLoadMore = useCallback(() => {
    if (loadStatus === 'noMore' || loadStatus === 'loading') {
      return
    } else if (loadStatus === 'more') {
      let p = jobFilters.page!
      changeJobFilters({
        ...jobFilters,
        page: ++p,
      })
    }
  }, [loadStatus])
  //更新过滤项
  const updateJobFilters = obj => {
    changeJobFilters({
      ...jobFilters,
      ...obj,
    })
  }
  // 重置过滤项
  const resetFilter = (filterName: string) => {
    if (filterName === 'job') {
      return {
        expectSalaryList: undefined,
        workYearList: undefined,
        educationList: undefined,
        jdPropertyList: undefined,
        page: 1,
      }
    } else if (filterName === 'company') {
      return {
        companyTypeList: undefined,
        companyScaleList: undefined,
        industryList: undefined,
        page: 1,
      }
    }
  }
  // 重置过滤条件
  const handleFilterReset = (filterName: string) => {
    R.cond([
      [
        R.equals('job'),
        () => {
          updateJobFilters(resetFilter('job'))
        },
      ],
      [
        R.equals('company'),
        () => {
          updateJobFilters(resetFilter('company'))
        },
      ],
    ])(filterName)
  }

  // 过滤项埋点
  const filterTrack = (choosed: IChoose[], filterName: string) => {
    const filterMap = new Map([
      ['job', '职位'],
      ['company', '公司'],
    ])
  }

  // 确认过滤条件
  const handleFilterConfirm = (choosed: IChoose[], filterName: string) => {
    filterTrack(choosed, filterName)

    if (choosed.length === 0) {
      handleFilterReset(filterName)
      return
    }
    let options: IJobSearch = { page: 1 }
    for (let opt of choosed) {
      if (opt.category?.id) {
        const prop = ZonesJobFilterIdMap[opt.category.id]
        if (Array.isArray(options[prop])) {
          options[prop].push(opt.id)
        } else {
          options[prop] = [opt.id]
        }
      }
    }

    // 挑选出所有数组类型的字段
    const onlyArrays: any[] = R.pickBy(R.is(Array), options)

    // 使用R.uniq去重所有数组字段
    const uniqueArrays = R.map(R.uniq, onlyArrays)

    // 将去重后的数组字段放回原对象
    const result = R.merge(options, uniqueArrays)

    if (filterName === 'job') {
      updateJobFilters(R.mergeRight({ ...resetFilter('job') }, result))
    } else if (filterName === 'company') {
      updateJobFilters(R.mergeRight({ ...resetFilter('company') }, result))
    }
  }

  // 控制只能打开一个过滤条件
  const toggleFilter = (isOpen: boolean, filterName: string) => {
    filterClick?.(isOpen)
    if (!isOpen) {
      setFilterShow('')
      return
    }
    if (filterName === 'job' && isOpen) {
      setFilterShow('job')
    }
    if (filterName === 'company' && isOpen) {
      setFilterShow('company')
    }
  }
  const handleLocation = () => {
    selectLocation(updateCity, {})
  }
  //第一次搜索且没无结果不渲染Fiilter
  const renderFilter = () => {
    return (
      <View
        className={c(`${className}__filter`, `${className}__filter--hasTab`)}
        style={{
          top: functionName ? `calc(${topNavHeight}px + ${pxTransform(90)})` : `${topNavHeight}px`,
        }}
      >
        <View className="job-filter__city" onClick={handleLocation}>
          <View className="job-filter__cityName">{city.name}</View>
          <View className="at-icon at-icon-chevron-down" />
        </View>
        <DropDownMenu
          isOpened={filterShow === 'job'}
          name="job"
          title="职位筛选"
          dataSource={jobOptions}
          className="job-filter__menu"
          onConfirm={handleFilterConfirm}
          onClick={toggleFilter}
        />
        <DropDownMenu
          isOpened={filterShow === 'company'}
          name="company"
          title="公司筛选"
          dataSource={companyOptions}
          className="job-filter__menu job-filter-menu__right"
          onConfirm={handleFilterConfirm}
          onClick={toggleFilter}
        />
      </View>
    )
  }

  const onClickIsShowRecommedJobCard = (i: number, id: number | null) => {
    const isSameCard = isSameCardRef.current !== 'card' + id
    if (isSameCard && id) {
      isSameCardRef.current = 'card' + id
      fetchtRecommendPosition(id).then(data => {
        if (data?.length > 2) {
          setRecommedJobCardData(data.slice(0, 3))
          setZoneRecommedIndex(i)
          sendDataRangersEventWithUrl('EventExpose', {
            recommend_no: data.length || '0',
            event_name: '推荐职位卡片_相似职位推荐',
            icon_name: title,
          })
        }
      })
    }
  }

  const onCloseRecommedJobCard = () => {
    setZoneRecommedJobCard()
    setZoneRecommedIndex(-1)
  }

  const renderJobList = () => {
    return (
      <>
        <View className={`${className}__list`}>
          {list.map((v, index) => {
            const eventExposeParams: IEventExposeParams = {
              jd_id: v.id,
              page_no: v.page_no,
              position_no: v.position_no,
              search_city: city.name,
              icon_rank: pageParam?.icon_rank,
              exp_channel:
                String(type) === ExpChannelType.DIAMON5
                  ? `入选${jobFilters.tag}榜单`
                  : ExpChannel[type],
              expose_id: v.exposeId,
              expName: v.expName,
              isSeed: v.isSeed,
              isVirtual: v.isVirtual,
              jd_status: getJobType(v?.is_priority, v?.topStatus),
            }
            return (
              <View key={v.id}>
                <JobCard
                  className={`${className}__card`}
                  data={v}
                  eventExposeParams={eventExposeParams}
                  relativeToClassName={`${className}__scrollview`}
                  showChatBtn
                  onClick={() => {
                    const arr = [...list]
                    arr[index].isSeed = true
                    set(arr)
                    onClickIsShowRecommedJobCard(index, v.id)
                    navigateTo({
                      url: renderJobDetailUrlByParams({
                        ...eventExposeParams,
                        tag: v?.tag,
                      }),
                    })
                  }}
                  isShowRecommedJobCardBlock={
                    needShowZoneRecommedJobCard && index == zoneRecommedIndex
                  }
                  recommedJobCardData={recommedJobCardData}
                  onClickIsShowRecommedJobCard={() => onClickIsShowRecommedJobCard(index, v.id)}
                  onCloseRecommedJobCard={onCloseRecommedJobCard}
                  zoneTitle={title}
                  showSohoPopup={index === 4}
                  isShowResumeSticky={index === 9}
                  showPopup={index === 14}
                />
              </View>
            )
          })}
          <AtLoadMore
            noMoreText={
              String(type) === ExpChannelType.DIAMON5 ? '没有更多了，请试试其他榜单' : '没有更多了~'
            }
            loadingText="正在加载中~"
            moreText="加载更多~"
            status={loadStatus}
          />
        </View>
      </>
    )
  }

  const renderContent = () => {
    switch (pageStatus) {
      case PageStatus.EMPTY:
        return (
          <View
            className={c(`${className}__empty`, `${className}__empty--no-swiper`)}
            style={{
              top: functionName
                ? `calc(${topNavHeight}px + ${pxTransform(180)})`
                : `calc(${topNavHeight}px + ${pxTransform(90)})`,
            }}
          >
            <NoJob title={noJobTitle} />
          </View>
        )
      case PageStatus.FINISHED:
        return renderJobList()
      default:
        return (
          <NoJob
            title={noJobTitle}
            custom
            onClick={() => updateJobFilters({ page: 1, refesh: Math.random() })}
          />
        )
    }
  }

  return (
    <>
      {renderFilter()}
      <ScrollView
        className={`${className}__scrollview`}
        style={{
          top: functionName
            ? `calc(${topNavHeight}px + ${pxTransform(180)})`
            : `calc(${topNavHeight}px + ${pxTransform(90)})`,
          height: scrollHeight,
        }}
        loadMore={handleLoadMore}
      >
        <View className={`${className}__container`}>{renderContent()}</View>
      </ScrollView>
    </>
  )
}

export default ZonesList
