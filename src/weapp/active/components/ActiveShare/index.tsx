import { Button, Image, View } from '@tarojs/components'
import { useShareAppMessage } from '@tarojs/taro'
import React from 'react'

import Share from '../../assets/share.png'

import './index.scss'

interface IActiveShareProps {
  title?: string
  description?: string
}

const ActiveShare: React.FC<IActiveShareProps> = props => {
  const { title = '分享给你精彩的招聘双选会', description } = props

  useShareAppMessage(res => {
    return {
      title,
    }
  })
  return (
    <View className="active-share">
      <Button className="active-share__button" openType="share">
        <Image src={Share} className="active-share__img" />
      </Button>
    </View>
  )
}

export default ActiveShare
