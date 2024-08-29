import React from 'react'
import { navigateTo } from '@tarojs/taro'
import { ITouchEvent, View, Image } from '@tarojs/components'
import { PopupState } from '../index'
import './index.scss'

const JobCardAdsCard: React.FC<PopupState> = (props) => {
  const {
    bg_image = require('@/assets/imgs/popup/ads_createResume.png'),
    route = '/weapp/general/error/index',
    confirmText = '立即跳转',
    onConfirm = () => {
      navigateTo({ url: route })
    }
  } = props
  const handleConfirm = (e:ITouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onConfirm && onConfirm()
  }

  return (
    <View className="job_ads_card" onClick={handleConfirm}>
      {bg_image && (
        <Image
          src={bg_image}
          className="job_ads_card__bg_image"
          mode="scaleToFill"
        />
      )}
      <View className="job_ads_card-confirm" >{confirmText}</View>
    </View>
  )
}

export default JobCardAdsCard;
