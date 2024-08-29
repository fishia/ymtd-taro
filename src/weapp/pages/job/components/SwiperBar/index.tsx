import { View, Image, Swiper, SwiperItem } from '@tarojs/components'
import { getStorageSync } from '@tarojs/taro'
import c from 'classnames'
import { includes } from 'lodash'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { getJobBannerList } from '@/apis/job'
import LoginButton from '@/components/LoginButton'
import { onJumpStickyFn } from '@/components/Popup/resumeStickyPopup'
import { APP_TOKEN_FLAG } from '@/config'
import { IProps } from '@/def/common'
import { IBanner } from '@/def/job'
import { defaultUserInfo } from '@/def/user'
import { useShowLoginPopup } from '@/hooks/custom/usePopup'
import { bestEmployerByToken, isBestEmployeActivity } from '@/hooks/custom/usePopupData'
import { useCurrentUserInfo, useIsLogin } from '@/hooks/custom/useUser'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'
import { combineStaticUrl, jumpToUrlByLinkType } from '@/utils/utils'

import './index.scss'

export interface ISwiperBarItem extends IBanner {
  onClick?(item: ISwiperBarItem, index: number): void
}

export interface ISwiperBarProps extends IProps {
  items?: ISwiperBarItem[]
  school?: boolean
  sendEvent?: boolean
  type?: number
}

const pageTypeMap = {
  default: '首页banner',
  47: '我的页面banner',
  48: '职位详情页banner',
  55: '搜索页面banner',
}

const SwiperBar: React.FC<ISwiperBarProps> = props => {
  const { items = [], className, style, school, type } = props
  const [current, setCurrent] = useState(0)
  const userInfo = useCurrentUserInfo() || defaultUserInfo
  const profileTopADExpose = userInfo.profileTopADExpose
  const profileTop = userInfo.profileTop
  const [swiperData, setSwiperData] = useState<IBanner[]>([])
  const isLogined = getStorageSync(APP_TOKEN_FLAG)
  const isLoginedState = useIsLogin()
  const showLoginPopup = useShowLoginPopup()

  const filterItems = useCallback(
    data => {
      return data.filter(item => {
        if (item.link_url?.includes('/active/resume-sticky/index')) {
          if (profileTop) {
            return false
          }

          if (!profileTopADExpose) {
            return false
          }
        }
        return true
      })
    },
    [profileTop, profileTopADExpose]
  )

  const newItem = useMemo(() => {
    const data = type ? swiperData : items

    return filterItems(data)
  }, [items, swiperData, type, filterItems])

  const handleClick = (item: ISwiperBarItem, index: number) => {
    const { onClick } = item

    // 外部自行处理
    if (onClick) {
      onClick(item, index)
      return
    }

    if (includes(newItem[current].link_url, 'resume-sticky')) {
      sendDataRangersEventWithUrl('EventPopupClick', {
        event_name: '简历置顶服务',
        type: 'banner',
      })
    } else if (
      includes(newItem[current].title, '薪酬指南') ||
      includes(newItem[current].title, '薪酬报告')
    ) {
      sendDataRangersEventWithUrl('EventPopupClick', {
        event_name: '2023薪酬报告',
        type: 'banner',
      })
    } else {
      sendDataRangersEventWithUrl('EventPopupClick', {
        event_name: newItem[current].title,
        type: pageTypeMap[type || 'default'],
      })
    }
    onClickItem(item)
  }

  const onClickItem = item => {
    if (isBestEmployeActivity(item.link_url)) {
      if (!isLoginedState) {
        // 未登录不能点
        showLoginPopup()
        return
      }
      jumpToUrlByLinkType({
        ...item,
        link_url: bestEmployerByToken(item.link_url),
      })

      return
    }

    jumpToUrlByLinkType(item)
  }

  useEffect(() => {
    if (type) {
      getJobBannerList(type).then(bannerList => {
        setSwiperData(bannerList)
      })
    }
  }, [type])

  useEffect(() => {
    if (isLogined && newItem.length) {
      sendDataRangersEventWithUrl('EventPopupExpose', {
        event_name: newItem[current].title,
        type: pageTypeMap[type || 'default'],
        mp_version: school ? '校园版' : '社招版',
      })
      return
    }

    sendDataRangersEventWithUrl('register_and_login_Expose', {
      event_name: '注册登录引导',
      type: 'banner',
      first_visit_source: '首页banner',
    })
  }, [current, newItem])

  const preCls = 'job-index__swiper-bar__swiper'
  return (
    <>
      {newItem.length ? (
        <View className={c('job-index__swiper-bar', className)} style={style}>
          <Swiper
            className="job-index__swiper-bar__swiper"
            vertical={false}
            circular
            autoplay
            onChange={e => {
              setCurrent(e.detail.current)
            }}
          >
            {newItem.map((item, index) => (
              <SwiperItem className="job-index__swiper-bar__swiper-item" key={item.image_url}>
                {/* <LoginButton
                  onClick={() => handleClick(item, index)}
                  className="job-index__swiper-bar__img-wrapper"
                > */}
                <Image
                  className="job-index__swiper-bar__img"
                  src={combineStaticUrl(item.image_url)}
                  mode="scaleToFill"
                  onClick={() => handleClick(item, index)}
                />
                {/* </LoginButton> */}
                <View className={`${preCls}-dots`}>
                  {items.map((_, i) => (
                    <View key={i} className={c(`${preCls}-dot`, { active: current === i })}></View>
                  ))}
                </View>
              </SwiperItem>
            ))}
          </Swiper>
        </View>
      ) : null}
    </>
  )
}

export default SwiperBar
