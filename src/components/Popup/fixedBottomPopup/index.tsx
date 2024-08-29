import { View, Button, Image, Swiper, SwiperItem, ITouchEvent } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import c from 'classnames'
import React, { useImperativeHandle, useState } from 'react'

import { PopupMode } from '@/def/common'
import { increasePopupOpenTimes } from '@/services/PopupService'
import { sendHongBaoEvent } from '@/utils/dataRangers'

import { FixedBottomPopupState } from '../index'

import './index.scss'

export const fixedBottomPopupEventKey = 'fixedBottomPopup'

export type IFixedBottomPopupProps = FixedBottomPopupState

const FixedBottomPopup = (p, ref) => {
  useImperativeHandle(ref, () => ({ open, close }))

  const [state, setState] = useState<FixedBottomPopupState>({ isOpened: false })
  const {
    showClear = true,
    title,
    description,
    confirmText,
    className,
    isOpened,
    onClose,
    route = '/weapp/general/error/index',
    bg_image,
    key,
    onConfirm = () => {
      navigateTo({ url: route })
    },
    closeIconStyle,
    children,
    carousel_images = [],
    current = 0,
    onChange,
    overlayClickClose = false,
    needRecordEvent = false,
  } = state
  const close = () => {
    //点击营销弹窗创建简历或关闭按钮时,is_mkt_raffle:1领红包，0关闭
    if (needRecordEvent) sendHongBaoEvent('MktPopupClick', { is_mkt_raffle: 0 })
    onClose && onClose()
    setState({ isOpened: false })
  }

  const open = (props: FixedBottomPopupState) => {
    if (props.needRecordEvent) sendHongBaoEvent('MktPopupExpose')
    const { key: timesKey } = props

    if (timesKey) {
      increasePopupOpenTimes(PopupMode.FIXEDBOTTOM_OPEN_TIMES, timesKey)
    }
    setState({ ...props, isOpened: true })
  }

  const handleConfirm = (e: ITouchEvent) => {
    e.stopPropagation()
    if (needRecordEvent) sendHongBaoEvent('MktPopupClick', { is_mkt_raffle: 1 })

    onConfirm && onConfirm()
    close()
  }

  const overlayClickHandle = () => {
    if (overlayClickClose) {
      close()
    }
  }

  return (
    <View
      className={c('hd-fixedbottompopup', className, { 'hd-fixedbottompopup--active': isOpened })}
    >
      <View
        onClick={overlayClickHandle}
        className={c('hd-fixedbottompopup__overlay', { maskpop: isOpened })}
      />
      <View className={c('hd-fixedbottompopup__container', { hd_trans: isOpened })}>
        {children ? (
          <View style={{ height: '100%' }}>{children}</View>
        ) : (
          <View style={{ height: '100%' }}>
            {bg_image && (
              <Image
                src={bg_image}
                className={c({ 'hd-fixedbottompopup__bg_image': isOpened })}
                mode="scaleToFill"
              />
            )}
            {title && <View className="hd-fixedbottompopup__title">{title}</View>}
            {description && <View className="hd-fixedbottompopup__desc">{description}</View>}
            {carousel_images.length ? (
              <Swiper
                className="hd-fixedbottompopup__swiper"
                indicatorColor="#ccc"
                indicatorActiveColor="#436EF3"
                indicatorDots
                previousMargin="85rpx"
                nextMargin="85rpx"
                autoplay={false}
                current={current}
                onChange={onChange}
              >
                {carousel_images.map((item, i) => (
                  <SwiperItem key={i}>
                    <Image
                      className="hd-fixedbottompopup__swiper-img"
                      src={item}
                      mode="scaleToFill"
                    />
                  </SwiperItem>
                ))}
              </Swiper>
            ) : null}
            {confirmText && (
              <View className="hd-fixedbottompopup__action">
                <Button
                  className={c('hd-fixedbottompopup__action-confirm', {
                    swiper_action: carousel_images.length,
                  })}
                  onClick={handleConfirm}
                >
                  {confirmText}
                </Button>
              </View>
            )}
          </View>
        )}
        {showClear && (
          <View
            className={c('hd-fixedbottompopup__close at-icon at-icon-close')}
            style={closeIconStyle}
            onClick={close}
          />
        )}
      </View>
    </View>
  )
}

export default React.forwardRef(FixedBottomPopup)
