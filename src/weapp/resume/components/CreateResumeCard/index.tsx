import { View, Image } from '@tarojs/components'
import { FC } from 'react'

import arrowIcon from '@/assets/imgs/cell-arrow.png'
import ToastTips from '@/components/ToastTips'

import './index.scss'

interface IProps {
  onClick?: (e) => void
  titleImgSrc: string
  title: string
  isShowRecommend?: boolean
  isShowRedPoint?: boolean
  showToastTips?: boolean
  onClose?: (e) => void
}

const CreateResumeCard: FC<IProps> = props => {
  const {
    onClick,
    titleImgSrc,
    title,
    isShowRecommend = false,
    showToastTips = false,
    isShowRedPoint = false,
    onClose,
  } = props

  return (
    <View onClick={onClick} hoverClass="hover" className="create-resume__block-item">
      <ToastTips
        visible={showToastTips}
        onClose={onClose}
        className="create-resume__toastTips"
        content={
          <View className="create-resume__toastTips__content">
            <View className="create-resume__toastTips__text">
              只需讲一段话，即可帮你快速生成专业、丰富完整、受雇主青睐的优质在线简历，助你快速找到满意工作
            </View>
          </View>
        }
      />

      <Image src={titleImgSrc} className="create-resume__block-item__icon" mode="aspectFill" />
      <View className="create-resume__block-item__body">
        <View className="create-resume__block-item__title">{title}</View>
        {isShowRecommend && <View className="create-resume__block-item__recommend">推荐</View>}
        {isShowRedPoint && <View className="create-resume__block-item__red_point"></View>}
      </View>
      <Image src={arrowIcon} mode="aspectFill" className="create-resume__block-item__arrow" />
    </View>
  )
}

export default CreateResumeCard
