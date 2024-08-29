import { useCallback, useMemo } from 'react'
import { eventCenter, useRouter } from '@tarojs/taro'

import { loadingStatusEventKey, ILoadingStatusOpenProps } from '@/layout/components/LoadingStatus'

export default function useShowLoadingStatus(): {
  showLoadingStatus(options?: ILoadingStatusOpenProps): void
  hideLoadingStatus(): void
} {
  const router = useRouter()

  const showLoadingStatus = useCallback(
    (options?: ILoadingStatusOpenProps) => {
      eventCenter.trigger(router.path + loadingStatusEventKey, options)
    },
    [router.path]
  )

  const hideLoadingStatus = useCallback(() => {
    eventCenter.trigger(router.path + loadingStatusEventKey, {}, 'close')
  }, [router.path])

  return useMemo(() => ({ showLoadingStatus, hideLoadingStatus }), [
    hideLoadingStatus,
    showLoadingStatus,
  ])
}
