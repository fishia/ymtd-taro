import { View, Image, Text } from '@tarojs/components'
import React from 'react'

import './index.scss'

const GreetingNCard: React.FC = () => {
  return (
    <View className="greetingCard">
      <View className="title">Hi，我是专属你的AI管家</View>
      <View className="content">
        我可以为你快速 <Text className="w500">「生成优质的在线简历」</Text> ，
        让我先来为你介绍一下如何使用我又快又好的生成简历吧
      </View>
    </View>
  )
}

export default GreetingNCard
