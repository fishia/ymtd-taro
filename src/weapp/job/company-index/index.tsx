import { Button, Image, View } from '@tarojs/components'
import { navigateTo, previewMedia, redirectTo } from '@tarojs/taro'
import c from 'classnames'
import R from 'ramda'
import React, { useEffect, useMemo, useState, useRef } from 'react'
import { AtLoadMore, AtTabs, AtTabsPane } from 'taro-ui'

import {
  detailCompanyApi,
  listCompanyJobsApi,
  favoriteCompanyApi,
  deleteFavoriteCompanyApi,
  generatorCompanyCardsApi,
  shareCompanyApi,
} from '@/apis/job'
import JobCard from '@/components/JobCard'
import Loading from '@/components/Loading'
import LoginButton from '@/components/LoginButton'
import FixedBottomPopup from '@/components/Popup/fixedBottomPopup'
import RefuelPackagePopup from '@/components/Popup/refuelPackagePopup'
import ShareCard from '@/components/Popup/sharePopup'
import ScrollBar from '@/components/ScrollBar'
import { APP_DEF_PAGE_SIZE } from '@/config'
import { IAdress, PageStatus } from '@/def/common'
import {
  INewCompany,
  ICompanyJobsSearch,
  IEventExposeParams,
  IJob,
  IJobList,
  IJobWithIndex,
  IProduct,
  ICompanySenior,
} from '@/def/job'
import { ExpChannelType } from '@/def/volcanoPoint'
import {
  useShowLoginPopup,
  useFixedBottomPopup,
  useFixedBottomPupupRef,
  useRefuelPackagePopupRef,
} from '@/hooks/custom/usePopup'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import useToast from '@/hooks/custom/useToast'
import { useCurrentUserInfo, useIsLogin } from '@/hooks/custom/useUser'
import { useAsync, useAsyncFn } from '@/hooks/sideEffects/useAsync'
import useList from '@/hooks/state/useList'
import MainLayout from '@/layout/MainLayout'
import { formatStringToHtml } from '@/services/StringService'
import { dispatchAddUserFavorite, dispatchDeleteUserFavorite } from '@/store'
import { sendDataRangersEventWithUrl, isShowLoginGuide } from '@/utils/dataRangers'
import { delayQuerySelector } from '@/utils/taroUtils'
import { renderJobDetailUrlByParams } from '@/utils/utils'

import DetailLocation from '../components/DetailLocation'
import DetailPdfCard from '../components/DetailPdfCard'
import DetailSection from '../components/DetailSection'
import SubmitBar from '../components/SubmitBar'
import WrapPanel from '../components/WrapPanel'
import Company from './components/Company'
import PreviewSwiperPanel from './components/PreviewSwiperPanel'
import Product from './components/Product'

import './index.scss'

const decoratorDataMap = (data: ICompanySenior[]) => {
  return data.map(item => {
    const { seniorImage, seniorName, seniorDesc } = item
    return {
      image: seniorImage,
      title: seniorName,
      desc: seniorDesc,
    }
  })
}

