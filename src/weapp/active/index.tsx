import { View, Text, Image, Navigator, Button } from '@tarojs/components'
import { navigateTo, setNavigationBarTitle } from '@tarojs/taro'
import React, { useEffect, useState } from 'react'

import { getActiveList } from '@/apis/active-page'
import JobCard from '@/components/JobCard'
import { ActiveListProps } from '@/def/active'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import MainLayout from '@/layout/MainLayout'
import { combineStaticUrl, jumpOldUrl, jumpToWebviewPage } from '@/utils/utils'

import CompanyCard from './components/ActiveCompanyCard'
import TitleCard from './components/titleCard'

import './index.scss'

const jumpTo = (url?: string) => {
  if (url && url.startsWith('http')) {
    jumpToWebviewPage(url)
  } else if (url) {
    jumpOldUrl(url)
  } else {
    return
  }
}

const AdvertList = props => {
  const { ads } = props
  return (
    <View className="advert-list module-item">
      <TitleImage classNames="advert-list-title" urls={ads.title} />
      <View className="advert-list-content module-item-content">
        {ads.list.map((item, index) => {
          return (
            <View key={index} className="advert-item">
              <Image src={combineStaticUrl(item.image)} onClick={() => jumpTo(item.link)} />
            </View>
          )
        })}
      </View>
    </View>
  )
}

const TitleImage = props => {
  const { classNames, urls } = props
  return (
    <View className={`${classNames} module-item-title`}>
      <Image src={combineStaticUrl(urls)} />
    </View>
  )
}

const CardList = props => {
  const { content, url } = props
  return (
    <View key={url}>
      <Navigator url={url}>{content}</Navigator>
    </View>
  )
}

const ActivePage: React.FC = () => {
  const [activeType, setActiveType] = useState<number>(1)
  const [activeList, setActiveList] = useState<ActiveListProps>()
  const routerParams = useRouterParam()
  const {
    activity_name,
    ads,
    aggregations,
    background,
    companies,
    jds,
    promotional_image,
    description,
  } = activeList || {}

  useEffect(() => {
    setActiveType(Number(routerParams.activity_type || 1))
    getActiveList(routerParams.activity_type).then(res => {
      setActiveList(res)
      setNavigationBarTitle({ title: res.activity_name })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goPosition = (showPosition?: string) => {
    const detail = {
      background,
      promotional_image,
      aggregations,
      showPosition,
      activity_name,
      description,
      isSale: activeType !== 1 && activeType !== 4,
      activeType,
    }
    navigateTo({
      url: `/weapp/active/position-recommendation/index?detail=${encodeURIComponent(
        JSON.stringify(detail)
      )}`,
    })
  }

  return (
    <MainLayout className="active-common-page">
      <View className="header-banner">
        <Image
          src={combineStaticUrl(promotional_image?.image)}
          onClick={() => jumpTo(promotional_image?.link)}
        />
      </View>
      <View
        className="back-ground"
        style={`background: url(${combineStaticUrl(background?.image)})`}
      >
        <View className="back-ground">
          <TitleCard aggregations={aggregations} />
          {ads ? <AdvertList ads={ads} /> : null}
          {jds ? (
            <View className="job-list module-item">
              <TitleImage classNames="job-list" urls={jds.title} />
              <View className="module-item-content">
                {jds.list.map(v => (
                  <CardList
                    key={v.id}
                    url={`/weapp/job/job-detail/index?jd_id=${v.id}`}
                    content={
                      <JobCard
                        {...{
                          className: 'job-index__card',
                          data: v,
                        }}
                        active
                      />
                    }
                  ></CardList>
                ))}
                <Button className="look-more-btn" onClick={() => goPosition('position')}>
                  <Text>查看更多职位</Text>
                </Button>
              </View>
            </View>
          ) : null}
          {companies ? (
            <View className="company-list module-item">
              <TitleImage urls={companies.title} />
              <View className="module-item-content">
                {companies.list.map(item => {
                  return (
                    <CardList
                      key={item.id}
                      url={`/weapp/job/company-index/index?id=${item.id}`}
                      content={<CompanyCard showMore={false} detail={item} />}
                    ></CardList>
                  )
                })}
                <Button className="look-more-btn" onClick={() => goPosition('')}>
                  <Text>查看更多公司</Text>
                </Button>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </MainLayout>
  )
}

export default ActivePage
