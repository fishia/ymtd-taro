import { View, Image } from '@tarojs/components'
import c from 'classnames'
import React from 'react'

import { IProps } from '@/def/common'

import happyImg from '../../../components/NoPickerList/happy.svg'

import './index.scss'

export interface CustomKeywordButtonProps extends IProps {
  url?: string
  tipsText?: string
  content?: string | React.ReactElement
  isShowImg?: boolean
}

const CustomModalContent: React.FC<CustomKeywordButtonProps> = props => {
  const {
    url = happyImg,
    tipsText = '添加职位关键词，不超过6个字',
    isShowImg = true,
    className,
    content,
  } = props
  return (
    <View className={c('custom-modal-content', className)}>
      {isShowImg ? (
        <Image src={url} className="custom-modal-content__image" mode="scaleToFill" />
      ) : null}

      <View className="custom-modal-content__text">{tipsText}</View>
      {content}
    </View>
  )
}

export default CustomModalContent
