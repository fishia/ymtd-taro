import { useCallback } from 'react'

import { dispatchSetUnreadMessageCount, useAppSelector } from '@/store'
import { fetchRCAllUnreadCountApi } from '@/apis/message'

// 当前未读消息个数
export function useCurrentUnreadMessageCount(): number {
  return useAppSelector(root => root.message.unreadMessageCount || 0)
}

// 设置未读消息个数
export function useSetUnreadMessageCount(): Func1<number, void> {
  return count => void dispatchSetUnreadMessageCount(count)
}

// 减少未读消息数
export function useReduceUnreadMessageCount(): Func1<number, void> {
  const currentUnreadMessageCount = useCurrentUnreadMessageCount()

  return count => void dispatchSetUnreadMessageCount(Math.max(currentUnreadMessageCount - count, 0))
}

// 刷新当前未读消息个数
export function useRefreshUnreadMessageCount(): Func0<Promise<number>> {
  const setUnreadMessageCount = useSetUnreadMessageCount()
  const isRCLogined = useAppSelector(root => root.message.rcUserId)

  const refreshMsgCount = useCallback(async () => {
    if (!isRCLogined) {
      return 0
    }

    const count = await fetchRCAllUnreadCountApi()
    setUnreadMessageCount(count)

    return count
  }, [isRCLogined, setUnreadMessageCount])

  return refreshMsgCount
}
