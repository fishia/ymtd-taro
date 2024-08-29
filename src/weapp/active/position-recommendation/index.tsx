import { View, Navigator, Image } from '@tarojs/components'
import { setNavigationBarTitle } from '@tarojs/taro'
import R from 'ramda'
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
} from 'react'
import { AtLoadMore } from 'taro-ui'

import { listJobsApi, listCompanyApi } from '@/apis/active-page'
import { getJobFiltersApi } from '@/apis/job'
import DropDownMenu, { OptionsType } from '@/components/DropDownMenu'
import JobCard from '@/components/JobCard'
import ScrollBar from '@/components/ScrollBar'
import { APP_DEF_PAGE_SIZE } from '@/config'
import { detailProps } from '@/def/active'
import { PageStatus, IChoose, ILocation } from '@/def/common'
import { IJobList, IJobSearch, JobFilterIdMap, JobFilterNameMap } from '@/def/job'
import { useCurrentCity } from '@/hooks/custom/useCity'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import useSelectLocation from '@/hooks/custom/useSelectLocation'
import useToast from '@/hooks/custom/useToast'
import { useAsyncFn } from '@/hooks/sideEffects/useAsync'
import useList from '@/hooks/state/useList'
import MainLayout from '@/layout/MainLayout'
import { mapIValueToIPair } from '@/services/ObjectService'
import { combineStaticUrl } from '@/utils/utils'

import NoJob from '../../pages/job/components/NoJob'
import CompanyCard from '../components/ActiveCompanyCard'
import CompanyNameSearch from '../components/CompanyNameSearch'
import TitleCard from '../components/titleCard'

import '../index.scss'
import './index.scss'

interface ZonesProps {
  isSale: boolean
  description: { city_id: number; city_name: string }
  showPosition: string
  keyword: string
  activeType: number
}
interface childRef {
  current: object
  getLoadMore: () => void
}

const PositionRecommendation: React.FC = () => {
  const routerParams = useRouterParam()
  const detail = JSON.parse(decodeURIComponent(routerParams.detail))
  const scrollRef = useRef<{ setInitTop: (scrollTop: number) => void; top: number }>(null)
  const childRef = useRef<childRef>()
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    setNavigationBarTitle({ title: detail.activity_name })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <MainLayout className="active">
      <ScrollBar loadMore={() => childRef.current?.getLoadMore()} ref={scrollRef}>
        <View className="active-common-page">
          <View className="header-banner">
            <Image src={combineStaticUrl(detail.promotional_image.image)} />
          </View>
          <View
            className="back-ground"
            style={`background-image:url(${combineStaticUrl(detail.background.image)})`}
          >
            <TitleCard aggregations={detail.aggregations} />
            <View className="search-input">
              <CompanyNameSearch
                placeholder={detail.showPosition == 'position' ? '搜索职位名称' : '搜索公司名称'}
                fetchMethod={setKeyword}
              />
            </View>
            <Zones
              isSale={detail.isSale}
              description={detail.description}
              showPosition={detail.showPosition}
              ref={childRef}
              keyword={keyword}
              activeType={detail.activeType}
            />
          </View>
        </View>
      </ScrollBar>
    </MainLayout>
  )
}

