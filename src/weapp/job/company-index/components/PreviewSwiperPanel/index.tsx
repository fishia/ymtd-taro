import { Image, Swiper, SwiperItem, View } from '@tarojs/components'
import c from 'classnames'
import React, { useEffect, useState } from 'react'

import { IProps } from '@/def/common'
import { IProduct } from '@/def/job'

import './index.scss'

export interface PreviewSwiperPanelProps extends IProps {
  data?: IProduct[]
  RowRender?: (item: IProduct, i: number) => React.ReactNode
  callback?: () => void
  currentIndex?: number //当前被点击的索引
  open?: boolean //是否打开
  maskClosable?: boolean //点击蒙层自动关闭
  closable?: boolean //是否显示关闭图标
  onClose?: () => void
  onSwiperChange?: (i: number) => void
}

const PreviewSwiperPanel: React.FC<PreviewSwiperPanelProps> = props => {
  const {
    data = [],
    className,
    maskClosable = false,
    closable = true,
    open = false,
    onClose,
    children,
    currentIndex = 0,
    RowRender,
    onSwiperChange,
  } = props

  const close = () => {
    //todo 埋点
    onClose && onClose()
  }
  const overlayClickHandle = () => {
    if (maskClosable) {
      close()
    }
  }

  const onChange = e => {
    onSwiperChange && onSwiperChange(e.detail.current)
  }
  return (
    <View className={c(className, 'previewSwiperPanel', { 'previewSwiperPanel--active': open })}>
      <View
        onClick={overlayClickHandle}
        className={c('previewSwiperPanel__overlay', { maskpop: open })}
      />
      <View className="previewSwiperPanel__container">
        {children ? (
          <View style={{ height: '100%' }}>{children}</View>
        ) : (
          <View style={{ height: '100%' }}>
            <Swiper
              className="previewSwiperPanel__swiper"
              autoplay={false}
              current={currentIndex}
              onChange={onChange}
            >
              {data.map((item, i) => (
                <SwiperItem key={i}>{RowRender && RowRender(item, i)}</SwiperItem>
              ))}
            </Swiper>
          </View>
        )}
      </View>
      <View className="previewSwiperPanel__order">{`${currentIndex + 1}/${data.length}`}</View>
      {closable && (
        <View
          className={c('previewSwiperPanel__close at-icon at-icon-chevron-left')}
          onClick={close}
        />
      )}
    </View>
  )
}

export default PreviewSwiperPanel
