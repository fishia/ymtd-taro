import { View, ScrollView } from '@tarojs/components'
import { createSelectorQuery, navigateBack } from '@tarojs/taro'
import c from 'classnames'
import { findIndex } from 'lodash'
import React, { useEffect, useState } from 'react'
import { AtNavBar } from 'taro-ui'

import { IChoiseList, IJobSearch } from '@/def/job'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import MainLayout from '@/layout/MainLayout'
import { sendHongBaoEvent } from '@/utils/dataRangers'
import { statusBarHeight } from '@/weapp/pages/job/components/JobNavgation'

import ZonesList from '../job-zones/compnents/ZonesList'

import './index.scss'

let topNavHeight = 44

const Choiceness: React.FC = () => {
  const navigationPaddingTop = statusBarHeight + 'px'
  const pageParam = useRouterParam()
  const type = pageParam.type ? +pageParam.type : 0

  const tabList = JSON.parse(decodeURIComponent(pageParam?.choiceList || '[]')) as IChoiseList[]

  const tag = decodeURIComponent(pageParam.tag || '')

  const title = '医脉同道精选榜'

  const [jobFilters, setJobFilters] = useState<IJobSearch>({
    page: 1,
    tag: tag ? tag : tabList?.[0]?.name,
  })

  const [isScrollTop, setIsScrollTop] = useState<boolean>(true)
  const [isScrollIntoView, setIsScrollIntoView] = useState<boolean>(true)

  //更新过滤项
  const updateJobFilters = obj => {
    setJobFilters({
      ...jobFilters,
      ...obj,
    })
  }

  const isSelected = val => {
    return val === jobFilters.tag
  }

  const onScroll = e => {
    setIsScrollTop(e.detail.scrollTop > 30 ? false : true)
  }

  const toBack = () => {
    navigateBack({ delta: 1 })
  }

  const chooseTab = item => {
    setIsScrollIntoView(false)
    updateJobFilters({ tag: item.name, page: 1 })
  }

  const fliterClick = isOpen => {
    if (isOpen) {
      setIsScrollTop(false)
      createSelectorQuery()
        .select('#zonesScrollId')
        .node()
        .exec(res => {
          console.log(res)
          const scrollView = res[0].node
          scrollView.scrollTo({
            top: 99999,
          })
        })
    }
  }

  useEffect(() => {
    sendHongBaoEvent('page_view', {
      page_name: `入选${jobFilters.tag}榜单`,
    })
  }, [jobFilters])

  return (
    <MainLayout className="choiceness-index">
      <ScrollView
        id="zonesScrollId"
        enhanced
        style={{ height: '100vh' }}
        scrollY
        onScroll={onScroll}
      >
        <View>
          <View
            className="navBarCard"
            id="navBarCardId"
            style={{
              paddingTop: navigationPaddingTop,
              background: isScrollTop ? 'transparent' : '#FA7B4E',
            }}
          >
            <AtNavBar
              color="#fff"
              title={title}
              leftIconType="chevron-left"
              className="navBar"
              border={false}
              customStyle={{ height: `${topNavHeight}px` }}
              onClickLeftIcon={toBack}
            />
          </View>
          <View className="choiceness-index__header"></View>
          <View className="choiceness-index__tabsCard">
            <View className="title">精选榜单</View>
            <ScrollView
              enhanced
              scrollX
              showScrollbar={false}
              scrollIntoView={
                isScrollIntoView
                  ? `tabList-${findIndex(tabList, ['name', jobFilters.tag])}`
                  : undefined
              }
              className="choiceness-index__tabs"
            >
              <View
                id={`tabList-0`}
                style={{ width: '24rpx', height: '10rpx', display: 'inline-block' }}
              ></View>
              {tabList.map((item, i) => (
                <View
                  id={`tabList-${i}`}
                  className={c('choiceness-index__tabItem', {
                    'tabItem--active': isSelected(item.name),
                  })}
                  style={{
                    backgroundImage: `url(${isSelected(item.name) ? item.selectedPic : item.pic})`,
                  }}
                  key={i}
                  onClick={() => chooseTab(item)}
                >
                  <View className={c('itemTitle', { 'itemTitle--sd': isSelected(item.name) })}>
                    {item.name}
                  </View>
                  <View
                    className={c('itemContent', {
                      'itemContent--sd': isSelected(item.name),
                    })}
                  >
                    {item.desc1}
                  </View>
                  <View
                    className={c('itemContent', {
                      'itemContent--sd': isSelected(item.name),
                    })}
                  >
                    {item.desc2}
                  </View>
                  <View className="numCount">{item.tagNum}个</View>
                </View>
              ))}
            </ScrollView>
          </View>
          <ZonesList
            title={title}
            type={type}
            jobFilters={jobFilters}
            changeJobFilters={setJobFilters}
            filterClick={fliterClick}
            className="choiceness-index"
            scrollHeight={`calc(100vh - 90rpx - ${topNavHeight}px - ${navigationPaddingTop})`}
          />
        </View>
      </ScrollView>
    </MainLayout>
  )
}

export default Choiceness