const Zones = React.forwardRef((props: ZonesProps, ref) => {
  const { showPosition, keyword } = props
  const globalCity = useCurrentCity()
  const [pageCity, setPageCity] = useState<ILocation>(
    props.description
      ? { id: props.description.city_id, name: props.description.city_name }
      : globalCity
  )
  const selectLocation = useSelectLocation()

  const showToast = useToast()

  const hideCompanyFilter = props?.description?.city_id

  useImperativeHandle(ref, () => ({
    getLoadMore: () => {
      return handleLoadMore()
    },
    fetchMethod: () => {
      return fetchMethod()
    },
  }))

  const [list, { clear, push, set }] = useList<detailProps>()

  const [jobFilters, setJobFilters] = useState<IJobSearch>({
    page: 1,
    work_time: [1, 4].indexOf(props.activeType) > -1 ? '-1' : null,
  })
  const [filterShow, setFilterShow] = useState<string>('')
  const [jobOptions, setJobOptions] = useState<OptionsType[]>([])
  const [isOpens, setIsOpens] = useState<boolean>(false)
  const [companyOptions, setCompanyOptions] = useState<OptionsType[]>([])
  const [nature, setNature] = useState<OptionsType[]>([])
  const [scale, setScale] = useState<OptionsType[]>([])
  const [profession, setProfession] = useState<OptionsType[]>([])

  const [fetchState, fetchMethod] = useAsyncFn<() => Promise<IJobList>>(() => {
    if (showPosition === 'position') {
      return listJobsApi(
        { ...jobFilters, city_id: pageCity.id, keyword },
        props.isSale,
        props.activeType
      )
    } else {
      return listCompanyApi(
        { ...jobFilters, city_id: pageCity.id, keyword },
        props.isSale,
        props.activeType
      )
    }
  }, [jobFilters, pageCity, keyword])

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

  useEffect(() => {
    getJobFiltersApi().then(res => {
      setJobOptions([
        {
          series: { id: JobFilterIdMap.SALARY_SCOPE, name: JobFilterNameMap.SALARY_SCOPE },
          data: mapIValueToIPair(res[JobFilterIdMap.SALARY_SCOPE]),
        },
        {
          series: { id: JobFilterIdMap.WORK_TIME, name: JobFilterNameMap.WORK_TIME },
          data: mapIValueToIPair(res[JobFilterIdMap.WORK_TIME]).map(item => ({
            ...item,
            selected:
              props.activeType === 5 && (item.id === '-1' || item.id === '1') ? true : false,
          })),
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
          series: { id: JobFilterIdMap.COMPANY_INDUSTRY, name: JobFilterNameMap.COMPANY_INDUSTRY },
          data: mapIValueToIPair(res[JobFilterIdMap.COMPANY_INDUSTRY]),
        },
      ])
      setNature([
        {
          series: { id: JobFilterIdMap.TYPE, name: JobFilterNameMap.COMPANY_TYPE },
          data: mapIValueToIPair(res[JobFilterIdMap.COMPANY_TYPE]),
        },
      ])
      setScale([
        {
          series: { id: JobFilterIdMap.SCALE, name: JobFilterNameMap.COMPANY_SCALE },
          data: mapIValueToIPair(res[JobFilterIdMap.COMPANY_SCALE]),
        },
      ])
      setProfession([
        {
          series: { id: JobFilterIdMap.COMPANY_INDUSTRY, name: JobFilterNameMap.COMPANY_INDUSTRY },
          data: mapIValueToIPair(
            res[JobFilterIdMap.COMPANY_INDUSTRY].map(item => ({
              series: { id: JobFilterIdMap.COMPANY_INDUSTRY, name: item.label },
              data: mapIValueToIPair(item.options),
            }))
          ),
        },
      ])
    })
  }, [])

  // 处理搜索结果
  const handleFetchValue = fetchValue => {
    const resultList = R.pathOr([], ['value', 'list'], fetchValue)
    const { page } = jobFilters
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
      [R.prop('loading'), R.T],
      [
        R.prop('error'),
        state => {
          const content = R.pathOr('加载失败', ['error', 'errorMessage'])(state)
          showToast({ content })
        },
      ],
      [R.prop('value'), handleFetchValue],
      [R.T, R.T],
    ])
    switchFn(fetchState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchState, showToast])

  // 重选城市后Load加载,分页置为1
  useEffect(() => {
    updateJobFilters({ page: 1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCity.id, keyword])

  // 重选城市后Load加载,分页置为1
  // TODO: 此页面逻辑有问题，首页加载请求2遍接口，此处临时处理，后期需要优化
  const [isInit, setIsInit] = useState<boolean>(false)
  useEffect(() => {
    if (isInit) {
      fetchMethod()
    }
    setIsInit(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchMethod])

  //上拉加载
  const handleLoadMore = useCallback(() => {
    if (loadStatus === 'noMore') {
      return
    } else if (loadStatus === 'more') {
      setJobFilters({ page: (jobFilters.page || 0) + 1 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadStatus])

  //更新过滤项
  const updateJobFilters = obj => {
    setJobFilters({ ...jobFilters, ...obj })
  }

  // 重置过滤项
  const resetFilter = (filterName: string) => {
    if (filterName === 'job') {
      return {
        salary_scope: undefined,
        work_time: undefined,
        education: undefined,
        jd_property: undefined,
        page: 1,
      }
    } else if (filterName === 'company') {
      return {
        company_type: undefined,
        company_scale: undefined,
        industry: undefined,
        page: 1,
      }
    } else if (filterName === 'nature') {
      return {
        type: undefined,
        page: 1,
      }
    } else if (filterName === 'scale') {
      return {
        scale: undefined,
        page: 1,
      }
    } else if (filterName === 'profession') {
      return {
        industry: undefined,
        page: 1,
      }
    }
  }

  // 重置过滤条件
  const handleFilterReset = (filterName: string) => {
    R.cond([
      [R.equals('job'), () => void updateJobFilters(resetFilter('job'))],
      [R.equals('company'), () => void updateJobFilters(resetFilter('company'))],
      [R.equals('nature'), () => void updateJobFilters(resetFilter('nature'))],
      [R.equals('scale'), () => void updateJobFilters(resetFilter('scale'))],
      [R.equals('profession'), () => void updateJobFilters(resetFilter('profession'))],
    ])(filterName)
  }

  // 确认过滤条件
  const handleFilterConfirm = (choosed: IChoose[], filterName: string) => {
    setIsOpens(false)
    if (choosed.length === 0) {
      handleFilterReset(filterName)
      return
    }

    let options: IJobSearch = { page: 1 }
    for (let opt of choosed) {
      const prop = opt.category?.id
      if (prop) {
        if (Array.isArray(options[prop])) {
          options[prop].push(opt.id)
        } else {
          options[prop] = [opt.id]
        }
      }
    }
    const mapFn = v => {
      if (Array.isArray(v)) {
        return v.join(',')
      }
      return v
    }
    // 将过滤项数组转为,拼接的字符串
    options = R.map(mapFn, options)
    if (filterName === 'job') {
      updateJobFilters(R.mergeRight({ ...resetFilter('job') }, options))
    } else if (filterName === 'company') {
      updateJobFilters(R.mergeRight({ ...resetFilter('company') }, options))
    } else if (filterName === 'nature') {
      updateJobFilters(R.mergeRight({ ...resetFilter('nature') }, options))
    } else if (filterName === 'scale') {
      updateJobFilters(R.mergeRight({ ...resetFilter('scale') }, options))
    } else if (filterName === 'profession') {
      updateJobFilters(R.mergeRight({ ...resetFilter('profession') }, options))
    }
  }

  // 控制只能打开一个过滤条件
  const toggleFilter = (isOpen: boolean, filterName: string) => {
    console.log(filterName)
    setIsOpens(isOpen)
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
    if (filterName === 'nature' && isOpen) {
      setFilterShow('nature')
    }
    if (filterName === 'scale' && isOpen) {
      setFilterShow('scale')
    }
    if (filterName === 'profession' && isOpen) {
      setFilterShow('profession')
    }
  }

  const handleSelectLocation = () => {
    selectLocation(setPageCity, {})
  }

  //第一次搜索且没无结果不渲染Fiilter
  const renderFilter = () => {
    return (
      <View className={`zones-index__filter ${isOpens ? 'zones-index__positions' : null} `}>
        {showPosition && showPosition === 'position' ? (
          <>
            {!hideCompanyFilter ? (
              <>
                <View className="job-filter__city" onClick={handleSelectLocation}>
                  <View className="job-filter__cityName">{pageCity.name}</View>
                  <View className="at-icon at-icon-chevron-down" />
                </View>
                <View className="job-filter__divider" />
              </>
            ) : null}
            <DropDownMenu
              isOpened={filterShow === 'job'}
              name="job"
              title="职位筛选"
              dataSource={jobOptions}
              className="job-filter__menu"
              onConfirm={handleFilterConfirm}
              onClick={toggleFilter}
            />
            <View className="job-filter__divider" />
            <DropDownMenu
              isOpened={filterShow === 'company'}
              name="company"
              title="公司筛选"
              dataSource={companyOptions}
              className="job-filter__menu job-filter-menu__right"
              onConfirm={handleFilterConfirm}
              onClick={toggleFilter}
            />
          </>
        ) : (
          <>
            <DropDownMenu
              isOpened={filterShow === 'nature'}
              name="nature"
              title="性质"
              dataSource={nature}
              className="job-filter__menu job-filter-menu__right"
              onConfirm={handleFilterConfirm}
              onClick={toggleFilter}
            />
            <View className="job-filter__divider" />
            <DropDownMenu
              isOpened={filterShow === 'scale'}
              name="scale"
              title="规模"
              dataSource={scale}
              className="job-filter__menu job-filter-menu__right"
              onConfirm={handleFilterConfirm}
              onClick={toggleFilter}
            />
            <View className="job-filter__divider" />
            <DropDownMenu
              isOpened={filterShow === 'profession'}
              name="profession"
              title="行业"
              dataSource={profession}
              className="job-filter__menu job-filter-menu__right"
              onConfirm={handleFilterConfirm}
              onClick={toggleFilter}
            />
          </>
        )}
      </View>
    )
  }

  const renderJobList = () => {
    return (
      <View className="zones-index__list">
        {list.map(v => (
          <View key={v.id}>
            {showPosition && showPosition === 'position' ? (
              <Navigator url={`/weapp/job/job-detail/index?jd_id=${v.id}`}>
                <JobCard className="zones-index__card" data={v} active />
              </Navigator>
            ) : (
              <Navigator url={`/weapp/job/company-index/index?id=${v.id}`}>
                <CompanyCard showMore detail={v} />
              </Navigator>
            )}
          </View>
        ))}
        <AtLoadMore
          className="AtLoadMore"
          noMoreText="没有更多了~"
          loadingText="正在加载中~"
          moreText="加载更多~"
          status={loadStatus}
        />
      </View>
    )
  }

  const renderContent = () => {
    switch (pageStatus) {
      case PageStatus.EMPTY:
        return <NoJob />
      case PageStatus.FINISHED:
        return renderJobList()
      default:
        return null
    }
  }

  return (
    <>
      <View className="zones-index">
        {renderFilter()}
        <View className="zones-index__scrollview">
          <View className="zones-index__container">{renderContent()}</View>
        </View>
      </View>
    </>
  )
})

export default PositionRecommendation
