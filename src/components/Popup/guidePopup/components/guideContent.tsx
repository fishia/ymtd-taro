import React from 'react'
import { View, Image } from '@tarojs/components'
import { GuidePopupState } from '../../index'

import './index.scss'

const GuidePopup: React.FC<GuidePopupState> = props => {
  const {
    arrowPhoto,
    arrowStyle = {},
    text,
    textStyle = {},
    buttonText = '知道了',
    buttonStyle = {},
    targetContent,
    targetContentStyle = {},
    onCancel
  } = props

  return (
    <View className="guide_popup">
      {
        arrowPhoto &&
        <View className="guide_popup__image" style={arrowStyle}>
          <Image src={arrowPhoto} />
        </View>
      }
      {
        text &&
        <View className="guide_popup__text" style={textStyle}>
          {text}
        </View>
      }
      {
        buttonText &&
        <View className="guide_popup__btn" onClick={onCancel} style={buttonStyle}>
          {buttonText}
        </View>
      }
      {
        targetContent ?
          <View className="guide_popup__targetContent" style={targetContentStyle}>
            {targetContent}
          </View> : null
      }
    </View>
  )
}

export default GuidePopup
