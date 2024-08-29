import { WebView } from '@tarojs/components'
import { login, useRouter, useShareAppMessage } from '@tarojs/taro'
import React, { useEffect, useMemo, useRef } from 'react'

import { bindUnionIdAndUserIdApi } from '@/apis/user'
import { HR_SUBSCRIBE_PAGE_URL } from '@/config'
import { bestEmployerByToken } from '@/hooks/custom/usePopupData'

const B_BIND_WX_MODE_KEY = 'hrBindWx'

const Webview: React.FC = () => {
  const router = useRouter()
  const url = decodeURIComponent(router.params.url || '')
  const mode = decodeURIComponent(router.params.mode || '')
  const userId = decodeURIComponent(router.params.userId || '')

  const webViewUrl = useMemo(() => {
    if (mode === B_BIND_WX_MODE_KEY) {
      return HR_SUBSCRIBE_PAGE_URL
    } else if (url.includes('springWar/luckyDraw')) {
      // 如果包含token直接跳，不包含拼接token
      console.log(url.split('c-mini')[1] ? url : `${bestEmployerByToken(url)}`)
      return url.split('c-mini')[1] ? url : `${bestEmployerByToken(url)}`
    } else {
      return url
    }
  }, [])

  const shareInfoRef = useRef<any>(null)

  useEffect(() => {
    if (mode !== B_BIND_WX_MODE_KEY) {
      return
    }

    login()
      .then(loginResult => loginResult.code)
      .then(code => bindUnionIdAndUserIdApi(userId, code))
  }, [mode, userId])

  useShareAppMessage(() => ({ promise: Promise.resolve(shareInfoRef.current) } as any))

  const messageHandle = event => {
    if (typeof event === 'object') {
      const data = event.detail.data[0]
      console.log('data', data)
      shareInfoRef.current = data
    }
  }

  return <WebView src={webViewUrl} onMessage={messageHandle} />
}

export default Webview
