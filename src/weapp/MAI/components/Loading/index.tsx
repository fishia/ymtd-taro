import { FC } from 'react'
import { View } from '@tarojs/components'

import './index.scss'

const Loading: FC = () => {
  return (
    <View style="text-align: center">
      <View className="dots">
        <View className="dot1"></View>
        <View className="dot2"></View>
        <View className="dot3"></View>
      </View>
    </View>
  )
}

export default Loading
