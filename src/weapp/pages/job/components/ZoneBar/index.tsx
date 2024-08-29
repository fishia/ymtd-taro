import { View, Image, Swiper, SwiperItem } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import c from 'classnames'
import React from 'react'

import { jdAggregateZone } from '@/apis/job'
import LoginButton from '@/components/LoginButton'
import { IProps } from '@/def/common'
import { IZoneIcon } from '@/def/job'
import { useAsync } from '@/hooks/sideEffects/useAsync'
import { sendHongBaoEvent } from '@/utils/dataRangers'
import { combineStaticUrl, jsonToUrl } from '@/utils/utils'

import './index.scss'

export interface IZoneBarItem extends IZoneIcon {
  linkType?: 'webview' | 'jump' | 'noop'
}

export interface IZoneBarProps extends IProps {
  items?: IZoneBarItem[]
  school?: boolean
}
const colors = ['#6173FF', '#FB7E52', '#F7922D', '#20C472', '#F4881B']

const ZoneBar: React.FC<IZoneBarProps> = props => {
  const { items = [], className, style, school = false } = props
  const { value: tabList } = useAsync(() => {
    return jdAggregateZone()
  }, [])

  const handleClick = (item: IZoneBarItem, index: number) => {
    sendHongBaoEvent('Iconclick', {
      icon_rank: index + 1,
      icon_name: item.name,
      mp_version: school ? '校园版' : '社招版',
    })
    let params = {
      type: item.type,
      title: item.name,
      icon_rank: index + 1,
    }
    if (item.name === '高匹配') {
      Object.assign(params, {
        functionName: item?.mpc_function_tags?.[0].functionName,
        mpc_function_tags: item?.mpc_function_tags ? JSON.stringify(item?.mpc_function_tags) : null,
      })
    }

    if (school) {
      sendHongBaoEvent('EventPageExpose', {
        event_name: item.name,
        event_rank: index + 1,
      })
      //校园版的时候需要根据
      navigateTo({
        url: `/${item.link_url}?${jsonToUrl(params)}`,
      })
    } else {
      if (item.name === '精选榜') {
        const jobParams = {
          type: item.type,
          choiceList: JSON.stringify(tabList),
        }

        navigateTo({
          url: `/weapp/job/job-choiceness/index?${jsonToUrl(jobParams)}`,
        })
        return
      }

      navigateTo({
        url: `/weapp/job/job-zones/index?${jsonToUrl(params)}`,
      })
    }
  }

  return (
    <View className={c('job-index__zone-bar', className)} style={style}>
      {items.map((item, index) => (
        <LoginButton
          onClick={() => handleClick(item, index)}
          className={c('job-index__zone-bar__iconItem', {
            'job-index__zone-bar__item': !school,
            'job-index__zone-bar__schoolItem': school,
          })}
          key={item.type}
        >
          <View
            className={c({
              'job-index__zone-bar__icon': !school,
              'job-index__zone-bar__schoolIcon': school,
            })}
          >
            <Image className="job-index__zone-bar__image" src={combineStaticUrl(item.icon_url)} />
          </View>
          <View className="job-index__zone-bar__content">
            <View className="job-index__zone-bar__title">{item.name}</View>

            <View className="job-index__zone-bar__subTitle" style={{ color: colors[index] }}>
              {item?.mpc_function_tags && item?.mpc_function_tags.length > 1 ? (
                <Swiper className="job-index__zone-bar__swiper" vertical={false} circular autoplay>
                  {item?.mpc_function_tags.map(func => (
                    <SwiperItem
                      className="job-index__zone-bar__swiper-item"
                      key={func.functionType}
                    >
                      {func.functionName}
                    </SwiperItem>
                  ))}
                </Swiper>
              ) : (
                item?.mpc_function_tags?.[0]?.functionName || ''
              )}
            </View>
          </View>
        </LoginButton>
      ))}
    </View>
  )
}

export default ZoneBar
