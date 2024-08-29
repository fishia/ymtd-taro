import { View, Image } from '@tarojs/components'
import { FC, ReactNode } from 'react'
import c from 'classnames'
import './index.scss'

const prefixCls = 'landing-avatar'

export interface IAvatar {
  className?: string
  imgSrc: string
  icon?: ReactNode
}
const Avatar: FC<IAvatar> = props => {
  const { className, imgSrc, icon = null } = props
  return (
    <View className={c(prefixCls, className)}>
      <Image src={imgSrc} lazyLoad className={`${prefixCls}__img`} />
      {icon}
    </View>
  )
}

export default Avatar
