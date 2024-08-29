import { View, Text, Image, Input, ScrollView, Swiper, SwiperItem } from '@tarojs/components'
import { getStorageSync, navigateTo, setStorageSync, useDidShow } from '@tarojs/taro'
import { useGetState } from 'ahooks'
import c from 'classnames'
import { noop } from 'lodash'
import { omit } from 'ramda'
import { FC, useEffect, useMemo, useRef, useState } from 'react'

import {
  getHotJobsApi,
  getThinkApi,
  listRelatedApi,
  listJobSearchApi,
  getJobFiltersApi,
} from '@/apis/job'
import companyEmptyBg from '@/assets/imgs/empty/noSearchCompany.png'
import JobCard from '@/components/JobCard'
import OpenCloseContent from '@/components/OpenCloseContent/OpenCLoseContent'
// import ListTailLoginTips from '@/components/JobCard/ListTailLoginTips'
import ToastTips from '@/components/ToastTips'
import { SEARCH_HISTORY_STORAGE_KEY } from '@/config'
import { IList, ILocation, LoadStatusType, IOptionItem } from '@/def/common'
import { ICompany, IJob } from '@/def/job'
import { ExpChannelType } from '@/def/volcanoPoint'
import { useCurrentCity, useUpdateCurrentCity } from '@/hooks/custom/useCity'
import useModalState from '@/hooks/custom/useModalState'
import useOnce from '@/hooks/custom/useOnce'
import useSelectLocation from '@/hooks/custom/useSelectLocation'
import { useIsLogin } from '@/hooks/custom/useUser'
import MainLayout from '@/layout/MainLayout'
import { validWithinTwoWeeks } from '@/services/DateService'
import { textHighLight } from '@/services/StringService'
import { getVarParam, sendDataRangersEventWithUrl, isShowLoginGuide } from '@/utils/dataRangers'
import { pxTransform } from '@/utils/taroUtils'
import { renderJobDetailUrlByParams, trimParams, getJobType } from '@/utils/utils'
import NoJob from '@/weapp/pages/job/components/NoJob'
import SwiperBar from '@/weapp/pages/job/components/SwiperBar'

import CompanyCard from './CompanyCard'
import hotPng from './asset/hot.png'
import clearIcon from './clear.svg'
import CondFilter from './components/CondFilter'
import dropdownIcon from './dropdown.svg'
import filterIcon from './filter.svg'
import filterActiveIcon from './filteractive.svg'

import './index.scss'

type SearchType = 'jd' | 'company'
type JdFilterCondType = 'salary_scope' | 'work_time' | 'education' | 'jd_property'
type CompanyFilterCondType = 'company_type' | 'company_scale' | 'industry'

interface ISearchRecord {
  id: string | number
  name: string
}

interface IHotRecord {
  title: string
  linkUrl: string
  hot: boolean
  imageUrl: string
  dataType: number // 1 职位，3 公司
}

interface ISearchThinkItem {
  name: string
  type: SearchType
}

const jdFilterCond: JdFilterCondType[] = ['salary_scope', 'work_time', 'education', 'jd_property']
const companyFilterCond: CompanyFilterCondType[] = ['company_type', 'company_scale', 'industry']
const rangeCond = ['salary_scope', 'work_time']
const multiLevelCond = ['industry']

const filterCondNameMap: Record<JdFilterCondType | CompanyFilterCondType, string> = {
  salary_scope: '月薪范围',
  work_time: '经验要求',
  education: '学历要求',
  jd_property: '职位类型',
  company_type: '公司性质',
  company_scale: '公司规模',
  industry: '公司行业',
}

const dataTypeMap = {
  1: '猜你喜欢职位',
  2: '猜你喜欢技能',
  3: '猜你喜欢公司',
}

export interface ISearchOptions
  extends Record<JdFilterCondType | CompanyFilterCondType, IOptionItem[]> {}

