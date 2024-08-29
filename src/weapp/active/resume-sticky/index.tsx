import { Image, Swiper, SwiperItem, View } from '@tarojs/components'
import { getStorageSync, makePhoneCall, requestPayment } from '@tarojs/taro'
import { FC, useEffect, useState } from 'react'
import log from 'simple-git/dist/src/lib/tasks/log'

import { fetchJsApiPrepayApi, fetchRSTIntroduceApi } from '@/apis/active-page'
import { updateUserIntentInfoApi } from '@/apis/resume'
import { onJumpStickyFn } from '@/components/Popup/resumeStickyPopup'
import { APP_TOKEN_FLAG, RESUME_STICKY_AGREEMENT_URL, RESUME_STICKY_SERVICE_URL } from '@/config'
import { IResumeStickyTop } from '@/def/active'
import { sendDataRangersEvent } from '@/utils/dataRangers'
import { reportLog } from '@/utils/reportLog'
import { jumpToWebviewPage } from '@/utils/utils'

import './index.scss'

const sw1 = 'https://oss.yimaitongdao.com/mp/resumeSticky/sw1.png'
const sw2 = 'https://oss.yimaitongdao.com/mp/resumeSticky/sw2.png'
const sw3 = 'https://oss.yimaitongdao.com/mp/resumeSticky/sw3.png'
const JLZD = 'https://oss.yimaitongdao.com/mp/resumeSticky/JLZD.png'
const YHPJ = 'https://oss.yimaitongdao.com/mp/resumeSticky/YHPJ2.png'

export interface IResumeStickyTopEffectItem {
  date: string
  exposeNum: number
}

// 简历置顶 效果数据
export interface IResumeStickyTopEffect {
  startDate: string
  endDate: string
  /**
   * 订单号
   */
  tradeNo: string
  /**
   * 近14天简历曝光数据集合
   */
  exposeList: IResumeStickyTopEffectItem[]
}

const Index: FC = () => {
  const prefixCls = 'ymtd-resumeSticky'
  const swList = [sw1, sw2, sw3]
  const [productInfo, setProductInfo] = useState<IResumeStickyTop>()
  /**
   * 立即购买
   * 1、调用接口获取支付参数
   * 2、去支付
   */
  const buy = (buttonName: string) => {
    sendDataRangersEvent('EventPopupClick', {
      event_name: '简历置顶服务',
      type: '其他',
      button_name: buttonName,
    })

    fetchJsApiPrepayApi().then(payParams => {
      const { packageVal, ...others } = payParams || {}

      requestPayment({
        ...others,
        package: packageVal,
        success: () => {
          onJumpStickyFn(true)
        },
        fail: err => {
          console.log(err)
          reportLog('core', 'pay').error('支付失败 [handleApply]:', err)
        },
        complete: res => {
          console.log(res)
        },
      })
    })
  }

  const transAmount = (num?: number | string) => {
    if (num || num === 0) {
      return (Number(num) / 100).toFixed(2)
    } else {
      return '--'
    }
  }

  useEffect(() => {
    sendDataRangersEvent('EventExpose', {
      event_name: '简历置顶服务',
      type: '其他',
    })

    fetchRSTIntroduceApi().then(data => {
      data.amount = transAmount(data.amount)
      data.amountPerDay = transAmount(data.amountPerDay)
      data.originalAmount = transAmount(data.originalAmount)

      if (data) {
        setProductInfo(data)
      }
    })
  }, [])

  const onJumpWebView = () => {
    jumpToWebviewPage(RESUME_STICKY_AGREEMENT_URL, '简历置顶服务协议')
  }

  const hasDiscount = !!productInfo?.isDiscount

  return (
    <View className={prefixCls}>
      <View className="top-left"></View>
      <View className="top-right"></View>
      <View className="top-info">
        <Image src={JLZD} className="JLZD" />
        <View className="info-1">
          <View className="info-1-span">快人一步，优先被HR看见</View>
        </View>
        <View className="info-2">
          已有<View className="enf">{productInfo?.joinPersonCount}</View>
          位求职者购买简历置顶服务,并快速找到工作
        </View>
      </View>
      <Swiper
        className={prefixCls + '-sw'}
        autoplay
        interval={5000}
        indicatorDots
        indicatorColor="#FFFFFF"
        indicatorActiveColor="#FCD9B5"
        circular
      >
        {swList.map((sw, index) => (
          <SwiperItem key={index}>
            <View className="swItem">
              <Image src={sw} />
            </View>
          </SwiperItem>
        ))}
      </Swiper>
      <View
        className={prefixCls + '-floor wrapper'}
        onClick={() => {
          buy('7天置顶')
        }}
      >
        <View className="product-info">
          <View className="info-1">
            你最近7天简历曝光次数为{productInfo?.profileExposeCount}次, 低于
            <View className="highlight" style={{ fontSize: 'inherit' }}>
              {productInfo?.relativePercent}
            </View>
            的同行
          </View>
          <View className="info-2">
            开通简历置顶提升曝光，
            {hasDiscount ? (
              <>
                享限时
                <View className="highlight" style={{ fontSize: 'inherit', fontWeight: 500 }}>
                  {productInfo?.discount}折
                </View>
                优惠
              </>
            ) : (
              '求职快人一步'
            )}
          </View>
          <View className="info-detail">
            {hasDiscount && <View className="info-detail-tag">限时{productInfo?.discount}折</View>}
            <View className="info-detail-left">
              <View className="desc-1">7天置顶</View>
              <View className="desc-2">连续置顶，3倍曝光</View>
            </View>
            <View className="info-detail-right">
              <View className="sale-price">
                钜惠价:<View className="highlight">{productInfo?.amount || '--'}</View>元
              </View>
              {hasDiscount && (
                <View className="ori-price">原价:{productInfo?.originalAmount || '--'}元</View>
              )}
            </View>
          </View>
        </View>
      </View>
      <View className={prefixCls + '-floor'}>
        <Image src={YHPJ} />
      </View>
      <View className={prefixCls + '-floor'}>
        <View className="service-title">服务说明</View>
        <View className="service-info">
          购买完成后，置顶权益立即生效，根据购买时间，按照套餐天数*24小时进行置顶有效时间统计。{' '}
        </View>
        <View className="service-info">
          如支付遇到问题，请联系：
          <View
            className="service-info-link"
            onClick={() => {
              makePhoneCall({
                phoneNumber: '0512-62626030', //仅为示例，并非真实的电话号码
              })
            }}
          >
            0512-62626030
          </View>
        </View>
        <View className="service-info">
          支付即代表您同意
          <View className="service-info-link" onClick={onJumpWebView}>
            《简历置顶服务协议》
          </View>
        </View>
      </View>
      <View className={prefixCls + '-bottom'}>
        <View
          className={prefixCls + '-bottom-cont'}
          onClick={() => {
            buy('立即购买')
          }}
        >
          <View className="buy-info">
            <View className="price-tag">仅需{productInfo?.amountPerDay || '--'}元/天</View>
            <View className="sale-price">
              钜惠价:
              <View className="highlight">{productInfo?.amount || '--'}</View>元
            </View>
            {hasDiscount && (
              <View className="old-price">
                <View className="discount-tag">{productInfo?.discountName}</View>
                <View className="ori-price">原价:{productInfo?.originalAmount || '--'}元</View>
              </View>
            )}
          </View>
          <View className="buy-btn">立即购买</View>
        </View>
      </View>
    </View>
  )
}

export default Index
