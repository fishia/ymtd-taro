import { Image, Swiper, SwiperItem, View } from '@tarojs/components'
import {
  navigateBack,
  showLoading,
  hideLoading,
  setNavigationBarTitle,
  pxTransform,
  navigateTo,
} from '@tarojs/taro'
import { useGetState } from 'ahooks'
import { chunk } from 'lodash'
import { last } from 'ramda'
import { useCallback, useEffect, useState } from 'react'

import {
  bilateralDetailApi,
  bilateralListApi,
  bilateralJDListApi,
  fetchCompanyListApi,
} from '@/apis/active-page'
import Empty from '@/components/Empty'
import LoadMore from '@/components/LoadMore'
import ScrollView from '@/components/ScrollView'
import { APP_DEF_PAGE_SIZE, STATIC_MP_IMAGE_HOST } from '@/config'
import {
  IActiveEventParams,
  IMeetingCompany,
  IMeetingDetail,
  IJobCardProps,
  IAdsCompany,
} from '@/def/active'
import { IProps, LoadStatusType } from '@/def/common'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import useToast from '@/hooks/custom/useToast'
import MainLayout from '@/layout/MainLayout'
import { isSchoolVersion } from '@/services/AccountService'
import { sendHongBaoEvent } from '@/utils/dataRangers'
import { combineStaticUrl, jsonToUrl, renderJobDetailUrlByParams } from '@/utils/utils'

import ActiveBanner from '../components/ActiveBanner'
import ActiveJobCard from '../components/ActiveJobCard'
import ActiveMenu from '../components/ActiveMenu'
import ActiveShare from '../components/ActiveShare'
import ActiveEventParamsContext from '../context'
import LimitJobCardList from './limitJobCardList'

import './index.scss'

export interface ITwoWaySelectionMeetingDetailProps extends IProps {}

