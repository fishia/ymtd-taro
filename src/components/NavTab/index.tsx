import { View, Text } from '@tarojs/components'
import Taro, { getSystemInfoSync, pxTransform } from '@tarojs/taro'
import c from 'classnames'
import React, { useEffect, useState } from 'react'
import { AtTabBarProps } from 'taro-ui/types/tab-bar'

import { IProps } from '@/def/common'

import './index.scss'

export enum linkMethod {
  switchTab,
  navigateTo,
}
export interface tabItem {
  title: string
  router?: string
  new?: boolean
  type?: linkMethod
  index?: number
}
interface INavTabProps extends IProps {
  tabList: Array<tabItem>
  onClick?: (index: number) => void
  current: number
  underLine?: boolean
  /**
   * 是否固定底部
   * @default false
   */
  fixed?: boolean
  /**
   * 背景颜色
   * @default #fff
   */
  customStyle?: {
    /**
     * 图标大小
     * @default 24
     */
    iconSize?: number
    /**
     * 字体大小
     * @default 14
     */
    fontSize?: number
    /**
     * 未选中标签字体与图标颜色
     * @default #333
     */
    color?: string
    /**
     * 选中标签字体与图标颜色
     * @default #6190E8
     */
    selectedColor?: string
  }
}

const systemInfo = getSystemInfoSync()
export const statusBarHeight = systemInfo?.statusBarHeight || 20
const navigationPaddingTop = statusBarHeight + 'px'

const CustomNavTab: React.FC<INavTabProps> = props => {
  const {
    tabList = [],
    onClick,
    current = 0,
    underLine = false,
    fixed = true,
    className,
    style,
    customStyle = {
      color: '#7A7F99',
      fontSize: pxTransform(28),
      selectedColor: '#4256DC',
    },
  } = props

  const [innerCurrent, setInnerCurrent] = useState(current)

  useEffect(() => {
    setInnerCurrent(current)
  }, [current])

  const toggleTypeHandler = (item: tabItem, index: number) => {
    if (onClick) {
      onClick(index)
    } else if (item.router) {
      Taro[`${item.type ? 'navigateTo' : 'switchTab'}`]({
        url: item.router,
      })
    } else {
      setInnerCurrent(index)
    }
  }

  let navStyle = typeof style === 'object' ? { ...style } : {}
  if (fixed)
    navStyle = Object.assign(navStyle, {
      paddingTop: navigationPaddingTop,
    })
  return (
    <View className={c('nav-tab', { 'nav-tab__fixed': fixed }, className)} style={navStyle}>
      <View className="nav-tab__switch">
        {tabList.map((item, index) => {
          let curIndex = item?.index || index
          return (
            <View
              key={index}
              onTouchStart={() => void toggleTypeHandler(item, curIndex)}
              className={c('nav-tab__switch-item', { active: innerCurrent === curIndex })}
              style={
                fixed
                  ? undefined
                  : {
                      ...customStyle,
                      fontWeight: 500,
                      color:
                        innerCurrent === curIndex
                          ? customStyle.selectedColor
                          : customStyle.color,
                    }
              }
            >
              {item.title}
              <View className={c({ [`nav-tab__switch-item--dot`]: item.new })}></View>
              {underLine && (
                <View
                  className={c({
                    'nav-tab__switch-underline': innerCurrent === curIndex,
                  })}
                ></View>
              )}
            </View>
          )
        })}
      </View>
    </View>
  )
}

export default CustomNavTab
