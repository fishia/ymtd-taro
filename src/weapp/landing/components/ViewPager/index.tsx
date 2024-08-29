import { Swiper, SwiperItem } from '@tarojs/components'
import { ComponentType, FC, ReactNode } from 'react'
import c from 'classnames'
import { SwiperItemProps } from '@tarojs/components/types/SwiperItem'
import './index.scss'

export interface IViewSwiper<T> {
  className?: string
  data?: T[]
  pageSize?: number
  renderItem?: () => ReactNode
  renderHandler?: (item: T, index: number) => ReactNode
}

export default function Viewpager<T>(props: IViewSwiper<T>): ReturnType<FC<IViewSwiper<T>>> {
  const prefixCls = 'common-viewPager'
  const { data = [], pageSize = 2, renderItem, renderHandler = () => null, className } = props

  const render = () => {
    if (renderItem) {
      return renderItem()
    }

    const groupData: T[][] = []
    for (let i = 0; i < data.length; i = i + pageSize) {
      groupData.push(data.slice(i, i + pageSize))
    }

    return groupData.reduce((acc: ReactNode[], cur, idx) => {
      const items = cur.reduce((item: ReactNode[], atom, index) => {
        item.push(renderHandler(atom, index))
        return item
      }, [])
      acc.push(<SwiperItem key={idx}>{items}</SwiperItem>)
      return acc
    }, [])
  }
  return (
    <Swiper
      className={c(prefixCls, className)}
      indicatorColor="#D8D8D8"
      indicatorActiveColor="#4773FF"
      vertical={false}
      indicatorDots
      interval={5000}
      autoplay
      circular
    >
      {render()}
    </Swiper>
  )
}