const emptyArray: any[] = []
const emptyCond: Partial<ISearchOptions> = {}
const emptyFilter: IOptionItem[] = []

const jdPageSize = 20
const companyPageSize = 20

interface ISearchExtraOptions {
  isHistorySearch?: boolean
}

const JobSearch: FC = () => {
  const selectLocation = useSelectLocation('/weapp/general/city-filter/index')
  const currentCity = useCurrentCity()
  const updateCurrentCity = useUpdateCurrentCity()
  const isLogin = useIsLogin()

  const [hasResult, setHasResult] = useState(false)
  const [searchText, setSearchText, getSearchText] = useGetState('')
  const [type, setType, getType] = useGetState<SearchType>('jd')
  const pageSize = type === 'jd' ? jdPageSize : companyPageSize
  const [isFocus, setIsFocus] = useState(true)

  const [hotRecord, setHotRecord] = useState<IHotRecord[]>([])
  const [historyRecord, setHistoryRecord] = useState<ISearchRecord[]>(
    () => getStorageSync(SEARCH_HISTORY_STORAGE_KEY) || emptyArray
  )

  const [thinkList, setThinkList] = useState<ISearchThinkItem[]>([])
  const [jdResultList, setJdResultList] = useState<IJob[]>([])
  const [jdRecommendList, setJdRecommendList] = useState<IJob[]>([])
  const [companyResultList, setCompanyResultList] = useState<ICompany[]>([])
  const isNoResultRef = useRef(false)

  const [scrollTop, setScrollTop] = useState(0)
  const pageNumRef = useRef(0)
  const lastSearchPageNumRef = useRef(0)
  const [pageState, setPageState] = useState<LoadStatusType>('more')

  const [filterOptions, setFilterOptions] = useState<ISearchOptions>()
  const [showFilter, setShowFilter] = useState(false)
  const { alive, active, setModal } = useModalState(350)
  const [tempFilter, setTempFilter] = useState<Partial<ISearchOptions>>(emptyCond)
  const currentFilterRef = useRef<Partial<ISearchOptions>>(emptyCond)
  const { needShow, setCurrentTips } = useOnce('showSearchTips')
  const [tipsVisible, setTipsVisible] = useState(false)

  const selectedFiltersCount = useMemo(
    () =>
      Object.values(omit(type === 'jd' ? emptyArray : jdFilterCond, tempFilter)).reduce<number>(
        (count: number, list: IOptionItem[]) => count + list.length,
        0
      ),
    [tempFilter, type]
  )

  const cityFilters = useMemo(() => trimParams(omit(['name', 'jds', 'id'], currentCity)), [
    currentCity,
  ])

  useEffect(() => void setModal(showFilter), [setModal, showFilter])

  // 初始化，拉取热门搜索、职位筛选 options
  useEffect(() => {
    getHotJobsApi().then(setHotRecord)
    getJobFiltersApi().then(setFilterOptions)
    if (needShow && validWithinTwoWeeks()) {
      setTipsVisible(needShow)
      setCurrentTips()
    }
  }, [])

  useEffect(() => {
    if (hotRecord) {
      hotRecord.forEach(item => {
        sendDataRangersEventWithUrl('adExpose', {
          button_name: dataTypeMap[item.dataType],
          page_name: '搜索桥页',
          is_ad: item.hot ? '是' : '否',
        })
      })
    }
  }, [hotRecord])

  // 搜索文字键入，触发联想
  useEffect(() => {
    const searchValue = searchText.trim()
    if (searchValue.length > 0 && !hasResult) {
      getThinkApi(searchValue, 'mini', cityFilters as ILocation).then(setThinkList)
    } else if (searchValue.length <= 0) {
      setShowFilter(false)
      setThinkList([])
    }
  }, [cityFilters, hasResult, searchText])

  // 搜索区回顶部的方法
  const scrollToTop = () => void setScrollTop(Math.random())

  const setRangers = result => {
    if (result.current == 1 && result.list?.length > 0 && isShowLoginGuide()) {
      sendDataRangersEventWithUrl('register_and_login_Expose', {
        event_name: '注册登录引导',
        type: '投简历按钮',
        page_name: '职位搜索页',
      })
    }
  }

  // 拉取列表
  const fetchFn = async (option: ISearchExtraOptions = {}) => {
    setPageState('loading')

    const { isHistorySearch } = option
    const currentType = getType()
    const fetchMethod = currentType === 'jd' ? listJobSearchApi : listRelatedApi
    const appendMethod = currentType === 'jd' ? setJdResultList : setCompanyResultList

    const filterParam = { key_word_type: currentType, keyword: getSearchText().trim() }
    const filterCond: Optional<ISearchOptions> = omit(
      currentType === 'jd' ? emptyArray : jdFilterCond,
      currentFilterRef.current
    )
    Object.entries(filterCond).forEach(([key, value]) => {
      filterParam[key] = value.map(item => item.value).join(',')
    })

    const currentIsNoResult = isNoResultRef.current
    if (currentIsNoResult && currentType === 'jd') {
      fetchNearbyJds(filterParam)
      return
    } else if (currentIsNoResult) {
      return
    }

    await fetchMethod({
      page: pageNumRef.current + 1,
      ...cityFilters,
      pageSize,
      ...filterParam,
      isHistorySearch: isHistorySearch ? 1 : 0,
    }).then((result: IList<ICompany | IJob>) => {
      const noMoreResult = result.current * pageSize >= result.total
      appendMethod(list => [...list, ...(result.list || [])])
      pageNumRef.current = result.current

      setRangers(result)

      if (noMoreResult) {
        lastSearchPageNumRef.current = result.current
        isNoResultRef.current = true
      }

      if (noMoreResult && currentType === 'jd') {
        fetchNearbyJds(filterParam)
      } else if (currentType === 'jd') {
        setPageState('more')
      } else {
        setPageState(result.current * pageSize >= result.total ? 'noMore' : 'more')
      }
    })
  }

  // 拉取周边城市
  const fetchNearbyJds = async filterParam => {
    setPageState('loading')
    listJobSearchApi({
      ...cityFilters,
      ...filterParam,
      page: pageNumRef.current - lastSearchPageNumRef.current + 1,
      pageSize,
      searchNearby: 1,
    } as any)
      .then(result => {
        pageNumRef.current += 1
        setRangers(result)
        setJdRecommendList(list => [...list, ...result.list])
        setPageState(result.current * pageSize >= result.total ? 'noMore' : 'more')
      })
      .catch(() => {})
  }

  // 提交搜索
  const submitSearch = (option: ISearchExtraOptions = {}) => {
    const searchValue = getSearchText().trim()
    if (searchValue.length <= 0) {
      return
    }

    pageNumRef.current = 0
    lastSearchPageNumRef.current = 0
    isNoResultRef.current = false
    scrollToTop()
    setJdResultList([])
    setJdRecommendList([])
    setCompanyResultList([])
    setHasResult(true)

    const { isHistorySearch } = option
    sendDataRangersEventWithUrl('SearchButtonClick', {
      keyword: searchValue,
      is_history_search: isHistorySearch ? '是' : '否',
      search_city: currentCity.name || '全国',
    })

    fetchFn()

    const newRecord: ISearchRecord = { id: searchValue, name: searchValue }
    const newHistory = [
      newRecord,
      ...historyRecord.filter(item => item.name !== searchValue),
    ].slice(0, 10)
    setHistoryRecord(newHistory)
    setStorageSync(SEARCH_HISTORY_STORAGE_KEY, newHistory)
  }

  // 切换城市，重新搜索
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(submitSearch, [currentCity])

  // 登录，重新搜索
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(submitSearch, [isLogin])

  // 上拉加载更多
  const loadMoreHandler = () => {
    console.log(pageState)
    if (pageState !== 'more') {
      return
    }

    fetchFn()
  }

  // 清除搜索历史
  const clearHistoryHandler = () => {
    setHistoryRecord([])
    setStorageSync(SEARCH_HISTORY_STORAGE_KEY, [])
  }

  // 点击筛选菜单切换按钮
  const filterClickHandler = () => {
    setShowFilter(state => !state)

    if (showFilter) {
      setTempFilter(currentFilterRef.current)
    }
  }

  // 点击某一筛选条件项
  const filterCondClickHandler = (condName: string, cond: IOptionItem) => {
    const filters: IOptionItem[] = tempFilter[condName] || emptyFilter
    const isToggleChecked = !filters.includes(cond)

    // 区间型筛选，需要支持选中、反选区间内的多个筛选项
    if (rangeCond.includes(condName)) {
      if (isToggleChecked && filters.length <= 0) {
        setTempFilter(t => ({ ...t, [condName]: [...filters, cond] }))
        return
      }

      const group = filterOptions?.[condName] || emptyCond
      const selectedValue = Number(cond.value)
      const minValue = Math.min(...filters.map(item => Number(item.value)))
      const maxValue = Math.max(...filters.map(item => Number(item.value)))

      if (isToggleChecked) {
        const newConds =
          selectedValue < minValue
            ? group.filter(
                item => Number(item.value) >= selectedValue && Number(item.value) < minValue
              )
            : group.filter(
                item => Number(item.value) <= selectedValue && Number(item.value) > maxValue
              )
        setTempFilter(t => ({ ...t, [condName]: [...filters, ...newConds] }))
      } else {
        setTempFilter(t => ({
          ...t,
          [condName]: filters.filter(item => Number(item.value) < selectedValue),
        }))
      }
    } else {
      if (isToggleChecked) {
        setTempFilter(t => ({ ...t, [condName]: [...filters, cond] }))
      } else {
        setTempFilter(t => ({ ...t, [condName]: filters.filter(item => item !== cond) }))
      }
    }
  }

  // 筛选列表点确定
  const filterConfirmHandler = () => {
    setShowFilter(false)
    if (currentFilterRef.current !== tempFilter) {
      currentFilterRef.current = tempFilter
      submitSearch()
    }
  }

  // 切换搜索类型
  const toggleTypeHandler = (target: SearchType) => {
    if (target !== type) {
      setType(target)
      setTimeout(submitSearch, 0)
    }
  }

  const shouldShowLoadingState = (() => {
    if (pageState === 'loading') {
      return true
    }

    if (type === 'company') {
      return companyResultList.length > 0
    } else if (isNoResultRef.current) {
      return jdRecommendList.length > 0
    } else {
      return jdRecommendList.length + jdResultList.length > 0
    }
  })()

  const clearTips = () => {
    setTipsVisible(false)
  }

  return (
    <MainLayout className="job-search" onClick={clearTips}>
      <View className="job-search__input-nav">
        <View className="job-search__input-nav__bar">
          <View
            onClick={() => void selectLocation(updateCurrentCity, {})}
            className="job-search__input-nav__bar__loc"
          >
            <Text className="job-search__input-nav__bar__loc-text line-ellipsis">
              {currentCity?.name || '全国'}
            </Text>
            <Image src={dropdownIcon} className="job-search__input-nav__bar__loc-drop" />
          </View>

          <View className="job-search__input-nav__bar__searchicon at-icon at-icon-search" />
          <Input
            value={searchText}
            onInput={e => {
              setHasResult(false)
              setSearchText(e.detail.value)
            }}
            onConfirm={noop}
            onBlur={() => {
              setIsFocus(false)
              submitSearch()
            }}
            onFocus={() => void setIsFocus(true)}
            placeholder="搜索职位、公司"
            confirmType="search"
            className="job-search__input-nav__bar__input"
            focus={isFocus}
            maxlength={24}
            adjustPosition
          />

          {searchText.length > 0 ? (
            <Image
              onClick={() => {
                setHasResult(false)
                setSearchText('')
              }}
              src={clearIcon}
              className="job-search__input-nav__bar__clear"
            />
          ) : null}
        </View>
        <ToastTips
          visible={tipsVisible}
          content="城市新增省级搜索能力"
          className="job-search__input-nav__tips"
          onClose={clearTips}
        />
      </View>

      <View>
        {!hasResult && searchText.length > 0 ? (
          <View className="job-search__think">
            {thinkList.map((thinkItem, thinkIdx) => (
              <View
                onTouchStart={() => {
                  setType(thinkItem.type)
                  setSearchText(thinkItem.name)
                }}
                className="job-search__think__item"
                key={thinkIdx}
              >
                <View className="job-search__think__item-icon at-icon at-icon-search" />
                <View
                  className="job-search__think__item-text"
                  dangerouslySetInnerHTML={{ __html: textHighLight(thinkItem.name, searchText) }}
                ></View>
                <View className={c('job-search__think__item-badge', thinkItem.type)}>
                  {thinkItem.type === 'jd' ? '职位' : '公司'}
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View>
        {!hasResult && searchText.length <= 0 ? (
          <ScrollView scrollY className="job-search__normal">
            {historyRecord.length > 0 ? (
              <View className="job-search__normal__block">
                <View className="job-search__normal__title">
                  历史搜索
                  <Text
                    className="job-search__normal__clear icon iconfont iconshanchu"
                    onClick={clearHistoryHandler}
                  ></Text>
                </View>
                <OpenCloseContent keys="search_history" maxHeight={130}>
                  {historyRecord.map(recordItem => (
                    <View
                      onClick={() => {
                        setSearchText(recordItem.name)
                        setTimeout(() => void submitSearch({ isHistorySearch: true }), 0)
                      }}
                      className="job-search__normal__item line-ellipsis"
                      key={recordItem.id}
                    >
                      {recordItem.name}
                    </View>
                  ))}
                </OpenCloseContent>
              </View>
            ) : null}

            {hotRecord.length > 0 ? (
              <View className="job-search__normal__block">
                <View className="job-search__normal__title">猜你想搜</View>

                {hotRecord.map(recordItem => (
                  <View
                    onClick={() => {
                      sendDataRangersEventWithUrl('adClick', {
                        page_name: '搜索桥页',
                        is_ad: recordItem.hot ? '是' : '否',
                        button_name: dataTypeMap[recordItem.dataType],
                      })
                      if (!recordItem.linkUrl) {
                        setSearchText(recordItem.title)
                        setTimeout(submitSearch, 0)
                        return
                      }
                      navigateTo({
                        url: recordItem.linkUrl,
                      })
                    }}
                    className={`job-search__normal__item line-ellipsis ${
                      recordItem.imageUrl ? 'image-tag' : ''
                    }`}
                    key={recordItem.title}
                  >
                    {recordItem.imageUrl ? (
                      <Image src={recordItem.imageUrl} mode="heightFix"></Image>
                    ) : (
                      <>
                        <View className="job-search__normal__item-text">{recordItem.title}</View>
                        {recordItem.hot && <Image src={hotPng} />}
                      </>
                    )}
                  </View>
                ))}
              </View>
            ) : null}
            <SwiperBar
              style={{ height: pxTransform(128) }}
              type={55}
              className="job-search__normal__swiper__bar"
            />
          </ScrollView>
        ) : null}
      </View>

      <View className="job-search__result-nav">
        <View className="job-search__result-nav__switch">
          <View
            onTouchStart={() => void toggleTypeHandler('jd')}
            className={c('job-search__result-nav__switch-item', type === 'jd' ? 'active' : '')}
          >
            职位
            <View className={c('job-search__result-nav__switch-underline', type)}></View>
          </View>
          <View
            onTouchStart={() => void toggleTypeHandler('company')}
            className={c('job-search__result-nav__switch-item', type !== 'jd' ? 'active' : '')}
          >
            公司
          </View>
        </View>

        <View
          onClick={filterClickHandler}
          className={c('job-search__result-nav__filter', selectedFiltersCount > 0 ? 'active' : '')}
        >
          <Image
            className="job-search__result-nav__filter-icon"
            src={selectedFiltersCount > 0 ? filterActiveIcon : filterIcon}
          />
          <Text className="job-search__result-nav__filter-text">
            筛选 {selectedFiltersCount > 0 ? '·' + selectedFiltersCount : ''}
          </Text>
        </View>
      </View>

      <View>
        {alive ? (
          <View className={c('job-search__filter-mask', active ? 'active' : '')}></View>
        ) : null}
      </View>

      <View className={c('job-search__filter', showFilter ? 'active' : '')}>
        <ScrollView className="job-search__filter__scroll" scrollY>
          <View>
            {(type === 'jd' ? jdFilterCond : emptyArray).map(jdCond => (
              <CondFilter
                key={jdCond}
                condName={jdCond}
                title={filterCondNameMap[jdCond]}
                subTitle="(多选)"
                condList={filterOptions?.[jdCond] || emptyArray}
                tempFilter={tempFilter}
                onClick={filterCondClickHandler}
                className="job-search__filter__block"
              />
            ))}
          </View>

          {companyFilterCond.map(companyCond => (
            <CondFilter
              key={companyCond}
              condName={companyCond}
              title={filterCondNameMap[companyCond]}
              subTitle="(多选)"
              condList={filterOptions?.[companyCond] || emptyArray}
              tempFilter={tempFilter}
              onClick={filterCondClickHandler}
              multiLevel={multiLevelCond.includes(companyCond)}
              className="job-search__filter__block"
            />
          ))}
        </ScrollView>

        <View className="job-search__filter__action">
          <View
            onClick={() => void setTempFilter(emptyCond)}
            className="job-search__filter__action-button reset"
          >
            重置
          </View>
          <View
            onClick={filterConfirmHandler}
            className="job-search__filter__action-button confirm"
          >
            确定
          </View>
        </View>
      </View>

      <ScrollView
        onScrollToLower={loadMoreHandler}
        lowerThreshold={154 + 150}
        scrollTop={scrollTop}
        className="job-search__scroll"
        scrollY
      >
        <View className="job-search__list">
          <View className="job-search__list__container">
            {type === 'jd'
              ? jdResultList.map((jdItem, jdIndex) => {
                  const params = {
                    id: jdItem.id,
                    page: Math.ceil((jdIndex + 1) / 20),
                    index: (jdIndex + 1) % pageSize,
                    keyword: searchText || '',
                    search_city: currentCity?.name || '',
                    // jd_type: '搜索职位',
                    page_no: Math.ceil((jdIndex + 1) / 20),
                    position_no: (jdIndex + 1) % pageSize,
                    exp_channel: ExpChannelType.SEARCH,
                    expose_id: jdItem.exposeId,
                    expName: jdItem.expName,
                    isSeed: jdItem.isSeed,
                    isVirtual: jdItem.isVirtual,
                    jd_status: getJobType(jdItem?.is_priority, jdItem?.topStatus),
                    is_fresh: jdItem?.refreshStatus ? '是' : '否',
                    salesDone: jdItem?.salesDone,
                  }

                  return (
                    <JobCard
                      key={jdItem.id}
                      pageName="职位搜索页"
                      keyword={searchText}
                      data={jdItem}
                      relativeToClassName="job-search__scroll"
                      className="job-search__job-card"
                      eventExposeParams={params}
                      onClick={() => {
                        setIsFocus(false)
                        const arr = [...jdResultList]
                        arr[jdIndex].isSeed = true
                        setJdResultList(arr)
                        navigateTo({
                          url: renderJobDetailUrlByParams({ ...params, tag: jdItem?.tag }),
                        })
                      }}
                      appendLoginTips={!isLogin && jdIndex === 9}
                      // isDeliverButton={getVarParam('jobCardDeliver')}
                      isDeliverButton
                      showChatBtn
                      showSohoPopup={jdIndex === 4}
                      isShowResumeSticky={jdIndex === 9}
                    />
                  )
                })
              : companyResultList.map(companyItem => (
                  <CompanyCard
                    key={companyItem.id}
                    companyInfo={companyItem}
                    keyword={searchText}
                    onClick={(clickPosition: 'company' | 'jd') => {
                      setIsFocus(false)
                      navigateTo({
                        url: `/weapp/job/company-index/index?tab=${
                          clickPosition === 'jd' ? 1 : 0
                        }&id=${companyItem.id}`,
                      })
                    }}
                  />
                ))}
          </View>

          <View>
            {isNoResultRef.current && type === 'jd' ? (
              <>
                {jdResultList.length ? (
                  <View className="job-search__empty-job__tips">
                    没有更多了，请试试其他搜索条件
                  </View>
                ) : (
                  <NoJob title="没有符合的职位，换一个条件试试吧" />
                )}

                {jdRecommendList.length ? (
                  <>
                    <View className="job-search__empty-job__title">
                      - 已为你推荐{currentCity.cityName}周边城市的职位 -
                    </View>

                    {jdRecommendList.map((jdItem, jdIndex) => {
                      const params = {
                        id: jdItem.id,
                        page: Math.ceil((jdIndex + 1) / 20),
                        index: (jdIndex + 1) % pageSize,
                        // jd_type: '周边职位',
                        jd_type: jdItem.jd_type,
                        page_no: jdItem.page_no,
                        position_no: jdItem.position_no,
                        exp_channel: ExpChannelType.SEARCH,
                        expose_id: jdItem.exposeId,
                        expName: jdItem.expName,
                        isSeed: jdItem.isSeed,
                        isVirtual: jdItem.isVirtual,
                      }
                      return (
                        <JobCard
                          key={'recommend-' + jdItem.id}
                          pageName="职位搜索页"
                          keyword={searchText}
                          data={jdItem}
                          showTop={false}
                          relativeToClassName="job-search__scroll"
                          className="job-search__job-card"
                          eventExposeParams={params}
                          onClick={() => {
                            const arr = [...jdRecommendList]
                            arr[jdIndex].isSeed = true
                            setJdRecommendList(arr)
                            navigateTo({
                              url: renderJobDetailUrlByParams({ ...params, tag: jdItem?.tag }),
                            })
                          }}
                          // isDeliverButton={getVarParam('jobCardDeliver')}
                          isDeliverButton
                          showChatBtn
                        />
                      )
                    })}
                  </>
                ) : null}
              </>
            ) : null}
          </View>

          <View>
            {isNoResultRef.current && companyResultList.length <= 0 && getType() === 'company' ? (
              <View className="job-search__empty-company">
                <Image src={companyEmptyBg} className="job-search__empty-company__bg" />
                <View className="job-search__empty-company__tips">
                  暂无相关公司，建议换个关键词试试
                </View>
              </View>
            ) : null}

            {shouldShowLoadingState ? (
              <View className="job-search__loadmore">
                {pageState === 'loading'
                  ? '加载中...'
                  : pageState === 'more'
                  ? '上拉加载更多'
                  : type === 'company'
                  ? '暂无更多公司'
                  : isLogin
                  ? '没有更多了'
                  : // <ListTailLoginTips style={{ padding: '8px 0' }} />
                    null}
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </MainLayout>
  )
}

export default JobSearch
