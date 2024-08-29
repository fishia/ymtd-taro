import { View } from '@tarojs/components'

import { IProps } from '@/def/common'
import { IBanner } from '@/def/job'
import SwiperBar from '@/weapp/pages/job/components/SwiperBar'

import './index.scss'

export interface IActiveBanner extends IProps {
  swiperItem?: IBanner[]
}

const prefixCls = 'active-banner'
const ActiveBanner: React.FC<IActiveBanner> = props => {
  const { swiperItem = [], className } = props
  return (
    <View className={`${prefixCls} ${className}`}>
      {swiperItem.length > 0 ? <SwiperBar items={swiperItem} /> : null}
    </View>
  )
}

export default ActiveBanner
