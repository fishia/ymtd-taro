import React from 'react'
import c from 'classnames'
import { makePhoneCall, previewImage } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'

import { EB_LICENSE_IMAGE_URL, HR_LICENSE_IMAGE_URL } from '@/config'
import { IProps } from '@/def/common'

import './index.scss'

export interface ILicenseProps extends IProps { }

const License: React.FC<ILicenseProps> = props => {
  const { className, style } = props

  const showLicense = (imgUrl: string): Func0<void> => () => {
    previewImage({ current: imgUrl, urls: [imgUrl] })
  }

  const onCallByPhone = () => {
    makePhoneCall({
      phoneNumber: '0512-62626030'
    })
  }

  return (
    <View className={c('my-index__license', className)} style={style}>
      <View className="my-index__license__line">
        <Text onClick={showLicense(EB_LICENSE_IMAGE_URL)}>电子营业执照</Text>
        <Text className="my-index__license__split">|</Text>
        <Text onClick={showLicense(HR_LICENSE_IMAGE_URL)}>人力资源服务许可证</Text>
      </View>
      <View className="my-index__license__line" onClick={onCallByPhone}>
        <Text>平台联系方式：
          <Text className="my-index__license__line__link">
            0512-62626030
          </Text>
          （9:00~18:00）</Text>
      </View>
      {/* <View className="my-index__license__line">
        <Text>投诉举报电话：(010)57596212，(010)65090445</Text>
      </View> */}
    </View>
  )
}

export default License
