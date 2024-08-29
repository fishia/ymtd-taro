import { eventCenter, navigateTo } from '@tarojs/taro'
import R from 'ramda'
import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { AtTabs, AtTabsPane } from 'taro-ui'

import { listFavoriteAritclesApi, listFavoriteCompaniesApi, listFavoriteJobsApi } from '@/apis/user'
import JobCard from '@/components/JobCard'
import LoadMore from '@/components/LoadMore'
import ScrollView from '@/components/ScrollView'
import { APP_DEF_PAGE_SIZE } from '@/config'
import { IList, IRelational, IRelationalType, LoadStatusType } from '@/def/common'
import { IDiscover } from '@/def/discover'
import { ICompany, IEventExposeParams, IJob, JobStatusType } from '@/def/job'
import { ExpChannelType } from '@/def/volcanoPoint'
import useToast from '@/hooks/custom/useToast'
import { useCurrentUserInfo } from '@/hooks/custom/useUser'
import MainLayout from '@/layout/MainLayout'
import { renderJobDetailUrlByParams } from '@/utils/utils'

import FavoriteArticle from '../components/FavoriteArticle'
import FavoriteCompany from '../components/FavoriteCompany'
import NoFavorite from '../components/NoFavorite'

import './index.scss'

const fields: IRelationalType[] = ['jd', 'company', 'article']
const tabTitles = ['职位', '公司', '文章'].map(title => ({ title }))
const fetchFns: Func1<number, Promise<IList<IRelational<any, IJob | ICompany | IDiscover>>>>[] = [
  listFavoriteJobsApi,
  listFavoriteCompaniesApi,
  listFavoriteAritclesApi,
]

