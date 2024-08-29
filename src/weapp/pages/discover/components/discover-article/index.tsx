import { View, Navigator } from '@tarojs/components'
import { pxTransform } from '@tarojs/taro'
import { useGetState } from 'ahooks'
import R from 'ramda'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AtLoadMore } from 'taro-ui'

import { listDiscoversApi } from '@/apis/discover'
import { getJobBannerList } from '@/apis/job'
import Empty from '@/components/Empty'
import CustomNavTab, { statusBarHeight } from '@/components/NavTab'
import ScrollView from '@/components/ScrollView'
import { APP_DEF_PAGE_SIZE, STATIC_MP_IMAGE_HOST } from '@/config'
import { PageStatus } from '@/def/common'
import { IDiscover, IDiscoverList, IDiscoverSearch } from '@/def/discover'
import { IBanner } from '@/def/job'
import useToast from '@/hooks/custom/useToast'
import { useAsyncFn } from '@/hooks/sideEffects/useAsync'
import useList from '@/hooks/state/useList'
import { jumpToUrlByLinkType } from '@/utils/utils'
import SwiperBar from '@/weapp/pages/job/components/SwiperBar'

import ArticleCard from './components/articleCard'

import './index.scss'

const articleTabs = [
  { title: '文章', index: 3 },
  { title: '资讯', index: 4 },
]

const DiscoverActicle: React.FC = () => {
  const showToast = useToast()
  const [swiperItem, setSwiperItem] = useState<IBanner[]>([])
  const [list, { clear, push, set }] = useList<IDiscover>()
  const [pageStatus, setPageStatus] = useState<PageStatus>(PageStatus.FINISHED)
  const [page, setPage] = useState<number>(1)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [currentIndex, setCurrentIndex] = useGetState<number>(3)

  const [fetchState, fetchMethod] = useAsyncFn<() => Promise<IDiscoverList>>(() => {
    let searchOptions: IDiscoverSearch = R.clone({ page, type: currentIndex })
    return listDiscoversApi(searchOptions)
  }, [page, currentIndex])

  const loadStatus = useMemo(() => {
    const switchFn = R.cond([
      [R.prop('error'), R.always(undefined)],
      [R.prop('loading'), R.always('loading')],
      [
        R.T,
        state => {
          const { current: currentPage, total } = R.pathOr(
            { current: 1, total: 0, list: [] },
            ['value'],
            state
          )

          if (currentPage * APP_DEF_PAGE_SIZE >= total) {
            return 'noMore'
          } else {
            return 'more'
          }
        },
      ],
    ])
    return switchFn(fetchState)
  }, [fetchState])

  // 处理搜索结果
  const handleFetchValue = fetchValue => {
    const resultList = R.pathOr([], ['value', 'list'], fetchValue)
    if (R.isEmpty(resultList)) {
      if (R.isEmpty(list) || page === 1) {
        clear()
        setPageStatus(PageStatus.EMPTY)
      }
    } else {
      page === 1 ? set(resultList) : push(...resultList)
      pageStatus !== PageStatus.FINISHED && setPageStatus(PageStatus.FINISHED)
      setIsRefreshing(false)
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
  // Load加载
  useEffect(() => {
    fetchMethod()
  }, [fetchMethod])
  //上拉加载
  const handleLoadMore = useCallback(() => {
    if (loadStatus === 'noMore' || loadStatus === 'loading') {
      return
    } else if (loadStatus === 'more') {
      let p = page
      setPage(++p)
    }
  }, [loadStatus])

  const refreshList = () => {
    setIsRefreshing(true)
    setPage(1)
    fetchMethod()
  }
  const renderArticleList = () => {
    return (
      <>
        <View className="discover-article-index__list">
          {list.map(v => (
            <View key={v.id}>
              <Navigator url={`/weapp/discover/discover-detail/index?id=${v.id}&source=article`}>
                <ArticleCard data={v} is_top={v.type === '置顶'} is_hot={v.type === '热点'} />
              </Navigator>
            </View>
          ))}
          <AtLoadMore
            noMoreText="没有更多了~"
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
          <Empty
            picUrl={STATIC_MP_IMAGE_HOST + 'no-job.png'}
            className="discover-article-index__empty"
            text="暂无干货"
          />
        )
      case PageStatus.FINISHED:
        return renderArticleList()
      default:
        return null
    }
  }
  // 加载Banner,专区icon位
  useEffect(() => {
    //获取banner列表
    getJobBannerList(25).then(bannerList => {
      const fn = item => {
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
  }, [])

  return (
    <View className="discover-article-index">
      <ScrollView
        className="discover-article-index__scrollview"
        style={{
          top: `calc(${statusBarHeight}px + ${pxTransform(90)})`,
        }}
        loadMore={handleLoadMore}
        refresherEnabled
        refresherBackground="#FFF"
        onRefresherRefresh={refreshList}
        refresherTriggered={isRefreshing}
      >
        {swiperItem.length > 0 ? <SwiperBar items={swiperItem} style={{ margin: '0 0' }} /> : null}
        <CustomNavTab
          className='discover-article-index__tab'
          tabList={articleTabs}
          current={currentIndex}
          onClick={index=>{
            setCurrentIndex(index)
            setPage(1)
          }}
          fixed={false}
          underLine
        />
        {renderContent()}
      </ScrollView>
    </View>
  )
}
export default DiscoverActicle
