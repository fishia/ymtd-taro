import { View, Image } from '@tarojs/components'
import { getMenuButtonBoundingClientRect, getSystemInfoSync, pxTransform } from '@tarojs/taro'
import c from 'classnames'
import React, { useMemo, forwardRef, useImperativeHandle, CSSProperties } from 'react'

import { IProps } from '@/def/common'
import { formatFloat } from '@/utils/utils'

import SearchBar from '../SearchBar'

import './index.scss'

export interface IJobNavigationProps extends IProps {
  isAnimation?: boolean
  navigationBarTitleText?: string
  navigationHeight?: number
  onClick?(): void
  scrollTop?: number
  headHeight?: number //与胶囊平齐的元素高度
  headMarginTop?: number //顶部导航距离屏幕顶端距离
  contentHeight?: number //内容高度
  maxAnimationDistance?: number //最大移动距离
  fixedHeight?: number //导航固定高度
  headStyle?: CSSProperties
  content?: string | React.ReactElement
  isLogined?: boolean
}
const systemInfo = getSystemInfoSync()
export const statusBarHeight = systemInfo?.statusBarHeight || 20

const navigationPaddingTop = statusBarHeight + 'px'

const capsuleRect = getMenuButtonBoundingClientRect()

const JobNavigation = (props: IJobNavigationProps, ref) => {
  const {
    className,
    navigationBarTitleText = '医脉同道',
    isAnimation,
    scrollTop = 0,
    headMarginTop = 10,
    maxAnimationDistance = 80,
    headHeight = 64,
    contentHeight = 120,
    fixedHeight = 100,
    headStyle = {},
    content,
    isLogined,
  } = props

  const opacity = formatFloat((scrollTop / maxAnimationDistance) * 0.8, 3) //透明度变化率
  const widthChangeDistance = formatFloat((scrollTop / maxAnimationDistance) * capsuleRect.width, 3) //宽度变化距离

  const [navigationHeight, actionHeight, titleMaxWidth] = useMemo(() => {
    if (isAnimation || scrollTop > contentHeight || opacity > 1) {
      return [
        `calc(${navigationPaddingTop} + ${pxTransform(fixedHeight)})`,
        pxTransform(fixedHeight),
        systemInfo.screenWidth - capsuleRect.width - 10,
      ]
    } else {
      return [
        `calc(${navigationPaddingTop} - ${pxTransform(scrollTop)} + ${pxTransform(
          headMarginTop + headHeight + contentHeight
        )})`,
        pxTransform(contentHeight - scrollTop),
        `calc(100% - ${pxTransform(widthChangeDistance)})`,
      ]
    }
  }, [
    isAnimation,
    scrollTop,
    contentHeight,
    opacity,
    headMarginTop,
    headHeight,
    widthChangeDistance,
  ])

  useImperativeHandle(ref, () => ({
    navigationHeight,
    actionHeight,
    maxAnimationDistance,
    headMarginTop,
    titleMaxWidth,
    contentHeight,
    headHeight,
  }))

  return (
    <View
      className={c(
        className,
        'job-navigation',
        { 'job-navigation__noLogin': !isLogined },
        { 'job-navigation__isLogined': isLogined || isAnimation }
      )}
      style={{ paddingTop: navigationPaddingTop, height: navigationHeight }}
    >
      {/*  {!isAnimation && (
        <View
          className="job-navigation__head"
          style={{
            height: pxTransform(headHeight),
            marginTop: pxTransform(headMarginTop),
            ...headStyle,
          }}
        >
          <View className="job-navigation__info">
            <View className="job-navigation__title" style={{ maxWidth: titleMaxWidth }}>
              {isLogined ? (
                navigationBarTitleText
              ) : (
                <Image className="job-navigation__noLogin__image" src={slogan} mode="scaleToFill" />
              )}
            </View>
          </View>
        </View>
      )} */}
      <View
        className={c(
          {
            'job-navigation__action': !isAnimation,
          },
          { 'job-navigation__action__sticky': isAnimation }
        )}
        style={{
          height: actionHeight,
          maxWidth: titleMaxWidth,
          top: capsuleRect.top,
          opacity: isAnimation ? 1 : formatFloat(1 - opacity, 3),
        }}
      >
        {content ? (
          content
        ) : (
          <SearchBar
            {...props}
            style={{ height: isAnimation ? capsuleRect.height : pxTransform(72) }}
          />
        )}
      </View>
    </View>
  )
}

export default forwardRef(JobNavigation)
