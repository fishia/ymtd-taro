import { useEffect } from 'react'
import { eventCenter, useRouter } from '@tarojs/taro'

export const customTabItemTapEventKey = 'customTabItemTap'

const useCustomTabItemTap = (callback: Function) => {
  const router = useRouter()

  useEffect(() => {
    eventCenter.on(router.path + customTabItemTapEventKey, options => {
      callback && callback(options)
    })

    return () => void eventCenter.off(router.path + customTabItemTapEventKey)
  }, [callback, router.path])
}

export default useCustomTabItemTap
