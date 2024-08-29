import { Image, View } from '@tarojs/components'
import {
  navigateTo,
  getStorageSync,
  useShareAppMessage,
  useRouter,
  eventCenter,
  pxTransform,
  useDidHide,
  useDidShow,
  onNetworkStatusChange,
  showToast,
  createSelectorQuery,
  hideTabBar,
} from '@tarojs/taro'
import { useDebounceEffect, useDebounceFn, useThrottleFn } from 'ahooks'
import c from 'classnames'
import _, { get } from 'lodash'
import R from 'ramda'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { isCampusApi, saveProfileAward } from '@/apis/active-page'
import { fetchAddComQrCode, getAwardRecord } from '@/apis/award'
import {
  listRecommandJobsApi,
  listHotJobsApi,
  getJobBannerList,
  getZonesIconList,
  fetchtRecommendPosition,
  fetchRecommendNoLogin,
} from '@/apis/job'
import { fetchUserIntentsApi } from '@/apis/resume'
import { fetchCityByIpApi } from '@/apis/user'
import Button from '@/components/Button'
import JobCard from '@/components/JobCard'
// import ListTailLoginTips from '@/components/JobCard/ListTailLoginTips'
import AgainConfirmPopup from '@/components/Popup/againConfirmPopup'
import FixedBottomPopup, { fixedBottomPopupEventKey } from '@/components/Popup/fixedBottomPopup'
import FullScreenPopup, { fullScreenPopupEventKey } from '@/components/Popup/fullScreenPopup'
import ResumeStickyPopup from '@/components/Popup/resumeStickyPopup'

/* import LuckyDrawPopup from '@/components/Popup/luckyDrawPopup' */
import QualityPositionPopup from '@/components/QualityPositionPopup'
import ScrollView from '@/components/ScrollView'
import ToastTips from '@/components/ToastTips'
import {
  APP_TOKEN_FLAG,
  SHARE_APP_IMAGE,
  IS_JD_RECOMMAND,
  REFRESH_INTENTS_LIST,
  IS_IMPORTANT_USERINFO,
  LOCATION_STORAGE_KEY_CHANGE_DATE,
  PROFILE,
} from '@/config'
import { IVersion, LoadStatusType } from '@/def/common'
import {
  IJob,
  IJobSearch,
  IBanner,
  IZoneIcon,
  JobType,
  IJobWithIndex,
  IEventExposeParams,
} from '@/def/job'
import { IResumeIntentInfo } from '@/def/resume'
import { defaultUserInfo } from '@/def/user'
import { ExpChannel } from '@/def/volcanoPoint'
import { useCurrentCity } from '@/hooks/custom/useCity'
import { useHomePageRefreshState } from '@/hooks/custom/useJob'
import useOnce from '@/hooks/custom/useOnce'
import {
  useFixedBottomPupupRef,
  useLuckyDrawPupupRef,
  useResumeStickyPopup,
  useResumeStickyPopupRef,
  useShowLoginPopup,
  useShowMarketPopup,
} from '@/hooks/custom/usePopup'
import getPriorityList, {
  bestEmployerByToken,
  isBestEmployeActivity,
} from '@/hooks/custom/usePopupData'
import useShowModal, { useHideModal } from '@/hooks/custom/useShowModal'
import useShowModal2 from '@/hooks/custom/useShowModal2'
import { useCurrentUserInfo, useGetUserIndentStatus, useIsLogin } from '@/hooks/custom/useUser'
import MainLayout from '@/layout/MainLayout'
import { getNewLoginIntent, initActivityStatus, noProfile } from '@/services/AccountService'
import { previewCurrentResumeAttachment } from '@/services/ResumeService'
import { currentDay, dispatchSetVersion } from '@/store'
import {
  getVarParam,
  sendDataRangersEvent,
  sendDataRangersEventWithUrl,
  sendHongBaoEvent,
  isShowLoginGuide,
} from '@/utils/dataRangers'
import { delayQuerySelector } from '@/utils/taroUtils'
import {
  jumpToUrlByLinkType,
  renderJobDetailUrlByParams,
  renderValidParams,
  getJobType,
} from '@/utils/utils'

