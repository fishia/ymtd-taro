import { useCallback, useEffect } from 'react'
import { canIUse } from '@tarojs/taro'

export default function useAlertBeforeUnload() {
  // useEffect(() => {
  //   return () => {
  //     if (canIUse('disableAlertBeforeUnload')) {
  //       wx.disableAlertBeforeUnload()
  //     }
  //   }
  // }, [])

  const enableAlertBeforeUnload = useCallback((message: string) => {
    if (canIUse('enableAlertBeforeUnload')) {
      wx.enableAlertBeforeUnload({ message: message })
    }
  }, [])

  const disableAlertBeforeUnload = useCallback(() => {
    if (canIUse('disableAlertBeforeUnload')) {
      wx.disableAlertBeforeUnload()
    }
  }, [])

  return { enableAlertBeforeUnload, disableAlertBeforeUnload }
}
