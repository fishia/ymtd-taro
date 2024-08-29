import { View } from '@tarojs/components'
import {
  navigateBack,
  navigateTo,
  useDidShow,
  showLoading,
  hideLoading,
  setNavigationBarTitle,
} from '@tarojs/taro'
import { useGetState } from 'ahooks'
import R from 'ramda'
import { useEffect, useState } from 'react'
import { AtTabs, AtTabsPane } from 'taro-ui'

import { preachDetailApi } from '@/apis/active-page'
import { detailCompanyApi, listCompanyJobsApi } from '@/apis/job'
import emptyImageUrl from '@/assets/imgs/empty/no-company.png'
import Empty from '@/components/Empty'
import Line from '@/components/Line'
import LoadMore from '@/components/LoadMore'
import ScrollView from '@/components/ScrollView'
import { APP_DEF_PAGE_SIZE } from '@/config'
import { IActiveEventParams, IMeetingDetail } from '@/def/active'
import { IAdress, IProps, LoadStatusType } from '@/def/common'
import { ICompany, IEventExposeParams, IJob } from '@/def/job'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import useToast from '@/hooks/custom/useToast'
import MainLayout from '@/layout/MainLayout'
import { formatStringToHtml } from '@/services/StringService'
import { renderJobDetailUrlByParams } from '@/utils/utils'
import DetailLocation from '@/weapp/job/components/DetailLocation'
import DetailSection from '@/weapp/job/components/DetailSection'

import ActiveAudio from '../components/ActiveAudio'
import ActiveJobCard from '../components/ActiveJobCard'
import ActiveShare from '../components/ActiveShare'
import SimpleCompanyCard from '../components/SimpleCompanyCard'
import ActiveEventParamsContext from '../context'

import './index.scss'

export interface IPreachMeetingDetailProps extends IProps {}

const tabList = [{ title: '公司主页' }, { title: '在招职位' }]
const prefixCls = 'preach-meeting-detail-index'
const PreachMeetingDetail: React.FC<IPreachMeetingDetailProps> = () => {
  const showToast = useToast()
  const routerParams = useRouterParam()
  const id = +routerParams?.id,
    companyId = +routerParams?.companyId
  const pageTitle = routerParams.title ? routerParams.title : '宣讲会'

  const title = pageTitle.includes('%')
    ? unescape(decodeURIComponent(pageTitle).replace(/\\/g, '%'))
    : pageTitle

  const [meetingDetail, setMeetingDetail] = useState<IMeetingDetail>()
  const [list, setList, getList] = useGetState<IJob[]>([])
  const [page, setPage, getPage] = useGetState<number>(1)
  const [status, setStatus, getStatus] = useGetState<LoadStatusType>('more')
  const [location, setLocation] = useState<IAdress>()
  const [companyData, setCompanyData] = useState<ICompany>()
  const [current, setCurrent] = useState<number>(1)

  useEffect(() => {
    setNavigationBarTitle({ title })
  }, [])

  useEffect(() => {
    if (!id) {
      showToast({
        content: '找不到该活动',
        onClose: () => void navigateBack(),
      })
    } else {
      getDetailActive()
    }
    if (companyId) {
      detailCompanyApi(companyId).then(result => {
        const company: any = R.omit(['jds'], result)
        company.desc = company.desc ? formatStringToHtml(company.desc) : ''
        const point: any = R.pick(['city', 'address', 'location'], result)
        setLocation({
          ...point,
          lat: Array.isArray(point.location) ? null : point.location.lat,
          lng: Array.isArray(point.location) ? null : point.location.lng,
        })
        setCompanyData(company)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, companyId])

  const getDetailActive = () => {
    preachDetailApi(id)
      .then(res => {
        setMeetingDetail(res)
      })
      .catch(() => {
        showToast({
          content: '加载活动出错',
          onClose: () => void navigateBack(),
        })
      })
  }

  const appendList = () => {
    const latestStatus = getStatus(),
      latestList = getList()
    if (!companyId || latestStatus === 'loading' || latestStatus === 'noMore') {
      return
    }
    setStatus('loading')
    showLoading({ title: '加载中，请稍后' })
    listCompanyJobsApi(companyId, { page: getPage(), v: 0 })
      .then(pageData => {
        const listData = pageData.list

        setList([...latestList, ...listData])
        setPage(pageData.current + 1)
        setStatus(pageData.current * APP_DEF_PAGE_SIZE >= pageData.total ? 'noMore' : 'more')
        hideLoading()
      })
      .catch(hideLoading)
  }

  const refreshPage = () => {
    setStatus('more')
    setPage(1)
    setList([])
    appendList()
  }

  useDidShow(refreshPage)

  // 点击列表项
  const handleClick = (job: IJob, eventExposeParams: IEventExposeParams) => {
    navigateTo({ url: renderJobDetailUrlByParams({ ...eventExposeParams, tag: job?.tag }) })
  }

  const contextValue: IActiveEventParams = {
    event_name: meetingDetail?.title || '宣讲会',
    event_rank: routerParams?.icon_rank,
  }

  return (
    <MainLayout className={prefixCls}>
      {meetingDetail && <ActiveAudio data={meetingDetail} />}
      {companyData && <SimpleCompanyCard companyData={companyData} />}
      <AtTabs current={current} tabList={tabList} onClick={setCurrent}>
        <AtTabsPane current={current} index={0}>
          {(companyData && companyData.desc) || (location?.city && location.address) ? (
            <>
              {companyData && companyData.desc && (
                <>
                  <DetailSection title="公司简介" text={companyData?.desc} border={false} />
                  <Line />
                </>
              )}

              {location?.city && location.address && (
                <DetailSection title="公司地址" border={false}>
                  <DetailLocation data={location} border={false} name={companyData?.name || ' '} />
                </DetailSection>
              )}
            </>
          ) : (
            <Empty text="" className="noCompany" picUrl={emptyImageUrl} />
          )}
        </AtTabsPane>

        <AtTabsPane current={current} index={1}>
          <ActiveEventParamsContext.Provider value={contextValue}>
            {list.length ? (
              <ScrollView
                className={`${prefixCls}__scrollView`}
                lowerThreshold={300}
                loadMore={appendList}
              >
                <View className={`${prefixCls}__jobList`}>
                  {list.map((job, i) => {
                    const eventExposeParams: IEventExposeParams = {
                      jd_id: job.id,
                      page_no: page,
                      position_no: (i % 10) + 1,
                    }
                    return (
                      <ActiveJobCard
                        key={job.id}
                        onClick={() => handleClick(job, eventExposeParams)}
                        data={{ ...job, status: 1 }}
                        eventExposeParams={eventExposeParams}
                        relativeToClassName={`${prefixCls}__scrollView`}
                      />
                    )
                  })}
                </View>
                <LoadMore status={status} />
              </ScrollView>
            ) : (
              <Empty text="暂无在招职位" className="noCompany" picUrl={emptyImageUrl} />
            )}
          </ActiveEventParamsContext.Provider>
        </AtTabsPane>
      </AtTabs>
      <ActiveShare title="分享给你精彩的招聘宣讲会" />
    </MainLayout>
  )
}

export default PreachMeetingDetail
