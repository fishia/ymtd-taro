import { Image, View } from '@tarojs/components'
import c from 'classnames'

import { IProps } from '@/def/common'
import { IProduct } from '@/def/job'

import './index.scss'

export interface IProductProps extends IProps, IProduct {
  onClick?: () => void
  isFlex?: boolean
}
export default function Product(props: IProductProps) {
  const { className, image: url, title: name, desc, onClick, isFlex = true } = props

  return (
    <View className={c('product', className, { noflex: !isFlex })} onClick={onClick}>
      <View className={c('product__left', { noflex__top: !isFlex })}>
        <Image className="product__image" src={url} mode="scaleToFill" />
      </View>
      <View className={c('product__right', { noflex__bottom: !isFlex })}>
        <View className="product__name">{name}</View>
        <View className="product__desc">{desc}</View>
      </View>
    </View>
  )
}
