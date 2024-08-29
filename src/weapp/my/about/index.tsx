import React from 'react'
import { makePhoneCall, navigateTo, previewImage } from '@tarojs/taro'
import { Image, View, Text } from '@tarojs/components'

import { EB_LICENSE_IMAGE_URL, HR_LICENSE_IMAGE_URL, YMTD_PHONE } from '@/config'
import useShowModal from '@/hooks/custom/useShowModal'
import MainLayout from '@/layout/MainLayout'
import Cell from '../components/Cell'

import './index.scss'

const AboutPage: React.FC = () => {
  const showModal = useShowModal()

  const navTo = (url: string) => () => void navigateTo({ url })

  const previewImageTo = (imgUrl: string): Func0<void> => () => {
    previewImage({ current: imgUrl, urls: [imgUrl] })
  }

  const contactClickHandler = () => void makePhoneCall({ phoneNumber: YMTD_PHONE })

  // const reportClickHandler = () =>
  //   void showModal({
  //     title: '投诉举报电话',
  //     content: (
  //       <Text>
  //         <Text style={{ marginRight: 20 }}>(010) 65090445</Text>
  //         <Text>(010) 65090445</Text>
  //       </Text>
  //     ),
  //     confirmText: '我知道了',
  //     noCancel: true,
  //   })

  return (
    <MainLayout navBarTitle="关于我们" className="about-us">
      <View className="about-us__head">
        <Image className="about-us__image" mode="aspectFit" src="https://oss.yimaitongdao.com/mp/common/logo-vertical.png" />
      </View>

      <Cell title="医脉同道用户协议" onClick={navTo('/weapp/general/protocol/index')} />
      <Cell title="个人信息保护政策" onClick={navTo('/weapp/general/protocol/index?current=1')} />
      <Cell title="人力资源许可证" onClick={previewImageTo(HR_LICENSE_IMAGE_URL)} />
      <Cell title="电子营业执照" onClick={previewImageTo(EB_LICENSE_IMAGE_URL)} />

      <Cell title="联系我们" onClick={contactClickHandler} style={{ marginTop: 10 }} />
      {/* <Cell title="投诉举报" onClick={reportClickHandler} /> */}
    </MainLayout>
  )
}

export default AboutPage
