import { View, Image } from '@tarojs/components'
import { navigateTo, useRouter, eventCenter } from '@tarojs/taro'
import classNames from 'classnames'
import { useEffect, useState } from 'react'

import { defaultUserInfo } from '@/def/user'
import useOnce from '@/hooks/custom/useOnce'
import { useCurrentUserInfo, useIsLogin } from '@/hooks/custom/useUser'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import { onJumpStickyFn } from '../Popup/resumeStickyPopup'

import './index.scss'

interface IResumeStickyAdProps {
  adKey?: string
  className?: string
}

const ResumeStickyAd = (props: IResumeStickyAdProps) => {
  const { adKey, className = '' } = props || {}
  const router = useRouter()
  const onceAdKey = adKey || `${router.path}.sticky.ad`

  const { needShow, setCurrentTips } = useOnce(onceAdKey, true)
  const [isClose, setIsClose] = useState<boolean>(false)
  const isLoginedState = useIsLogin()
  const userInfo = useCurrentUserInfo() || defaultUserInfo
  const [isShow, setIsShow] = useState<boolean>(false)
  const onCloseAd = () => {
    !isLoginedState && eventCenter.trigger('isShowResumeStickyAdKey', false)
    setIsClose(true)
    setCurrentTips()
  }

  useEffect(() => {
    if (
      !needShow ||
      !isLoginedState ||
      !userInfo.profileTopADExpose ||
      userInfo.profileTop ||
      isClose
    ) {
      !isLoginedState && eventCenter.trigger('isShowResumeStickyAdKey', false)
      setIsShow(false)
      return
    }
    !isLoginedState && eventCenter.trigger('isShowResumeStickyAdKey', true)

    sendDataRangersEventWithUrl('EventExpose', {
      event_name: '简历置顶高效求职',
      type: '广告卡片',
    })

    setIsShow(true)
  }, [isClose])

  const onClickAd = () => {
    sendDataRangersEventWithUrl('EventPopupClick', {
      event_name: '简历置顶高效求职',
      type: '广告卡片',
    })

    onJumpStickyFn()
  }

  if (!isShow) {
    return null
  }

  return (
    <View className={classNames('hd-resume-sticky-ad', className)}>
      <View className="hd-resume-sticky-ad__close" onClick={onCloseAd}></View>
      <Image
        src="https://oss.yimaitongdao.com/mp/resumeSticky/resume-sticky-top-ad.png"
        className="hd-resume-sticky-ad__img"
        mode="scaleToFill"
        onClick={onClickAd}
      />
    </View>
  )
}

export default ResumeStickyAd
