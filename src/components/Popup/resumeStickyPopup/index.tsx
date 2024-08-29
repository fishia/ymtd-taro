import { View, Image } from '@tarojs/components'
import { getStorageSync, navigateTo } from '@tarojs/taro'
import c from 'classnames'
import React, { useImperativeHandle, useState } from 'react'

import { APP_TOKEN_FLAG, RESUME_STICKY_SERVICE_URL } from '@/config'
import appStore from '@/store'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'
import { jumpToWebviewPage } from '@/utils/utils'

import { PopupState } from '../index'

import './index.scss'

export interface ResumeStickyPopupState extends PopupState {
  content?: string
}

export const resumeStickyPopupEventKey = 'resumeStickyPopupEventKey'

export function onJumpStickyFn(skip?: boolean) {
  const profileTop = appStore.getState().user?.profileTop
  if (!skip && !profileTop) {
    navigateTo({
      url: '/weapp/active/resume-sticky/index',
    })

    return
  }

  const tokenString = getStorageSync(APP_TOKEN_FLAG)
  const paramStr = encodeURIComponent(JSON.stringify({ tokenString }))
  const url = `${RESUME_STICKY_SERVICE_URL}?parmas=${paramStr}`

  jumpToWebviewPage(url, '服务效果')
}

const ResumeStickyPopup = (p, ref) => {
  useImperativeHandle(ref, () => ({
    open,
    close,
  }))
  const [state, setState] = useState<ResumeStickyPopupState>({ isOpened: false })
  const { className, isOpened, onClose, onConfirm, overlayClickClose } = state

  const close = () => {
    onClose && onClose()
    setState({ isOpened: false })
  }

  const open = (props: ResumeStickyPopupState) => {
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

  const onClosePop = () => {
    close()
  }

  const onJumpResumeSticky = () => {
    sendDataRangersEventWithUrl('EventPopupClick', {
      event_name: '简历置顶服务',
      type: '弹窗',
    })

    navigateTo({ url: '/weapp/active/resume-sticky/index' })
  }

  return (
    <View
      className={c(className, 'hd-ResumeStickyPopup', {
        'hd-ResumeStickyPopup--active': isOpened,
      })}
    >
      <View className="hd-ResumeStickyPopup__overlay" onClick={overlayClickHandle} />
      <View className={c('hd-ResumeStickyPopup__container')} onClick={handleConfirm}>
        <View className={c('hd-ResumeStickyPopup__container__close')} onClick={onClosePop}></View>
        <Image
          onClick={onJumpResumeSticky}
          src="https://oss.yimaitongdao.com/mp/resumeSticky/resume-sticky-pop.png"
          className="hd-ResumeStickyPopup__image"
          mode="scaleToFill"
        />
      </View>
    </View>
  )
}

export default React.forwardRef(ResumeStickyPopup)