const prefixCls = 'two-way-selection-detail-index'
const titleMap = {
  // 投放版本（1：校园版；双选会 2：社招版 专题活动）
  1: '双选会',
  2: '专题活动',
}
const TwoWaySelectionMeetingDetail: React.FC<ITwoWaySelectionMeetingDetailProps> = () => {
  const routerParams = useRouterParam()
  const showToast = useToast()
  const paramId = routerParams?.id || 0
  const v = 'v' in routerParams ? 0 : 1

  const [meetingDetail, setMeetingDetail] = useState<IMeetingDetail>()
  const [companyList, setCompanyList, getCompanyList] = useGetState<IMeetingCompany[]>([])
  const [jobList, setJobList, getJobList] = useGetState<IJobCardProps[]>([])
  const [page, setPage, getPage] = useGetState<number>(1)
  const [status, setStatus, getStatus] = useGetState<LoadStatusType>('more')
  const [displayPattern, setDisplayPattern] = useState<number>() // 专题页展现形式（1：职位列表；2：公司+职位）
  const [shareTitle, setShareTitle] = useState<string>('')
  const [adsList, setAdsList] = useState<Array<IAdsCompany>>([])
  const [sticky, setSticky] = useState(false)
  const isSchool = isSchoolVersion()

  const getDetailActive = () => {
    if (!paramId) {
      return
    }
    bilateralDetailApi(paramId)
      .then(res => {
        setMeetingDetail(res)
        // 根据基本信息接口返回的displaypatten判断调用职位列表或者公司+职位列表
        setDisplayPattern(res?.displayPattern)
        setNavigationBarTitle({ title: res?.releaseVersion ? titleMap[res?.releaseVersion] : '' })
        setShareTitle(res?.shareTitle || '')
      })
      .catch(() => {
        showToast({
          content: '加载活动出错',
          onClose: () => void navigateBack(),
        })
      })
  }

  useEffect(() => {
    if (!paramId) {
      showToast({
        content: '找不到该活动',
        onClose: () => void navigateBack(),
      })
    }
    getDetailActive()
    fetchCompanyListApi(paramId as number, v as number).then(list => setAdsList(list))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramId])

  const handleScroll = useCallback(e => {
    const { scrollTop } = e.detail
    setSticky(scrollTop > 100)
  }, [])

  const appendList = () => {
    const latestStatus = getStatus()
    if (!paramId || latestStatus === 'loading' || latestStatus === 'noMore') {
      return
    }
    setStatus('loading')
    showLoading({ title: '加载中，请稍后' })
    // 1:公司+职位  2：职位列表
    const methodApi = displayPattern
      ? { 1: bilateralJDListApi, 2: bilateralListApi }[displayPattern]
      : null
    methodApi &&
      methodApi({ page: getPage(), id: paramId })
        .then(pageData => {
          //const listData = pageData.list
          if (displayPattern === 1) {
            setJobList([...getJobList(), ...pageData.list])
          } else if (displayPattern === 2) {
            setCompanyList([...getCompanyList(), ...pageData.list])
          }
          setPage(pageData.current + 1)
          setStatus(pageData.current * APP_DEF_PAGE_SIZE >= pageData.total ? 'noMore' : 'more')
          hideLoading()
        })
        .catch(hideLoading)
  }

  const refreshPage = () => {
    setStatus('more')
    setPage(1)
    if (displayPattern === 1) {
      setJobList([])
    } else if (displayPattern === 2) {
      setCompanyList([])
    }
    appendList()
  }

  const handleClick = (id, tag) => {
    navigateTo({ url: renderJobDetailUrlByParams({ jd_id: id, tag }) })
  }

  // useDidShow(refreshPage)
  useEffect(() => {
    displayPattern && refreshPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayPattern])

  const contextValue: IActiveEventParams = {
    event_name: meetingDetail?.title || '双选会',
    event_rank: routerParams?.icon_rank,
  }

  if (status === 'noMore' && companyList.length <= 0 && jobList.length <= 0) {
    return (
      <MainLayout className={prefixCls}>
        <Empty
          picUrl={STATIC_MP_IMAGE_HOST + 'no-job.png'}
          className={`${prefixCls}__empty`}
          text="没有符合条件的结果"
        />
      </MainLayout>
    )
  }

  const adsChunks = chunk(adsList, 3)

  // 返回埋点公共参数
  let getEventsCommonParams = (slideshow_page: number) => ({
    position: '推荐页',
    mp_version: isSchool ? '校招版' : '社招版',
    slideshow_page,
  })

  const bannerExposeEvent = (i: number) => {
    const currentPage = last(getCurrentPages())
    if (currentPage && currentPage?.route === 'weapp/active/twoWaySelectionMeetingDetail/index') {
      sendHongBaoEvent('company_promotion_Expose', getEventsCommonParams(i))
    }
  }

  return (
    <MainLayout className={prefixCls}>
      <ActiveEventParamsContext.Provider value={contextValue}>
        <ScrollView
          lowerThreshold={300}
          className={`${prefixCls}__scrollView`}
          loadMore={appendList}
          onScroll={handleScroll}
        >
          <View>
            {meetingDetail && (
              <ActiveBanner
                swiperItem={meetingDetail.bannerList?.map((item, i) => ({
                  id: i,
                  image_url: item,
                }))}
              />
            )}
            <ActiveMenu
              companyNum={meetingDetail?.companiesNum}
              jobNum={meetingDetail?.jdsNum}
              displayPattern={meetingDetail?.displayPattern}
              className={sticky ? 'stickyTop' : ''}
            />
            {adsChunks.length ? (
              <Swiper
                className="swiper__container"
                autoplay
                interval={5000}
                indicatorDots={adsList.length > 3}
                style={{ height: adsList.length > 3 ? pxTransform(358) : pxTransform(320) }}
                indicatorColor="#E2E4EE"
                indicatorActiveColor="#4256DC"
                circular
                onChange={e => bannerExposeEvent(e.detail.current + 1)}
              >
                {adsChunks.map((chunkList, index) => (
                  <SwiperItem className="swiper__item" key={index}>
                    {chunkList.map((item, i) => (
                      <View
                        className="swiper__item__content"
                        key={i}
                        onClick={() => {
                          sendHongBaoEvent('company_promotion_click', {
                            ...getEventsCommonParams(index + 1),
                            button_name: item.name || '',
                          })
                          navigateTo({
                            url: `/weapp/job/company-index/index?${jsonToUrl({
                              id: item.id,
                              v,
                            })}`,
                          })
                        }}
                      >
                        <View className="swiper__item__badge">{item.jdCount}</View>
                        <View className="swiper__item__content__top">
                          <View className="swiper__item__content__top--logo">
                            <Image
                              src={
                                item.logo
                                  ? combineStaticUrl(item.logo)
                                  : 'https://www.yimaitongdao.com/geebox/default/ymtd_company_default.png'
                              }
                            />
                          </View>
                          <View className="swiper__item__content__top--name">{item.name}</View>
                        </View>
                        <View className="swiper__item__content__bottom">
                          <View className="swiper__item__content__bottom--tags">
                            {item.benefitTags && item.benefitTags.length
                              ? item.benefitTags.map((benefitTag, orderIndex) => (
                                  <View
                                    className="swiper__item__content__bottom--tag"
                                    key={orderIndex}
                                  >
                                    {benefitTag}
                                  </View>
                                ))
                              : null}
                          </View>
                        </View>
                      </View>
                    ))}
                  </SwiperItem>
                ))}
              </Swiper>
            ) : null}
            {displayPattern === 2
              ? companyList.map((item, i) => {
                  return <LimitJobCardList {...item} key={i} />
                })
              : jobList.map((item: IJobCardProps, i) => {
                  return (
                    <ActiveJobCard key={i} onClick={handleClick} data={{ ...item, status: 1 }} />
                  )
                })}
            <LoadMore status={status} />
          </View>
        </ScrollView>
        <ActiveShare title={shareTitle} />
      </ActiveEventParamsContext.Provider>
    </MainLayout>
  )
}

export default TwoWaySelectionMeetingDetail
