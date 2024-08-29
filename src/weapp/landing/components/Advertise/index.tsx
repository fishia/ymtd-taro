import { View, Image } from '@tarojs/components'
import { FC, ReactNode } from 'react'
import c from 'classnames'
import './index.scss'
import logoWhite from '@/assets/imgs/logoWhite.svg'
import human from '@/assets/imgs/human.png'

export interface IAdvertise {
  className?: string
  children?: ReactNode
}
const Advertise: FC<IAdvertise> = props => {
  const prefixCls = 'landing-top'

  const { className, children = null } = props
  return (
    <View className={c(prefixCls, className)}>
      <View className={`${prefixCls}__mask`}>
        <View className={`${prefixCls}__logo`}>
          <Image className={`${prefixCls}__img`} src={logoWhite} />
          <View className={`${prefixCls}__title`}>医药人跳槽</View>
        </View>
        <View className={`${prefixCls}__banner`}>上医脉同道</View>
        <View className={`${prefixCls}__subtitle`}>
          <Image className={`${prefixCls}__human`} src={human} />
          <View className={`${prefixCls}__itemBlock`}>{children}</View>
        </View>
      </View>
    </View>
  )
}

export default Advertise
