import { WebView } from '@tarojs/components'
import { eventCenter, getStorageSync, setNavigationBarTitle, useRouter } from '@tarojs/taro'
import { useCallback, useEffect, useMemo } from 'react'

import { APP_TOKEN_FLAG, UPLOAD_RESUME_ATTACHMENT_URL, UPLOAD_RESUME_URL } from '@/config'
import appStore from '@/store'

export enum UploadTypeEnum {
  RESUME = 'resume',
  ATTACHMENT = 'attachment',
}

export default function UploadWebview() {
  const { type } = useRouter<{ type: UploadTypeEnum }>().params
  const eventKey =
    type === UploadTypeEnum.ATTACHMENT ? 'resume-upload-attachment' : 'create-resume-upload'

  const timestamp = useMemo(() => +Date.now(), [])
  const userId = useMemo(() => appStore.getState().user?.id || 0, [])
  const tokenHeader = useMemo(() => encodeURIComponent(getStorageSync(APP_TOKEN_FLAG) || ''), [])
  const url = useMemo(
    () => (type === UploadTypeEnum.ATTACHMENT ? UPLOAD_RESUME_ATTACHMENT_URL : UPLOAD_RESUME_URL),
    [type]
  )

  const handleUploadResume = useCallback(
    event => {
      if (typeof event === 'object' && event.detail) {
        eventCenter.trigger(eventKey, event.detail.data[0])
      }
    },
    [eventKey]
  )

  useEffect(() => {
    setNavigationBarTitle({
      title: UploadTypeEnum.ATTACHMENT ? '附件简历' : '本地文件导入',
    })
    eventCenter.once(eventKey, handleUploadResume)

    return () => {
      eventCenter.off(eventKey, handleUploadResume)
    }
  }, [eventKey, handleUploadResume])

  return (
    <WebView
      key={timestamp}
      src={url + '?t=' + timestamp + '&auth=' + tokenHeader + '&userId=' + userId}
      onMessage={handleUploadResume}
    />
  )
}
