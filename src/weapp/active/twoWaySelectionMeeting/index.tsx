import { hideLoading, showLoading } from '@tarojs/taro'
import { useEffect, useState } from 'react'

import { getActiveListApi } from '@/apis/active-page'
import { getJobBannerList } from '@/apis/job'
import LoadMore from '@/components/LoadMore'
import ScrollView from '@/components/ScrollView'
import { APP_DEF_PAGE_SIZE } from '@/config'
import { IActiveEventParams, IMeetingInfo } from '@/def/active'
import { IProps, LoadStatusType } from '@/def/common'
import { IBanner } from '@/def/job'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import useToast from '@/hooks/custom/useToast'
import MainLayout from '@/layout/MainLayout'

import ActiveBanner from '../components/ActiveBanner'
import ActiveMeetingCard from '../components/ActiveMeetingCard'
import ActiveShare from '../components/ActiveShare'
import ActiveEventParamsContext from '../context'

import './index.scss'

export interface ITwoWaySelectionMeetingProps extends IProps {}

const prefixCls = 'two-way-selection-index'
const TwoWaySelectionMeeting: React.FC<ITwoWaySelectionMeetingProps> = () => {
  const routerParams = useRouterParam()
  const showToast = useToast()
  const [page, setPage] = useState<number>(1)
  const [list, setList] = useState<IMeetingInfo[]>([])
  const [swiperItem, setSwiperItem] = useState<IBanner[]>([])
  const [status, setStatus] = useState<LoadStatusType>('more')

  const pageTitle = routerParams.title ? routerParams.title : '双选会'

  const type = +routerParams?.type,
    icon_rank = routerParams?.icon_rank,
    title = pageTitle.includes('%')
      ? unescape(decodeURIComponent(pageTitle).replace(/\\/g, '%'))
      : pageTitle

  useEffect(() => {
    if (type) {
      //获取banner列表
      getJobBannerList(type).then(bannerList => {
        setSwiperItem(bannerList)
      })
    }
  }, [type])

  const appendList = () => {
    if (status === 'loading' || status === 'noMore') {
      return
    }
    setStatus('loading')
    showLoading()
    getActiveListApi({ type, page })
      .then(pageData => {
        hideLoading()
        const listData = pageData.list

        setList([...list, ...listData])
        setPage(pageData.current + 1)
        setStatus(pageData.current * APP_DEF_PAGE_SIZE >= pageData.total ? 'noMore' : 'more')
      })
      .catch(() => {
        hideLoading()
        showToast({ content: '加载活动失败' })
      })
  }

  // 进入页面后初次加载
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(appendList, [])

  return (
    <MainLayout className={prefixCls}>
      <ScrollView lowerThreshold={300} loadMore={appendList} className={`${prefixCls}__scrollView`}>
        <ActiveBanner swiperItem={swiperItem} />
        {list.map((active: IMeetingInfo, i) => {
          return (
            <ActiveEventParamsContext.Provider
              value={{
                event_name: active.title,
                event_rank: i + 1,
              }}
              key={i}
            >
              <ActiveMeetingCard
                data={active}
                route={active.extendUrl || '/weapp/active/twoWaySelectionMeetingDetail/index'}
                params={{
                  icon_rank: i + 1,
                  v: 0,
                }}
              />
            </ActiveEventParamsContext.Provider>
          )
        })}
        <LoadMore status={status} />
      </ScrollView>
      <ActiveShare />
    </MainLayout>
  )
}

export default TwoWaySelectionMeeting
