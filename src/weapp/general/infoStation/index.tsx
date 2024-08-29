import { Button, Image } from '@tarojs/components'
import { login } from '@tarojs/taro'
import c from 'classnames'
import { useEffect, useMemo, useRef, useState } from 'react'

import { fetchAddComQrCode, fetchComQrCode } from '@/apis/award'
import { YMTD_OSS_STATIC_HOST } from '@/config'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import { useIsLogin, useWxLogin } from '@/hooks/custom/useUser'
import MainLayout from '@/layout/MainLayout'
import { refreshUserInfo } from '@/services/AccountService'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import './index.scss'

const InfoStation = () => {
  const routerParams = useRouterParam()
  const syncSoho = routerParams.syncSoho || '' // 同步禾蛙
  const [code, setCode] = useState('')
  const [syncStatus, setSyncStatus] = useState(false)
  const isLogin = useIsLogin()
  const wxCodeRef = useRef('')
  const wxLogin = useWxLogin()
  const platform = routerParams.platform || ''
  const path = routerParams.path || ''

  const oss = `${YMTD_OSS_STATIC_HOST}/mp/common`

  useEffect(() => {
    sendDataRangersEventWithUrl('EventPopupExpose', {
      event_name: '小程序添加企微页',
    })
    if (path) {
      fetchComQrCode(path)
        .then(res => {
          setCode(res.value)
        })
        .catch()
    }
  }, [path])

  useEffect(() => {
    if (isLogin)
      fetchAddComQrCode()
        .then(res => setCode(res.qrCodeUrl))
        .catch()
  }, [isLogin])

  const InfoStationBg = useMemo(() => {
    let commonLink = `${oss}/infoStation`
    // b端跳转过来的不需要登录，直接展示path,没有path取默认的（春战B端情报站)
    if (platform) return path ? `${oss}/${path}.png` : `${commonLink}_b.png`
    // c端过来的如果带有path就需要拼接path，可兼容未来多种加企微落地页UI
    else return `${path ? `${commonLink}_${path}` : commonLink}${isLogin ? '' : '_visitor'}.png`
  }, [platform, isLogin])

  const getAndSetWxCode = () => {
    if (isLogin) return
    login().then(res => {
      wxCodeRef.current = res.code
    })
  }

  // 默认授权手机号登录
  const handleConfirm = (e: any) => {
    if (e?.detail?.encryptedData) {
      wxLogin(wxCodeRef.current, e.detail.encryptedData, e.detail.iv, refreshUserInfo).then(res => {
        if (syncSoho) {
          // todo soho禾蛙联动
          setSyncStatus(true)
        }
      })
    }
  }

  // 展示获取二维码的按钮 1、默认：非b端过来的且未登录 2、带禾蛙同步标志：同步状态为未导流到禾蛙
  const showGetCodeBtn = useMemo(() => {
    if (syncSoho) return syncStatus
    else return !platform && !isLogin
  }, [platform, isLogin, syncSoho, syncStatus])

  // 展示企微，不展示“获取二维码”按钮或者B端过来且有path路径
  const showWeChatCode = useMemo(() => {
    return !showGetCodeBtn || (platform && path)
  }, [showGetCodeBtn, platform, path])

  return (
    <MainLayout className="hd-infoStation">
      <Image
        onLongPress={() => {
          sendDataRangersEventWithUrl('EventPopupExpose', {
            event_name: '长按后识别添加企微弹窗',
          })
        }}
        className="hd-infoStation__image"
        src={InfoStationBg}
        mode="scaleToFill"
        showMenuByLongpress
      />
      {showWeChatCode ? (
        <Image
          className={c('hd-infoStation__qrCode', {
            'hd-infoStation__inviteCode': platform && path,
          })}
          src={code}
          mode="scaleToFill"
          showMenuByLongpress
        />
      ) : null}
      {showGetCodeBtn ? (
        <Button
          openType={isLogin ? '' : 'getPhoneNumber'}
          onGetPhoneNumber={handleConfirm}
          onClick={getAndSetWxCode}
        >
          点击获取二维码
        </Button>
      ) : null}
    </MainLayout>
  )
}

export default InfoStation
