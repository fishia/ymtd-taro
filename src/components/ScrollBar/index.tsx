import React, { useImperativeHandle, useState } from 'react'
import _ from 'lodash'

import { View, ScrollView } from '@tarojs/components'
import { AtActivityIndicator } from 'taro-ui'
import { IProps } from '@/def/common'

import './index.scss'

export interface IScrollBar extends IProps {
  down?: Function
  loadMore?: Function
  scroll?: Function
  lowerThreshold?: number
}

/**
 * 需要提供高度
 * @param props
 * @returns
 */
function ScrollBar(props: IScrollBar, ref: React.RefObject<{ top: number }>): ReturnType<React.FC> {
  const { down, lowerThreshold, loadMore = _.noop, scroll = _.noop, className, children } = props
  const [downDragStyle, setDownDragStyle] = useState({ height: '0px' })
  const [dargStyle, setDargStyle] = useState({ top: '0px' })
  const [downText, setDownText] = useState('下拉刷新')
  const [scrollY, setScrollY] = useState(true)
  const [dargState, setDargState] = useState(0) // 0不做操作 1刷新
  const [startP, setStartP] = useState<any>({})
  const [initTop, setInitTop] = useState(0)
  // 设置滚动高度
  useImperativeHandle(ref, () => ({
    top,
    setInitTop,
  }))

  // 记录已滚动的高度
  const [top, setTop] = useState(0)

  const touchmove = e => {
    //移动时的位置
    let move_p = e.touches[0],
      //左右偏移量(超过这个偏移量不执行下拉操作)
      deviationX = 0.3,
      deviationY = 56,
      //拉动长度（低于这个值的时候不执行）
      maxY = 80 //拉动的最大高度

    let start_x = startP.clientX,
      start_y = startP.clientY,
      move_x = move_p.clientX,
      move_y = move_p.clientY
    let dev = Math.abs(move_x - start_x) / Math.abs(move_y - start_y)
    if (top < 20 && dev < deviationX) {
      //当偏移数值大于设置的偏移数值时则不执行操作
      if (move_y - start_y > 0) {
        //下拉操作
        let pY = Math.abs(move_y - start_y) / 3.5 //拖动倍率
        if (pY >= deviationY) {
          setDargState(1)
          setDownText('释放刷新')
        } else {
          setDargState(0)
          setDownText('下拉刷新')
        }
        if (pY >= maxY) {
          pY = maxY
        }
        setDargStyle({ top: pY + 'px' })
        setDownDragStyle({ height: pY + 'px' })
        setScrollY(false)
      }
    }
  }
  const touchEnd = e => {
    if (dargState === 1) {
      _down()
    }
    reduction()
  }
  // 下拉刷新
  const _down = () => {
    down && down()
  }
  const reduction = () => {
    // 刷新之后重置
    setDargStyle({ top: '0px' })
    setDownDragStyle({ height: '0px' })
    setScrollY(true)
    setDargState(0)
    setDownText('下拉刷新')
  }
  const touchStart = e => {
    setStartP(e.touches[0])
  }
  const loadRecommend = () => {
    loadMore()
  }

  const handleScroll = e => {
    const { scrollTop } = e.detail
    setTop(scrollTop)
    // 执行滚动
    scroll(scrollTop)
  }

  return (
    <View className={['hd-scrollbar', className].join(' ')}>
      <View className="hd-scrollbar__drag" style={downDragStyle}>
        <AtActivityIndicator
          className="hd-scrollbar__text"
          content={downText}
        ></AtActivityIndicator>
      </View>
      {down ? (
        <ScrollView
          style={dargStyle}
          className="hd-scrollbar__wrap"
          scrollY={scrollY}
          lowerThreshold={lowerThreshold || 300}
          onScroll={handleScroll}
          onTouchMove={touchmove}
          onTouchEnd={touchEnd}
          onTouchStart={touchStart}
          onScrollToLower={() => loadRecommend()}
          scrollWithAnimation
        >
          {children}
        </ScrollView>
      ) : (
        <ScrollView
          style={dargStyle}
          className="hd-scrollbar__wrap"
          scrollY={scrollY}
          scrollTop={initTop}
          lowerThreshold={lowerThreshold || 800}
          onScroll={handleScroll}
          onScrollToLower={() => loadRecommend()}
          scrollWithAnimation
        >
          {children}
        </ScrollView>
      )}
    </View>
  )
}

export default React.forwardRef(ScrollBar)
