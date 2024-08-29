import { useEffect, useRef } from 'react'

/**
 * 页面卸载回调函数，清空副作用
 * @param fn 副作用函数
 */
const useUnmount = (fn: (...args: any[]) => void) => {
  const fnRef = useRef(fn)
  const effect = () => () => fnRef.current()
  useEffect(effect, [])
}

export default useUnmount