import AddIntentionBlock from './components/AddIntentionBlock'
import BackTop from './components/BackTop'
import IntentionInfoBlock from './components/IntentionInfoBlock'
import JobAreaBlock from './components/JobAreaBlock'
import JobNavigation, { statusBarHeight } from './components/JobNavgation'
import JobRecommedBlock from './components/JobRecommedBlock'
import LoadMore, { ILoadMoreProps } from './components/LoadMore'
import LoginTipsBar from './components/LoginTipsBar'
import NoJob from './components/NoJob'
import SaveAward from './components/SaveAward'
import SwiperBar from './components/SwiperBar'
import ZoneBar from './components/ZoneBar'

import './index.scss'

export const InitNavBarState = {
  fixedHeight: 100, //导航固定高度
}

const ITEM_HEIGHT = 160 // 每个列表项高度为160px
let currentIndex = 0

const Job: React.FC = () => {
  const isCv = true
  const { fixedHeight } = InitNavBarState
  const isLoginedState = useIsLogin()

  const isLogined = getStorageSync(APP_TOKEN_FLAG),
    is_jd_recommand = getStorageSync(IS_JD_RECOMMAND),
    change_ctiy_date = getStorageSync(LOCATION_STORAGE_KEY_CHANGE_DATE),
    importantUserInfo = getStorageSync(IS_IMPORTANT_USERINFO),
    is_intent = useGetUserIndentStatus(),
    profile = getStorageSync(PROFILE)

  const router = useRouter()
  const city = useCurrentCity()
  const refresh = useHomePageRefreshState()
  const showLoginPopup = useShowLoginPopup()
  const showMarketPopup = useShowMarketPopup()

  const fullscreenPopupRef = useRef<any>(null)
  const fixedbottomPopupRef = useFixedBottomPupupRef()
  const resumeStickyPopupRef = useResumeStickyPopupRef()
  const againConfirmPopupRef = useRef<any>(null)
  //const guidePopupRef = useRef<any>(null)
  //const luckyDrawPopupRef = useLuckyDrawPupupRef()
  const navRef = useRef<any>(null)
  const version = router?.params?.version
  const MAIprofile = router?.params?.MAIprofile
  const [showBackTop, setShowBackTop] = useState(false)
  //const [isAnimation, setIsAnimation] = useState(true)
  const [isCampus, setIsCampus] = useState(false) // 是否校园版
  const [canLoadHotList, setCanLoadHotList] = useState<boolean>(false) //是否开启冷启动
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false) //是否刷新职位列表
  const [isSticky, setIsSticky] = useState<boolean>(false) //求职意向粘性定位开启
  const [scrollTop, setScrollTop] = useState<number>(0) //scrollView scrollTop值
  //const [pageScrollTop, setPageScrollTop] = useState<number>(0) //页面滚动距离
  const [distance, setDistance] = useState(0) //swiper+zone的高度
  const [currentIntent, setCurrentIntent] = useState<number>(0) //选中的求职意向tab
  const [page, setPage] = useState<number>(1) //推荐职位分页
  const [predictionPage, setPredictionPage] = useState<number>(1) //冷启动职位分页

  const [intent_id, setIntentId] = useState<number | undefined>() //求职意向id
  const [recommendList, setRecommendList] = useState<IJobWithIndex[]>([])
  const [predictionList, setPredictionList] = useState<IJobWithIndex[]>([]) //冷启动加载职位列表
  const [status, setStatus] = useState<LoadStatusType>('more')
  const [swiperItem, setSwiperItem] = useState<IBanner[]>([])
  const [zoneItem, setZoneItem] = useState<IZoneIcon[]>([])
  const [refreshPage, setRefreshPage] = useState<number>(refresh)
  const [intents, setIntents] = useState<IResumeIntentInfo[]>([])
  const [sendBannerEvent, setSendBannerEvent] = useState(true)

  const [showLoginTips, setShowLoginTips] = useState(false)
  const [tipsVisible, setTipsVisible] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const { isShowResumeStickPop } = useResumeStickyPopup()
  const { needShow, setCurrentTips } = useOnce('showToSearchTips', true)
  const [isShowRecommedIndex, setIsShowRecommedIndex] = useState(-1)
  const { needShow: needShowRecommedJobCard, setCurrentTips: setRecommedJobCard } = useOnce(
    'showRecommedJobCardTips',
    true
  )
  // 是否展示创建简历得春战50红包弹窗
  const { needShow: needShowProfileAward, setCurrentTips: setIsShowProfileAward } = useOnce(
    'showProfileAward'
  )
  const [recommedJobCardData, setRecommedJobCardData] = useState<IJob[]>([])
  const isSameCardRef = useRef<any>(null)
  const [ipCity, setIpCity] = useState<number>()
  const [newArr, setNewArr] = useState<IJobWithIndex[]>([])
  const showEmptyModal = useShowModal()
  const showModal = useShowModal2()
  const close = useHideModal()
  // 获取本地求职意向
  const localIntent = getNewLoginIntent()

  //未登录、没有求职意向、有求职意向但未打开推荐、推荐列表加载完毕
  const coldBootEnable = useMemo(() => {
    return isLogined ? !is_intent || (is_intent && !is_jd_recommand) || canLoadHotList : true
  }, [isLogined, is_intent, is_jd_recommand, canLoadHotList])

  useEffect(() => {
    // 已登录但是校园码登录，不调该接口
    if (isLogined)
      isCampusApi().then(res => {
        setIsCampus(res.isCampus)
        if (res.isCampus) {
          // 校园版弹窗
          if (res.lastEduId) {
            getPriorityList({
              showEduPopup: !res.isCampusExpFull,
              lastEduId: res.lastEduId,
              resume: profile,
            }).then(list => showMarketPopup(list.slice(0, 1)))
          }
          sendDataRangersEvent('CampusHomePageExpose', { is_scan: version === IVersion.SCHOOL })
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogined])

  useEffect(() => {
    fetchCityByIpApi().then(res => {
      setIpCity(res.id)
    })
  }, [])

  useEffect(() => {
    if (isLoginedState) {
      if (isShowResumeStickPop()) {
        return
      }
    }
  }, [isLoginedState])

  //是否开启校园模式，非首页不刷新
  const openSchoolMode = useMemo(() => {
    let v = isCampus || version === IVersion.SCHOOL
    dispatchSetVersion(v)
    return v
  }, [isCampus, version])

  // 重选城市、登录状态、收藏、投递、求职意向、用户推荐开关变更后重新获取
  const reloadPage = useCallback(() => {
    setRecommendList([])
    setPredictionList([])
    setPage(1)
    setPredictionPage(1)
    setStatus('more')
    setCanLoadHotList(false)
    setRefreshPage(refreshPage + 1)
    setIsClicked(false)
    setTipsVisible(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, isLogined, refresh, openSchoolMode])

  //推荐列表加载完毕，初始化一次冷启动数据
  const resetPageList = () => {
    setPage(1)
    setPredictionPage(1)
    setPredictionList([])
    setStatus('more')
    setRefreshPage(refreshPage + 1)
  }

  const setRangers = () => {
    const typeArr = ['工作城市', '投简历按钮', '职位推荐不精准']
    typeArr.map(item =>
      sendDataRangersEventWithUrl('register_and_login_Expose', {
        event_name: '注册登录引导',
        type: item,
        page_name: '职位推荐页',
      })
    )
  }

  const listRecommendNoLogin = () => {
    const { workType, expectPosition, cityId, expectSalaryFrom, expectSalaryTo } = localIntent || {}
    const params = {
      jobType: workType,
      expectPosition,
      intentCityId: cityId,
      expectSalaryTo,
      expectSalaryFrom,
    }

    if (status === 'noMore') return

    fetchRecommendNoLogin(params)
      .then(res => {
        const listData = res.list
        setPredictionList(
          [...listData].map((item, i) => ({
            page_no: res.current,
            position_no: (i % 20) + 1,
            ...item,
          }))
        )
        setIsRefreshing(false)

        setPredictionPage(1)
        setStatus('noMore')
      })
      .catch(err => {
        setStatus('noMore')
        setIsRefreshing(false)
      })
  }

  //请求追加职位列表
  const { run: appendJobList } = useDebounceFn(() => {
    let searchOptions: IJobSearch = R.clone(
      renderValidParams({
        city_id: city.id || 1,
        page: coldBootEnable ? predictionPage : page,
        pageSize: 20,
        intent_id,
        v: openSchoolMode ? 0 : undefined,
      })
    )

    // 没登录,并且暂存了求职意向,请求暂存求职意向的推荐列表
    if (!isLogined && localIntent) {
      listRecommendNoLogin()
      return
    }

    //未登录或没有求职意向时,开启冷启动
    if (coldBootEnable) {
      delete searchOptions.v

      // 冷启动下传city_id的规则
      if (currentDay !== change_ctiy_date) {
        searchOptions.city_id = ipCity || 1
      }
      listHotJobsApi(searchOptions)
        .then(pageData => {
          const listData = pageData.list
          if (
            !isLogined &&
            pageData.current == 1 &&
            pageData.list.length > 0 &&
            isShowLoginGuide()
          ) {
            setRangers()
          }
          setPredictionList(
            [...predictionList, ...listData].map((item, i) => ({
              page_no: pageData.current,
              position_no: (i % 20) + 1,
              ...item,
            }))
          )
          setPredictionPage(pageData.current + 1)
          setStatus(pageData.current * 20 >= pageData.total ? 'noMore' : 'more')
        })
        .catch(() => {
          setStatus('reload')
        })
    } else {
      listRecommandJobsApi({ ...searchOptions })
        .then(pageData => {
          const listData = pageData.list,
            maxTotal = pageData.total,
            loadHotListEnable = pageData.current * 20 >= maxTotal || maxTotal <= 20
          setRecommendList(
            [...recommendList, ...listData].map((item, i) => ({
              page_no: pageData.current,
              position_no: (i % 20) + 1,
              ...item,
            }))
          )
          setStatus('more')
          if (pageData.current === 3 && !isClicked && needShow) {
            setTipsVisible(true)
          }
          if (loadHotListEnable) {
            setCanLoadHotList(loadHotListEnable)
            resetPageList()
          } else {
            setPage(pageData.current + 1)
          }
        })
        .catch(() => {
          setStatus('reload')
        })
    }
    setIsRefreshing(false)
  })

  // 进入页面后初次加载
  useEffect(() => {
    if (['loading', 'noMore'].includes(status as string) || refreshPage < 1) {
      return
    }
    setStatus('loading')
    appendJobList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshPage])

  // 重选城市、登录状态、求职意向变更后重新获取
  useEffect(() => {
    reloadPage()
  }, [reloadPage])

  // const bestEmployerByToken = (link) => {
  //   const token = getStorageSync(APP_TOKEN_FLAG)
  //   return link + `/${token}`
  // }

  // 加载Banner,专区icon位
  useDebounceEffect(() => {
    //获取banner列表
    getJobBannerList(openSchoolMode ? 26 : undefined).then(bannerList => {
      const fn = (item, index) => {
        sendHongBaoEvent('BannerClick', {
          banner_name: item.title || '',
          banner_rank: index + 1,
          mp_version: openSchoolMode ? '校园版' : '社招版',
        })

        // 品牌雇主活动跳转需要加token带登录态
        if (isBestEmployeActivity(item.link_url)) {
          if (!isLoginedState) {
            // 未登录不能点
            showLoginPopup()
            return
          }

          sendDataRangersEventWithUrl('EventPopupClick', {
            type: '首页banner',
            event_name: item.title,
          })
          jumpToUrlByLinkType({
            ...item,
            link_url: bestEmployerByToken(item.link_url),
          })

          return
        }

        jumpToUrlByLinkType(item)
      }

      const newBannerList = bannerList.map(v => {
        return {
          ...v,
          onClick: fn,
        }
      })
      setSwiperItem(newBannerList)
    })
    //获取专区
    getZonesIconList(openSchoolMode).then(zoneList => {
      setZoneItem(zoneList)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSchoolMode, isLoginedState])

  useEffect(() => {
    eventCenter.on(
      router.path + fullScreenPopupEventKey,
      (p, type = 'open') => void fullscreenPopupRef?.current?.[type](p)
    )
    //监控是否刷新求职意向
    eventCenter.on(REFRESH_INTENTS_LIST, (list?: IResumeIntentInfo[]) => {
      if (list) {
        setIntents(list)
        refreshList(list[0]?.id)
      } else {
        //获取职位列表
        fetchUserIntentsApi().then(intentList => {
          setIntents(intentList)
          refreshList(intentList[0]?.id)
          handleScrollTop()
        })
      }
    })
    // 网络监测
    onNetworkStatusChange(res => {
      if (!res.isConnected) {
        showToast({
          title: '网络不稳定，请下拉重试 ',
          icon: 'none',
          duration: 5000,
        })
      }
    })
    return () => {
      eventCenter.off(router.path + fullScreenPopupEventKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.path])

  useDidHide(() => {
    // 页面被隐藏了埋点
    sendDataRangersEventWithUrl('switch_page')
    eventCenter.trigger(router.path + fixedBottomPopupEventKey, {}, 'close')
    setSendBannerEvent(false)
  })

  //优先级营销弹窗,每次进入小程序未登录弹出登录弹窗，已登 录按照权重弹出营销弹窗，仅展示一次
  useDidShow(() => {
    const currentPage = R.last(getCurrentPages())
    if (currentPage && currentPage?.route === 'weapp/pages/job/index') {
      Promise.all([initActivityStatus(), saveProfileAward()]).then(([data, record]) => {
        if (record.hasAward && needShowProfileAward) {
          setIsShowProfileAward()
          showEmptyModal({
            content: <SaveAward />,
            className: 'global-empty-modal',
            title: '',
            cancelText: '',
            confirmText: '',
            closeOnClickOverlay: false,
          })

          return
        }

        getPriorityList({ ...importantUserInfo, resume: profile }).then(_.once(showMarketPopup))
      })
    }
  })

  useEffect(() => {
    if (isLogined)
      //获取求职意向
      eventCenter.trigger(REFRESH_INTENTS_LIST)
  }, [isLogined])

  const showTopHeight = 200

  const querySelectorShow = () => {
    Promise.all([
      delayQuerySelector(`.job-index__swiper-bar`, 0),
      delayQuerySelector(`.job-index__zone-bar`, 0),
    ]).then(data => {
      const totalTopheight = data
        .filter(item => item[0])
        .reduce((total, item) => total + (item[0].height || 0), 0)
      setDistance(totalTopheight)
    })
  }

  //接口执行结束后执行获取高度
  useEffect(() => {
    querySelectorShow()
  }, [swiperItem, zoneItem])

  useEffect(() => {
    if (!isLogined && swiperItem.length > 0) {
      sendDataRangersEventWithUrl('register_and_login_Expose', {
        event_name: '注册登录引导',
        type: '活动页',
        first_visit_source: '首页banner',
      })
    }
  }, [isLogined, swiperItem])

  const { run: debouncedHandlerScroll } = useThrottleFn(
    currentScrollTop => {
      createSelectorQuery()
        .select('.job-index__scrollview')
        .boundingClientRect()
        .exec(([scrollInner]) => {
          if (!isLoginedState) {
            if (isShowLoginGuide()) {
              setShowLoginTips(true)
              sendDataRangersEventWithUrl('register_and_login_Expose')
            } else {
              if (currentScrollTop > scrollInner?.height + 100) {
                setShowLoginTips(true)
                sendDataRangersEventWithUrl('register_and_login_Expose')
              } else {
                setShowLoginTips(false)
              }
            }
          } else {
            setShowLoginTips(false)
          }
        })
    },
    { wait: 500 }
  )

  useEffect(() => {
    if (!isLogined && isShowLoginGuide()) setShowLoginTips(true)
    else setShowLoginTips(false)
  }, [isLogined])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  let handleScroll = useCallback(
    e => {
      //todo:兼容后、weapp页面回到顶部
      const { scrollTop: SCROLLTOP } = e.detail
      /* setPageScrollTop(SCROLLTOP) */
      /* setIsAnimation(SCROLLTOP > maxAnimationDistance) */
      //swiper+zone的高度一开始是0，未获取真实高度之前不判断粘性定位
      distance && setIsSticky(SCROLLTOP > distance - 8)
      if (SCROLLTOP > showTopHeight && !showBackTop) {
        setShowBackTop(true)
      } else if (SCROLLTOP <= showTopHeight && showBackTop) {
        setShowBackTop(false)
      }

      debouncedHandlerScroll(SCROLLTOP)

      // 计算当前滚动到了第几个元素
      currentIndex = Math.floor(SCROLLTOP / ITEM_HEIGHT)
      // 判断第10个元素是否出现在可视区域
      if (currentIndex >= 9) {
        eventCenter.trigger('jobSoho')
        return
      }
      if (currentIndex >= 19) {
        eventCenter.trigger('jobChoice')
        return
      }
    },
    [showBackTop, isSticky]
  )

  // 回到顶部
  const handleScrollTop = () => {
    setShowBackTop(false)
    setScrollTop(Math.random())
  }
  //ScrollView手动下拉刷新职位列表
  const refreshList = (intentId?: number, index = 0) => {
    return new Promise(res => {
      setTimeout(() => {
        if (intentId) {
          setIntentId(intentId)
          setCurrentIntent(index)
        }
        return res(undefined)
      }, 300)
    }).then(() => {
      setIsRefreshing(true)
      reloadPage()
      setRefreshPage(refreshPage + 1)
    })
  }

  // 点击去搜索埋点
  const sendSearchEvent = (text: string) => {
    sendDataRangersEventWithUrl('GuidedsearchClick', { search_source: text })
  }

  const onClickIsShowRecommedJobCard = (i: number, id: number | null, type: string) => {
    const isSameCard = isSameCardRef.current !== 'card' + id
    if (isSameCard && id && type === JobType.RECOMMAND) {
      isSameCardRef.current = 'card' + id
      fetchtRecommendPosition(id).then(data => {
        if (data?.length > 2) {
          setRecommedJobCardData(data.slice(0, 3))
          setIsShowRecommedIndex(i)
          sendDataRangersEventWithUrl('EventExpose', {
            recommend_no: '3',
            event_name: '推荐职位卡片_相似职位推荐',
            page_name: '职位推荐页',
          })
        }
      })
    }
  }

  const onCloseRecommedJobCard = () => {
    againConfirmPopupRef.current.open({
      text: '关闭后今日将不再为你推荐相似职位',
      buttonText: '不再推荐',
      onConfirm: () => {
        setRecommedJobCard()
        setIsShowRecommedIndex(-1)
      },
    })
  }

  const dataSourceRenderList = ({ dataSource, type }) => {
    let list
    if (dataSource.length) {
      list = dataSource.map((v, i) => {
        const eventExposeParams: IEventExposeParams = {
          jd_id: v.id,
          page_no: v.page_no,
          position_no: v.position_no,
          type,
          search_city: city.name,
          expected_position: intents.filter(item => item.id === intent_id)[0]?.expectPositionName,
          expected_city: intents.filter(item => item.id === intent_id)[0]?.cityName,
          is_top: v.is_top ? 1 : 0,
          exp_channel: ExpChannel[type],
          expose_id: v.exposeId,
          expName: v.expName,
          isSeed: v.isSeed,
          isVirtual: v.isVirtual,
          is_priority: v.is_priority,
          jd_status: getJobType(v?.is_priority, v?.topStatus),
          is_fresh: v?.refreshStatus ? '是' : '否',
          salesDone: v?.salesDone,
        }
        return (
          <View key={i}>
            <JobCard
              {...{
                className: 'job-index__card',
                pageName: '职位推荐页',
                data: v,
                onClick: id => {
                  setIsClicked(true)
                  setTipsVisible(false)
                  const arr = [...newArr]
                  arr[i].isSeed = true
                  setNewArr(arr)
                  onClickIsShowRecommedJobCard(i, id, type)
                  navigateTo({
                    url: renderJobDetailUrlByParams({ ...eventExposeParams, tag: v?.tag }),
                  })
                },
                showTop: type === JobType.RECOMMAND ? v.recallSource === '2' && v.is_top : true,
                eventExposeParams,
              }}
              //appendLoginTips={!isLoginedState && i === 9}
              isShowRecommendListGuide={!isLogined && !!localIntent && i === 9}
              isDeliverButton
              showSohoPopup={i === 4}
              isShowResumeSticky={i === 9}
              showPopup={isLoginedState && i === 14}
              isShowJobAreaBlock={!!localIntent ? false : !isLogined && i == 0}
              isShowJobRecommedBlock={!isLogined && i == 4}
              isShowRecommedJobCardBlock={
                type === JobType.RECOMMAND && needShowRecommedJobCard && i == isShowRecommedIndex
              }
              recommedJobCardData={recommedJobCardData}
              showChatBtn
              onClickIsShowRecommedJobCard={id => onClickIsShowRecommedJobCard(i, id, type)}
              onCloseRecommedJobCard={onCloseRecommedJobCard}
            />
          </View>
        )
      })
    }
    return list
  }

  //按照职位类别展示列表
  const renderJobListWithType = (
    type: JobType,
    dataSource: Array<IJobWithIndex>,
    loadMoreProps: ILoadMoreProps
  ) => {
    return (
      <View>
        {type === 'hot' && <View className="job-index__subtitle">热门职位</View>}
        <View className="job-index__cardList">
          {dataSourceRenderList({ dataSource, type })}
          {isLoginedState ? (
            <LoadMore key={type} {...loadMoreProps} onClick={() => sendSearchEvent('列表底部')} />
          ) : (
            <>
              <LoadMore key={type} {...loadMoreProps} onClick={() => sendSearchEvent('列表底部')} />
              {/* <ListTailLoginTips /> */}
            </>
          )}
        </View>
      </View>
    )
  }
  //加载更多配置
  const loadMoreProps = (type: JobType) => {
    switch (type) {
      case 'recommend':
        return {
          noMoreTitle: '暂无更多推荐职位,去搜索试试',
          noMoreText: '去搜索',
          //当有热门职位或推荐职位小于分页条数的时候推荐列表加载更多状态置为noMore,其余状态全部根据接口来
          status:
            (predictionList.length || recommendList.length < 20) && status !== 'loading'
              ? 'noMore'
              : status,
          route: '/weapp/job/job-search/index',
        }
      //热门、冷启动
      default:
        return {
          noMoreTitle: '暂无更多职位，去搜索试试',
          noMoreText: '去搜索',
          status,
          route: '/weapp/job/job-search/index', //热门->搜索页
        }
    }
  }

  useEffect(() => {
    const arr = !(is_intent && isLogined)
      ? [...predictionList]
      : [...recommendList, ...predictionList].map((item, i) => ({
          ...item,
        }))

    setNewArr(arr)
  }, [isLogined, is_intent, predictionList, recommendList])

  //展示职位列表
  const renderJobList = () => {
    //(!is_intent||!isLogined)   没有求职意向或者未登录，单纯冷启动（没有热门职位标题）
    //(is_intent && is_jd_recommand //有求职意向且打开了推荐
    //(is_intent && !is_jd_recommand) || canLoadHotList   有求职意向但未打开推荐或推荐加载完毕
    // const newArr = !(is_intent && isLogined)
    //   ? [...predictionList]
    //   : [...recommendList, ...predictionList].map((item, i) => ({
    //       ...item,
    //     }))
    // console.log(is_intent, isLogined, is_jd_recommand)
    return (
      <>
        {!(is_intent && isLogined)
          ? renderJobListWithType(JobType.PREDICTION, newArr, {
              ...loadMoreProps(JobType.PREDICTION),
            })
          : null}
        {(is_intent && is_jd_recommand) || recommendList.length
          ? renderJobListWithType(JobType.RECOMMAND, newArr.slice(0, recommendList.length), {
              ...loadMoreProps(JobType.RECOMMAND),
            })
          : null}
        {(is_intent && !is_jd_recommand) || canLoadHotList
          ? renderJobListWithType(JobType.HOT, newArr.slice(recommendList.length), {
              ...loadMoreProps(JobType.HOT),
            })
          : null}
      </>
    )
  }

  //分享小程序
  useShareAppMessage(() => ({
    title: '医脉同道',
    path: '/weapp/pages/job/index',
    imageUrl: SHARE_APP_IMAGE,
  }))

  //跳转意向管理
  const linkToIndentUrl = (eventName: string) => {
    if (!isLogined) {
      showLoginPopup().then().catch()
    } else {
      //TODO:求职意向
      sendHongBaoEvent(eventName)
      navigateTo({ url: '/weapp/resume/intent-info-list/index' })
    }
  }

  //渲染求职意向Tab
  const renderIntentionInfoBlock = useCallback(() => {
    if (intents.length && isLogined) {
      return (
        <View className="job-index__intentionInfo">
          <IntentionInfoBlock
            intentList={intents}
            sticky={isSticky}
            current={currentIntent}
            style={{
              top: isSticky ? `calc(${statusBarHeight}px + ${pxTransform(fixedHeight)})` : 0,
              // marginBottom: '16rpx',
            }}
            onClick={(id, index) => {
              if (isSticky) {
                setScrollTop(Math.random() + distance + 5)
              }
              refreshList(id, index)
            }}
            onEditClick={() => linkToIndentUrl('IntentionMgtClick')}
          />
        </View>
      )
    }

    if (localIntent) {
      return (
        <IntentionInfoBlock
          intentList={[localIntent]}
          sticky={isSticky}
          current={0}
          style={{
            top: isSticky ? `calc(${statusBarHeight}px + ${pxTransform(fixedHeight)})` : 0,
            // marginBottom: '16rpx',
          }}
          onClick={(id, index) => {
            if (isSticky) {
              setScrollTop(Math.random() + distance + 5)
            }
            refreshList(id, index)
          }}
          onEditClick={() => linkToIndentUrl('IntentionMgtClick')}
        />
      )
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intents, isLogined, isSticky, currentIntent, localIntent])

  // 登录没有职位直接跳走
  useDidShow(() => {
    if (!isLogined && isShowLoginGuide()) {
      setShowLoginTips(true)
      if (predictionList.length > 0) setRangers()
    } else setShowLoginTips(false)
    if (isCv) {
      noProfile()
    }
    if (openSchoolMode) {
      sendDataRangersEvent('CampusHomePageExpose', { is_scan: version === IVersion.SCHOOL })
    }
    setSendBannerEvent(true)
    querySelectorShow()
  })

  const clearTips = () => {
    setTipsVisible(false)
    setCurrentTips()
  }

  useEffect(() => {
    if (MAIprofile) {
      showModal({
        text: '保存成功，附件简历已同步上传',
        title: '',
        confirmText: '立即查看',
        confirmWidth: 638,
        btnNums: false,
      }).then(res => {
        if (res) {
          previewCurrentResumeAttachment()
        }
      })
    }
  }, [MAIprofile])

  return (
    <MainLayout className="job-index">
      <JobNavigation
        ref={navRef}
        isAnimation
        onClick={() => {
          navigateTo({ url: '/weapp/job/job-search/index' })
        }}
        isLogined={isLogined}
        {...InitNavBarState}
      />

      <View>{isSticky && renderIntentionInfoBlock()}</View>
      <ScrollView
        className="job-index__scrollview"
        style={{
          top: `calc(${statusBarHeight}px + ${pxTransform(fixedHeight)})`,
          paddingBottom: showLoginTips ? pxTransform(fixedHeight) : 0,
        }}
        scrollTop={scrollTop}
        loadMore={appendJobList}
        onScroll={handleScroll}
        refresherEnabled
        // refresherBackground="transparent"
        // refresherDefaultStyle="white"
        onRefresherRefresh={() => refreshList()}
        refresherTriggered={isRefreshing}
      >
        <View className="job-index__scrollview__inner">
          {isLogined && <View className="job-index__scrollview__bg"></View>}
          {isLogined && <ZoneBar items={zoneItem} school={openSchoolMode} />}

          {swiperItem.length > 0 ? (
            <View className="job-index__swiperInner">
              <SwiperBar
                style={{ height: pxTransform(128) }}
                items={swiperItem}
                school={openSchoolMode}
                sendEvent={sendBannerEvent}
              />
            </View>
          ) : null}

          {!is_intent && isLogined ? (
            <AddIntentionBlock onClick={() => linkToIndentUrl('IntentionAddClick')} />
          ) : null}
          {!isSticky && renderIntentionInfoBlock()}
          {(status === 'noMore' && [...recommendList, ...predictionList].length <= 0) ||
          status === 'reload' ? (
            <NoJob
              custom
              // onClick={() => refreshList(intent_id, currentIntent)}
              onClick={() => navigateTo({ url: '/weapp/job/job-search/index' })}
              // imgName="reload"
              title="暂无职位"
              description="去搜索试试"
              btnText="去搜索"
            />
          ) : (
            <View className={c('job-index__list')}>{renderJobList()}</View>
          )}
        </View>
      </ScrollView>
      <BackTop visible={showBackTop} onClick={handleScrollTop} />
      <LoginTipsBar visible={showLoginTips} />
      <FullScreenPopup ref={fullscreenPopupRef} />
      <FixedBottomPopup ref={fixedbottomPopupRef} />
      <AgainConfirmPopup ref={againConfirmPopupRef} />
      {/* <LuckyDrawPopup ref={luckyDrawPopupRef} /> */}
      <QualityPositionPopup type="daily" />
      <ToastTips
        visible={tipsVisible}
        content="找不到想要的职位？试试搜索"
        className="job-index__input-nav__tips"
        onClose={clearTips}
        style={{ top: `calc(${statusBarHeight}px + ${pxTransform(60)})` }}
      />
    </MainLayout>
  )
}

export default Job
