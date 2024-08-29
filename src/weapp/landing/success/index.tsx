import { View, Image } from '@tarojs/components'
import './index.scss'
import { setClipboardData } from '@tarojs/taro'
import { YMTD_HR_URL } from '@/config'

const StopPage: React.FC = () => {
  const prefixCls = 'stopPage'

  const copyHandler = () => {
    setClipboardData({ data: YMTD_HR_URL })
  }

  return (
    <View className={`${prefixCls}`}>
      <Image src={require('../imgs/stopPage.png')} className={`${prefixCls}__image`} />
      <View className={`${prefixCls}__text`}>请在电脑端访问</View>
      <View className={`${prefixCls}__text--link`}>{YMTD_HR_URL}</View>
      <View className={`${prefixCls}__text`}>继续招聘旅程</View>
      <View className={`${prefixCls}__button`} onClick={copyHandler}>
        复制网址
      </View>
    </View>
  )
}

export default StopPage