const Favorite: React.FC = () => {
  const userInfo = useCurrentUserInfo()!
  const showToast = useToast()

  const [currentTab, setCurrentTab] = useState<number>(0)
  const [tabPageNum, setTabPageNum] = useState<number[]>([1, 1, 1])

  const [jdList, setJdList] = useState<IJob[]>([])
  const [companyList, setCompanyList] = useState<ICompany[]>([])
  const [articleList, setArticleList] = useState<IDiscover[]>([])

  const [deletedArticleIds, setDeletedArticleIds] = useState<number[]>([])

  const jobs = useMemo(
    () => jdList.filter(job => userInfo?.favorite_ids?.includes(job.id) ?? false),
    [jdList, userInfo?.favorite_ids]
  )
  const companies = useMemo(
    () =>
      companyList.filter(company => userInfo?.favorite_company_ids?.includes(company.id) ?? false),
    [companyList, userInfo?.favorite_company_ids]
  )
  const articles = useMemo(
    () =>
      articleList
        .filter(article => userInfo?.favorite_article_ids?.includes(article.id) ?? false)
        .filter(item => !deletedArticleIds.includes(item.id)),
    [articleList, deletedArticleIds, userInfo?.favorite_article_ids]
  )

  const [jdStatus, setJdStatus] = useState<LoadStatusType>('more')
  const [companyStatus, setCompanyStatus] = useState<LoadStatusType>('more')
  const [articleStatus, setArticleStatus] = useState<LoadStatusType>('more')

  const field = fields[currentTab]
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
    [jdList, companyList, articleList][currentTab],
    [setJdList, setCompanyList, setArticleList][currentTab],
  ]
  const [pageStatus, setPageStatus] = [
    [jdStatus, companyStatus, articleStatus][currentTab],
    [setJdStatus, setCompanyStatus, setArticleStatus][currentTab],
  ]

  const shouldAppendList = pageStatus === 'more'
  const appendList = () => {
    if (!shouldAppendList) {
      return
    }

    setPageStatus('loading')
    fetchFn(pageNum).then(pageData => {
      const listData = pageData.list.map(item => item[field]) as any

      setList(R.uniqBy(item => item.id, [...list, ...listData]))
      setPageNum(pageData.current + 1)
      setPageStatus(pageData.current * APP_DEF_PAGE_SIZE >= pageData.total ? 'noMore' : 'more')
    })
  }

  const handleJobClick = useCallback(
    (job: IJob, eventExposeParams: IEventExposeParams) => {
      if (job.status === JobStatusType.OK) {
        navigateTo({ url: renderJobDetailUrlByParams({ ...eventExposeParams, tag: job?.tag }) })
      } else {
        showToast({ content: '该职位已下线' })
      }
    },
    [showToast]
  )

  const handleCompanyClick = useCallback((company: ICompany) => {
    navigateTo({ url: `/weapp/job/company-index/index?id=${company.id}` })
  }, [])

  const handleArticleClick = useCallback((article: IDiscover) => {
    navigateTo({ url: `/weapp/discover/discover-detail/index?id=${article.id}&source=my` })
  }, [])

  // 进入页面、初次切换 TAB 时请求
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => void (pageNum === 1 && shouldAppendList && appendList()), [currentTab])

  // 访问被删除的文章时，自列表中移除对应项
  useEffect(
    () => {
      eventCenter.on('favorite-delete', (type: 'article', id: number) => {
        if (type === 'article') {
          setDeletedArticleIds([...deletedArticleIds, Number(id)])
        }
      })

      return () => void eventCenter.off('favorite-delete')
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <MainLayout className="my-record">
      <AtTabs
        className="my-record__tabs"
        current={currentTab}
        tabList={tabTitles}
        onClick={setCurrentTab}
      >
        <AtTabsPane current={currentTab} index={0}>
          {jobs.length > 0 ? (
            <ScrollView
              className="my-record__scrollview"
              lowerThreshold={120 * 5 + 55}
              loadMore={appendList}
            >
              {jobs.map((job, i) => {
                const eventExposeParams: IEventExposeParams = {
                  jd_id: job.id,
                  page_no: pageNum,
                  position_no: (i % 10) + 1,
                  exp_channel: ExpChannelType.COLLECT,
                  expose_id: job.exposeId,
                  expName: job.expName,
                  isSeed: job.isSeed,
                  isVirtual: job.isVirtual,
                }
                return (
                  <JobCard
                    onClick={() => {
                      const arr = [...jobs]
                      arr[i].isSeed = true
                      setJdList(arr)
                      void handleJobClick(job, eventExposeParams)
                    }}
                    data={job}
                    key={job.id}
                    eventExposeParams={eventExposeParams}
                    relativeToClassName="my-record__scrollview"
                  />
                )
              })}
              <LoadMore status={jdStatus} />
            </ScrollView>
          ) : (
            <NoFavorite isLoading={jdStatus !== 'noMore'} type="job" />
          )}
        </AtTabsPane>

        <AtTabsPane current={currentTab} index={1}>
          {companies.length > 0 ? (
            <ScrollView
              className="my-record__scrollview"
              lowerThreshold={90 * 5 + 55}
              loadMore={appendList}
            >
              {companies.map(company => (
                <FavoriteCompany
                  onClick={() => void handleCompanyClick(company)}
                  company={company}
                  key={company.id}
                />
              ))}
              <LoadMore status={companyStatus} />
            </ScrollView>
          ) : (
            <NoFavorite isLoading={companyStatus !== 'noMore'} type="company" />
          )}
        </AtTabsPane>

        <AtTabsPane current={currentTab} index={2}>
          {articles.length > 0 ? (
            <ScrollView
              className="my-record__scrollview"
              lowerThreshold={120 * 5 + 55}
              loadMore={appendList}
            >
              {articles.map(article => (
                <FavoriteArticle
                  onClick={() => void handleArticleClick(article)}
                  article={article}
                  key={article.id}
                />
              ))}
              <LoadMore status={articleStatus} />
            </ScrollView>
          ) : (
            <NoFavorite isLoading={articleStatus !== 'noMore'} type="article" />
          )}
        </AtTabsPane>
      </AtTabs>
    </MainLayout>
  )
}

export default Favorite
