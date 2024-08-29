import { View, Image } from '@tarojs/components'
import c from 'classnames'
import React, { useImperativeHandle, useState } from 'react'

import { OSS_STATIC_HOST } from '@/config'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import { PopupState } from '../index'

import './index.scss'

export const refuelPackagePopupEventKey = 'refuelPackagePopup'

export enum AwardsTypeEnum {
  TOP = '1', // 简历置顶
  NORMAL = '2', // 伴手礼
  GENERNAL = '3', // 阳光普照
}
export interface RefuelPackagePopupState extends PopupState {
  content?: string
  level?: AwardsTypeEnum
}

const AwardsTypeEnumData = {
  [AwardsTypeEnum.TOP]: '品牌雇主招聘季_中奖简历置顶',
  [AwardsTypeEnum.NORMAL]: '品牌雇主招聘季_中奖伴手礼',
  [AwardsTypeEnum.GENERNAL]: '品牌雇主招聘季_未中奖',
}

const RefuelPackagePopup = (p, ref) => {
  const { level = 3 } = p
  useImperativeHandle(ref, () => ({
    open,
    close,
  }))
  const [state, setState] = useState<RefuelPackagePopupState>({ isOpened: false })
  const { className, isOpened, onClose, onConfirm, overlayClickClose } = state

  const close = () => {
    onClose && onClose()
    setState({ isOpened: false })
  }

  const open = (props: RefuelPackagePopupState) => {
    sendDataRangersEventWithUrl('EventExpose', {
      event_name: AwardsTypeEnumData[level],
    })
    setState({ ...props, isOpened: true })
  }

  const handleConfirm = () => {
    onConfirm && onConfirm()
    setState({ isOpened: false })
  }

  const overlayClickHandle = () => {
    if (overlayClickClose) {
      close()
    }
  }

  return (
    <View
      className={c(className, 'hd-RefuelPackagePopup', {
        'hd-RefuelPackagePopup--active': isOpened,
      })}
    >
      <View className="hd-RefuelPackagePopup__overlay" onClick={overlayClickHandle} />
      <View className={c('hd-RefuelPackagePopup__container')} onClick={handleConfirm}>
        <Image
          src={OSS_STATIC_HOST + `/mp/activity/refuelPackage${level}.png`}
          className="hd-RefuelPackagePopup__image"
          mode="scaleToFill"
        />
      </View>
    </View>
  )
}

export default React.forwardRef(RefuelPackagePopup)
