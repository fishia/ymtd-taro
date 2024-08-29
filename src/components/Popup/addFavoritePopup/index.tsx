import React, { useState, useImperativeHandle } from 'react'
import c from 'classnames'
import { View, Text, Image } from '@tarojs/components'

import { IProps } from '@/def/common'
import computedCapsulePos from './capsulePos'

import './index.scss'
import IconDot from '@/assets/imgs/icon-dot-dot-dot.png'
import closeIcon from '@/assets/imgs/icon-close.png'
import { pxTransform } from '@/utils/taroUtils'
import { useRouter } from '@tarojs/taro'

export const addFavoritePopupEventKey = 'addFavoritePopup'

export interface AddMyMiniAppTipsState extends IProps {
  showTips?: boolean
  arrowRight?: number
  tipsWrapRight?: number
  top?: number
}

const AddFavoritePopup = (_props, ref) => {
  const router = useRouter()
  useImperativeHandle(ref, () => ({ open, close }))

  const initState = { ...computedCapsulePos(router.path === '/weapp/pages/job/index'), showTips: false }

  const [state, setState] = useState<AddMyMiniAppTipsState>({ ...initState })
  const { className, showTips, arrowRight, tipsWrapRight, top = 0 } = state
  const open = (props: AddMyMiniAppTipsState) => {
    setState({ ...state, ...props, showTips: true })
  }

  const close = () => {
    setState({ ...initState })
  }

  return (
    <View
      className={c(className, 'hd-addMiniProgram-tips', {
        'hd-addMiniProgram-tips--active': showTips,
      })}
    >
      <View className="hd-addMiniProgram-tips__arrow" style={{
        right: `${arrowRight}px`,
        top: `calc(${top}px + ${pxTransform(-10)})`
      }}
      ></View>
      <View className="hd-addMiniProgram-tips__wrap" style={{
        right: `${tipsWrapRight}px`,
        top: `calc(${top}px + ${pxTransform(30)})`
      }}
      >
        <View className="hd-addMiniProgram-tips__text">
          <Text>点击</Text>
          <Image className="hd-addMiniProgram-tips__add-icon" src={IconDot} />
          <Text>添加到我的小程序, 微信首页下拉可直接进入医脉同道</Text>
        </View>
        <Image className="hd-addMiniProgram-tips__close" src={closeIcon} onClick={close} />
      </View>
    </View>
  )
}

export default React.forwardRef(AddFavoritePopup)
