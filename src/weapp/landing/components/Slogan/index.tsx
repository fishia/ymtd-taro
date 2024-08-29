import { View } from '@tarojs/components'
import { FC } from 'react'
import c from 'classnames'
import './index.scss'

const prefixCls = 'landing-slogan'

export interface ISlogan {
  title: string
  subTitle: string
  className?: string
}
const Slogan: FC<ISlogan> = props => {
  const { title, subTitle, className } = props
  return (
    <View className={c(prefixCls, className)}>
      <View className={`${prefixCls}__number`}>{title}</View>
      <View className={`${prefixCls}__text`}>{subTitle}</View>
    </View>
  )
}

export default Slogan
