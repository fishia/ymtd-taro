
import { View,Image } from '@tarojs/components'

import logoUrl from '@/assets/imgs/logo.png'
import './index.scss'

const Loading = () => {
  return <View className="page-loading">
    <Image src={logoUrl} className="page-loading__logo" mode="scaleToFill" />
    <View>加载中...</View>
  </View>
}

export default Loading