const CompanyIndex = () => {
  const fixedbottomPopupRef = useFixedBottomPupupRef()
  const routerParams = useRouterParam()

  const paramId = routerParams.id || routerParams.scene
  const defaultTab = routerParams.tab ? Number(routerParams.tab) : 1
  const companyId = +paramId?.split(',')[0] || 0
  const isActive = Number(routerParams.isActive) ? 1 : 0

  const [current, setCurrent] = useState<number>(defaultTab)

  const [page, setPage] = useState<number>(1)
  const [pageStatus, setPageStatus] = useState<PageStatus>(PageStatus.LOADING)

  const [companyData, setCompanyData] = useState<INewCompany>()
  const [location, setLocation] = useState<IAdress>()
  const [list, { clear, push, set }] = useList<IJobWithIndex>()
  const [collectLoading, setCollectLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [openCompanySenior, setOpenCompanySenior] = useState(false)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [companySeniorCurrentIndex, setCompanySeniorCurrentIndex] = useState(0)
  const [descFold, setDescFold] = useState(2)
  const [benefitFold, setBenefitFold] = useState(2)
  const [top, setTop] = useState(250)
  const [total, setTotal] = useState(0)

  const showToast = useToast()
  const showLoginPopup = useShowLoginPopup()
  const isLogined = useIsLogin()
  const userInfo = useCurrentUserInfo()!
  const { close, openSharePopup } = useFixedBottomPopup()
  const refuelPackagePupupRef = useRefuelPackagePopupRef()

  //是否已收藏
  const isFavorited = useMemo(() => {
    return userInfo?.favorite_company_ids && R.includes(companyId, userInfo.favorite_company_ids)
  }, [userInfo, companyId])

  const [fetchListState, fetchListMethod] = useAsyncFn<() => Promise<IJobList>>(() => {
    let searchOptions: ICompanyJobsSearch = R.clone({ page })
    if ('v' in routerParams) searchOptions.v = +routerParams?.v
    return listCompanyJobsApi(companyId, searchOptions)
  }, [page])

  // 请求公司主页
  const fetchState = useAsync(() => {
    if (!companyId) {
      redirectTo({ url: '/weapp/general/error/index' })
      return
    }
    return detailCompanyApi(companyId)
  }, [companyId])

  const handleFetchValue = fetchValue => {
    const result: INewCompany | null = R.pathOr(null, ['value'], fetchValue)

    if (result === null) {
      setPageStatus(PageStatus.ERROR)
      return
    }
    pageStatus !== PageStatus.FINISHED && setPageStatus(PageStatus.FINISHED)
    const company: any = R.omit(['jds'], result)
    company.desc = company.desc ? formatStringToHtml(company.desc) : ''
    const point: any = R.pick(['city', 'address', 'location', 'province'], result)
    setLocation({
      ...point,
      lat: Array.isArray(point.location) ? null : point.location.lat,
      lng: Array.isArray(point.location) ? null : point.location.lng,
    })
    setCompanyData(company)
  }

  // 监听请求公司主页变化
  useEffect(() => {
    const switchFn = R.cond([
      [
        R.prop('loading'),
        () => {
          setPageStatus(PageStatus.LOADING)
        },
      ],
      [
        R.prop('error'),
        state => {
          const content = R.pathOr('加载失败', ['error', 'errorMessage'])(state)
          showToast({ content })
          setPageStatus(PageStatus.ERROR)
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
      [
        R.T,
        () => {
          // setPageStatus(PageStatus.ERROR)
        },
      ],
    ])
    switchFn(fetchState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchState, showToast])

  // 挂载请求在招职位
  useEffect(() => {
    // 需要重新赋值,页面没有卸载
    fetchListMethod()
  }, [fetchListMethod])

  useEffect(() => {
    sendDataRangersEventWithUrl('CompanyHomepage', {
      mp_version: 'v' in routerParams && +routerParams.v === 0 ? '校园版' : '社招版',
    })
  }, [])
  const loadStatus = useMemo(() => {
    const switchFn = R.cond([
      [R.prop('error'), R.always('noMore')],
      [R.prop('loading'), R.always('loading')],
      [
        R.T,
        state => {
          const { current: curPage, total } = R.pathOr(
            { current: 1, total: 0, list: [] },
            ['value'],
            state
          )

          if (curPage * APP_DEF_PAGE_SIZE >= total) {
            return 'noMore'
          } else {
            return 'more'
          }
        },
      ],
    ])
    return switchFn(fetchListState)
  }, [fetchListState])

  const handleFetchList = fetchValue => {
    const resultList = R.pathOr([], ['value', 'list'], fetchValue).map((item: IJob, i) => ({
      page_no: page,
      position_no: (i % 10) + 1,
      ...item,
    }))

    if (R.isEmpty(resultList)) {
      if (R.isEmpty(list) || page === 1) {
        clear()
      }
    } else {
      page === 1 ? set(resultList) : push(...resultList)
      setTotal(R.pathOr(0, ['value', 'total'], fetchValue))
      if (page === 1 && isShowLoginGuide()) {
        sendDataRangersEventWithUrl('register_and_login_Expose', {
          event_name: '注册登录引导',
          type: '投简历按钮',
          page_name: '公司主页',
        })
      }
    }
  }
  useEffect(() => {
    const switchFn = R.cond([
      [R.prop('loading'), () => {}],
      [
        R.prop('error'),
        state => {
          const content = R.pathOr('职位加载失败', ['error', 'errorMessage'])(state)
          showToast({ content })
          return
        },
      ],
      [
        R.prop('value'),
        state => {
          handleFetchList(state)
          return
        },
      ],
      [
        R.T,
        () => {
          // setPageStatus(PageStatus.ERROR)
        },
      ],
    ])
    switchFn(fetchListState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchListState, showToast])
  //收藏公司
  const handleCollected = () => {
    // if (!isLogined) {
    //   showLoginPopup().then().catch()
    //   return
    // }
    //TODO:收藏公司
    if (!isFavorited) {
      setCollectLoading(true)
      favoriteCompanyApi(companyId)
        .then(() => {
          setCollectLoading(false)
          showToast({ content: '收藏成功' })
          dispatchAddUserFavorite('company', companyId)
        })
        .catch(({ errorMessage }) => {
          setCollectLoading(false)
          showToast({ content: errorMessage || '收藏失败' })
        })
    } else {
      deleteFavoriteCompanyApi(companyId)
        .then(() => {
          setCollectLoading(false)
          showToast({ content: '已取消收藏' })
          dispatchDeleteUserFavorite('company', companyId)
        })
        .catch(({ errorMessage }) => {
          setCollectLoading(false)
          showToast({ content: errorMessage || '取消收藏失败' })
        })
    }
  }
  //分享公司
  const handleShared = () => {
    // if (!isLogined) {
    //   showLoginPopup().then().catch()
    //   return
    // }
    openSharePopup({
      key: 'share_company',
      showClear: false,
      overlayClickClose: true,
      className: 'custom_fixed_bottom',
      children: (
        <ShareCard
          onCancel={close}
          generatorPhotosApi={generatorCompanyCardsApi}
          id={companyId.toString()}
          shareApi={shareCompanyApi}
        />
      ),
    })
  }
  //上拉加载
  const handleLoadMore = () => {
    if (loadStatus === 'noMore' || current !== 1 || loadStatus === 'loading') {
      return
    }

    if (page) {
      let p = page
      setPage(++p)
    }
  }

  const renderJobs = () => {
    return (
      <ScrollBar className="company-index__scrollview" loadMore={handleLoadMore}>
        <View className="company-index__jobList">
          {list.map((job, i) => {
            const eventExposeParams: IEventExposeParams = {
              jd_id: job.id,
              page_no: job.page_no,
              position_no: job.position_no,
              isActive,
              exp_channel: ExpChannelType.HOME,
              expose_id: job.exposeId,
              expName: job.expName,
              isSeed: job.isSeed,
              jd_type: job.jd_type,
            }
            return (
              <JobCard
                key={job.id}
                className="company-index__position"
                pageName="公司主页"
                data={{ ...job, status: 1, hasChatCurrentJd: job?.has_apply }}
                eventExposeParams={eventExposeParams}
                relativeToClassName="company-index__scrollview"
                showChatBtn
                btnText="投简历"
                isActive={isActive}
                onClick={() => {
                  const arr = [...list]
                  arr[i].isSeed = true
                  set(arr)
                  navigateTo({
                    url: renderJobDetailUrlByParams({
                      ...eventExposeParams,
                      tag: job?.tag,
                    }),
                  })
                }}
                // simple
              />
            )
          })}
          <AtLoadMore
            noMoreText="暂无更多职位~"
            loadingText="正在加载中~"
            moreText="加载更多~"
            status={loadStatus}
          />
        </View>
      </ScrollBar>
    )
  }

  useEffect(() => {
    setTimeout(() => {
      delayQuerySelector('.company-index__detail__tags', 0).then(temprect => {
        if (temprect?.[0]?.height > 60) {
          setBenefitFold(1)
        }
      })
      delayQuerySelector('.company-index__detail__description', 100).then(temprect => {
        if (temprect?.[0]?.height > 200) {
          setDescFold(1)
        }
      })
      delayQuerySelector('.company-index__overview', 100).then(temprect => {
        setTop(temprect?.[0]?.height)
      })
    }, 0)
  }, [companyData])

  const renderMain = () => {
    return (
      <React.Fragment>
        {companyData && (
          <View className="company-index__overview">
            <Company detail data={companyData} isLink={false} />
          </View>
        )}

        <AtTabs
          current={current}
          tabList={[{ title: '公司主页' }, { title: `在招职位·${total}` }]}
          onClick={idx => {
            setCurrent(idx)
          }}
          customStyle={{ top }}
        >
          <AtTabsPane current={current} index={0}>
            <View className="company-index__detail">
              {companyData?.benefitTags?.length ? (
                <DetailSection title="福利待遇">
                  <View
                    className={c('company-index__detail__tags', {
                      'company-index__detail__tags--fold': benefitFold === 1,
                    })}
                  >
                    {companyData?.benefitTags.map((item, i) => (
                      <View className="tag" key={i}>
                        {item}
                      </View>
                    ))}
                  </View>
                  {benefitFold === 1 && (
                    <View
                      className={c('at-icon', {
                        'at-icon-chevron-down': benefitFold === 1,
                      })}
                      onClick={() => setBenefitFold(2)}
                    />
                  )}
                </DetailSection>
              ) : null}
              {companyData?.patternTags?.length ? (
                <DetailSection title="工作时间">
                  <View className="company-index__detail__tags">
                    {companyData?.patternTags.map((item, i) => (
                      <View className="tag" key={i}>
                        {item}
                      </View>
                    ))}
                  </View>
                </DetailSection>
              ) : null}
              {(location?.city || location?.address) && (
                <DetailSection title="公司地址">
                  <DetailLocation data={location} name={companyData?.name || ' '} />
                </DetailSection>
              )}
              {companyData?.attachment && (
                <DetailSection title="公司介绍附件">
                  <DetailPdfCard name={companyData?.attachmentName} url={companyData?.attachment} />
                </DetailSection>
              )}
              {companyData && companyData.desc && (
                <DetailSection title="公司详情">
                  <View
                    className={c('company-index__detail__description', {
                      'company-index__detail__description--fold': descFold === 1,
                    })}
                    dangerouslySetInnerHTML={{
                      __html: companyData.desc,
                    }}
                  />
                  {descFold === 1 && (
                    <View
                      className={c('at-icon', {
                        'at-icon-chevron-down': descFold === 1,
                      })}
                      onClick={() => setDescFold(2)}
                    />
                  )}
                </DetailSection>
              )}
              {companyData && companyData?.image?.length ? (
                <WrapPanel
                  data={companyData.image}
                  RowRender={(item: string, i: number) => (
                    <Image
                      src={item}
                      mode="scaleToFill"
                      onClick={() => {
                        previewMedia({
                          sources: (companyData.image as string[]).map(o => ({ url: o })),
                          current: i,
                        })
                      }}
                    />
                  )}
                />
              ) : null}
              {companyData?.productList?.length ? (
                <View className="company-index__detail__producRecommendation">
                  <WrapPanel
                    title="产品介绍"
                    data={companyData?.productList}
                    RowRender={(item: IProduct, i: number) => (
                      <Product
                        onClick={() => {
                          setOpen(true)
                          setCurrentIndex(i)
                        }}
                        {...item}
                      />
                    )}
                  />
                </View>
              ) : null}
              {companyData?.companySeniorList?.length ? (
                <View className="company-index__detail__producRecommendation">
                  <WrapPanel
                    title="高管介绍"
                    data={decoratorDataMap(companyData?.companySeniorList)}
                    RowRender={(item: IProduct, i: number) => (
                      <Product
                        onClick={() => {
                          setOpenCompanySenior(true)
                          setCompanySeniorCurrentIndex(i)
                        }}
                        {...item}
                      />
                    )}
                  />
                </View>
              ) : null}
            </View>
          </AtTabsPane>

          <AtTabsPane current={current} index={1}>
            {renderJobs()}
          </AtTabsPane>
        </AtTabs>
        <SubmitBar
          disabled={isFavorited}
          loading={collectLoading}
          text={isFavorited ? '已收藏' : '收藏'}
          onBtnClick={handleCollected}
          useLoginButton
          needShowButton={isLogined}
        >
          <Button onClick={handleShared} className="company-index__share">
            <View className={c('icon', 'iconfont', 'iconzhiweifenxiang')} />
            <View className="company-index__share__text">分享</View>
          </Button>
        </SubmitBar>
        {companyData?.productList?.length ? (
          <PreviewSwiperPanel
            currentIndex={currentIndex}
            open={open}
            data={companyData?.productList}
            RowRender={(item: IProduct) => <Product className="noflex" {...item} isFlex={false} />}
            onClose={() => setOpen(false)}
            onSwiperChange={setCurrentIndex}
          />
        ) : null}
        {companyData?.companySeniorList?.length ? (
          <PreviewSwiperPanel
            currentIndex={companySeniorCurrentIndex}
            open={openCompanySenior}
            data={decoratorDataMap(companyData?.companySeniorList)}
            RowRender={(item: IProduct) => <Product className="noflex" {...item} isFlex={false} />}
            onClose={() => setOpenCompanySenior(false)}
            onSwiperChange={setCompanySeniorCurrentIndex}
          />
        ) : null}
      </React.Fragment>
    )
  }

  const renderContent = () => {
    switch (pageStatus) {
      case PageStatus.LOADING:
        return <Loading />
      case PageStatus.FINISHED:
        return renderMain()
      case PageStatus.ERROR:
      default:
        redirectTo({ url: '/weapp/general/error/index' })
    }
  }
  return (
    <MainLayout navBarTitle="公司主页" className="company-index">
      {renderContent()}
      <FixedBottomPopup ref={fixedbottomPopupRef} />
      <RefuelPackagePopup ref={refuelPackagePupupRef} />
    </MainLayout>
  )
}

export default CompanyIndex
