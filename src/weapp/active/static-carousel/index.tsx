import { Image, Swiper, SwiperItem, View } from '@tarojs/components'
import { FC, useEffect } from 'react'

import LoginButton from '@/components/LoginButton'
import MainLayout from '@/layout/MainLayout'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import './index.scss'

const sw1 = 'https://oss.yimaitongdao.com/mp/bannerDetail/bannerDetial1.jpg'
const sw2 = 'https://oss.yimaitongdao.com/mp/bannerDetail/bannerDetial2.jpg'
const sw3 = 'https://oss.yimaitongdao.com/mp/bannerDetail/bannerDetial3.jpg'

const Index: FC = () => {
  const prefixCls = 'ymtd-mp-static-carousel'
  const swList = [sw1, sw2, sw3]

  const point = () => {
    sendDataRangersEventWithUrl('register_and_login_click', {
      event_name: '注册登录引导',
      type: '活动页',
      first_visit_source: '首页banner',
      button_name: '登录',
    })
  }

  return (
    <MainLayout className={prefixCls}>
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
              <Image src={sw} mode="widthFix" />
            </View>
          </SwiperItem>
        ))}
      </Swiper>
      <View className={prefixCls + '-login'} onClick={point}>
        <LoginButton>登录</LoginButton>
      </View>
    </MainLayout>
  )
}

export default Index
