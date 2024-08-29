import { toastEventKey, ToastState } from '@/layout/components/Toast'
import { useCallback } from 'react'
import { eventCenter, useRouter } from '@tarojs/taro'

const useToast = () => {
  const router = useRouter()

  const showToast = useCallback(
    (opts: ToastState) => {
      eventCenter.trigger(router.path + toastEventKey, opts)
    },
    [router.path]
  )

  return showToast
}

export default useToast
