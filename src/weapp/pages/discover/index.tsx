/* eslint-disable react-hooks/exhaustive-deps */
import { View, Text } from '@tarojs/components'
import { hideLoading, pxTransform, showLoading } from '@tarojs/taro'
import { useGetState } from 'ahooks'
import c from 'classnames'
import React, { useEffect, useState } from 'react'

import { findCompanyLabelApi, findCompanyListApi } from '@/apis/discover'
import LoadMore from '@/components/LoadMore'
import CustomNavTab, { statusBarHeight } from '@/components/NavTab'
import ScrollView from '@/components/ScrollView'
import { APP_DEF_PAGE_SIZE } from '@/config'
import { IMeetingCompany } from '@/def/active'
import { LoadStatusType } from '@/def/common'
import { ICompanyLabel } from '@/def/discover'
import MainLayout from '@/layout/MainLayout'
import { sendDataRangersEvent } from '@/utils/dataRangers'

import NoJob from '../job/components/NoJob'
import DiscoverActicle from './components/discover-article'
import LimitJobCardList from './components/limitJobCardList'

import './index.scss'

const discoverItabList = [{ title: '发现公司' }, { title: '最新资讯' }]

const Discover: React.FC = () => {
  const [companyLabels, setCompanyLabels] = useState<ICompanyLabel[]>([])
  const [currentLabel, setCurrentLabel, getCurrentLabel] = useGetState('')
  const [currentType, setCurrentType] = useState(0)
  const [list, setList, getList] = useGetState<IMeetingCompany[]>([])
  const [page, setPage, getPage] = useGetState<number>(1)
  const [currentIndex, setCurrentIndex] = useGetState<number>(0)
  const [status, setStatus, getStatus] = useGetState<LoadStatusType>('more')
  const [loading, setLoading] = useState(false)

  const showPageloading = () => {
    setLoading(true)
    showLoading({ title: '加载中，请稍后' })
  }

  const hidePageLoading = () => {
    setLoading(false)
    hideLoading()
  }

  const appendList = () => {
    const latestStatus = getStatus(),
      latestList = getList()
    if (latestStatus === 'loading' || latestStatus === 'noMore') {
      return
    }
    showPageloading()
    findCompanyListApi({
      type: getCurrentLabel(),
      page: getPage(),
      pageSize: APP_DEF_PAGE_SIZE,
    })
      .then(pageData => {
        const listData = pageData.list

        setList([...latestList, ...listData])
        setPage(pageData.current + 1)
        setStatus(pageData.current * APP_DEF_PAGE_SIZE >= pageData.total ? 'noMore' : 'more')
        hidePageLoading()
      })
      .catch(hidePageLoading)
  }

  useEffect(() => {
    findCompanyLabelApi().then(labels => {
      if (labels && labels.length) {
        setCompanyLabels(labels)
        setCurrentLabel(labels[0].companyLabel)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (currentLabel) {
      appendList()
      sendDataRangersEvent('findcompany_pageview', {
        page_name: '发现公司',
        tab_type: currentLabel,
      })
    }
  }, [currentLabel])
  const onChangeLabel = (label: string, i: number) => {
    if (currentLabel === label) {
      return
    }
    setCurrentLabel(label)
    setCurrentType(i)
    setStatus('more')
    setPage(1)
    setList([])
  }

  return (
    <MainLayout
      className="discover-index"
      style={{
        paddingTop: `calc(${statusBarHeight}px + ${pxTransform(80)})`,
      }}
    >
      <CustomNavTab tabList={discoverItabList} current={currentIndex} onClick={setCurrentIndex} />
      {currentIndex ? (
        <DiscoverActicle />
      ) : (
        <>
          {companyLabels.length ? (
            <View className="discover-index__top">
              <View className="discover-index__tags">
                {companyLabels.map((item, index) => (
                  <View
                    className={c('discover-index__tag', {
                      'discover-index__tag--active': currentType === index,
                    })}
                    onClick={() => {
                      onChangeLabel(item.companyLabel, index)
                    }}
                    key={index}
                  >
                    {item.companyLabel}
                  </View>
                ))}
              </View>
              <View className="discover-index__desc">
                <View className="discover-index__count">
                  <Text>{companyLabels[currentType].companyCount}</Text>家公司
                </View>
                <View className="discover-index__count">
                  <Text>{companyLabels[currentType].companyJdCount}</Text>个职位
                </View>
              </View>
            </View>
          ) : null}
          {list.length ? (
            <ScrollView
              lowerThreshold={300}
              className="discover-index__scrollView"
              loadMore={appendList}
              style={{
                top: companyLabels.length
                  ? `calc(${statusBarHeight}px + ${pxTransform(80 + 166)})`
                  : `calc(${statusBarHeight}px + ${pxTransform(80)})`,
              }}
            >
              <View className="discover-index__list">
                {list.map((item, i) => {
                  return <LimitJobCardList {...item} key={i} tabTypeName={currentLabel} />
                })}
              </View>
              <LoadMore
                status={status}
                style={{
                  background: '#ECEEF4',
                }}
              />
            </ScrollView>
          ) : (
            <>{!loading ? <NoJob custom description="暂无数据" /> : null}</>
          )}
        </>
      )}
    </MainLayout>
  )
}
export default Discover
