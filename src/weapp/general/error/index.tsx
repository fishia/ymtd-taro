import { View, Image } from '@tarojs/components'
import { switchTab } from '@tarojs/taro'

import { STATIC_MP_IMAGE_HOST } from '@/config'

import './index.scss'

export interface IErrorProps {
  callback?: Function
}
// 通用页面Error
const Error: React.FC<IErrorProps> = ({ callback }) => {
  const handleClick = () => {
    switchTab({ url: '/weapp/pages/job/index' })
    callback && callback()
  }
  return (
    <View className="hd-error">
      <Image
        className="hd-error__image"
        src={STATIC_MP_IMAGE_HOST + 'error.png'}
        mode="scaleToFill"
      />
      <View className="hd-error__content">页面找不到了，请重试</View>
      <View className="hd-error__button" onClick={handleClick}>
        返回首页
      </View>
    </View>
  )
}

export default Error
