import useUpdate from '../lifeCycle/useUpdate'

import React from 'react'

/**
 * 定时器函数
 * @param fn 回调函数 Function
 * @param ms 延时毫秒数 number
 * @returns [isReady, clear, set]
 * isReady 当前定时器状态 ()=> boolean | null
 * 	-	false 正在执行 pending
 * 	- true 执行完毕 called
 * 	-	null 取消执行 cancelled
 * cancel 清除定时器函数 ()=> void
 * reset 设置/重置定时器函数 ()=> void
 */
export function useTimeoutFn(fn: (...args: any[]) => void, ms?: number) {
  if (ms === void 0) {
    ms = 0
  }

  // useRef返回的对象在整个生命周期保持不变，但是其保存的值.current可变，且可为任何值。
  const ready = React.useRef<boolean | null>(false)
  const timeout = React.useRef<NodeJS.Timeout>()
  const callback = React.useRef(fn)

  const isReady = React.useCallback(() => ready.current, [])

  // useCallback也称回调ref
  const reset = React.useCallback(() => {
    ready.current = false
    timeout.current && clearTimeout(timeout.current)
    timeout.current = setTimeout(() => {
      ready.current = true
      callback.current()
    }, ms)
  }, [ms])

  const cancel = React.useCallback(() => {
    ready.current = null
    timeout.current && clearTimeout(timeout.current)
  }, [])

  // 重置方法会取消原有的定时器
  React.useEffect(() => {
    callback.current = fn
  }, [fn])

  // 延迟改动重新计时，结束后取消定时器
  React.useEffect(() => {
    reset()
    return cancel
  }, [ms, reset, cancel])

  return [isReady, cancel, reset]
}

export default useTimeoutFn

/**
 * 延迟后强制更新组件
 * @param ms number 延迟毫秒数
 */
export function useTimeout(ms?: number) {
  if (ms === void 0) {
    ms = 0
  }
  const update = useUpdate()
  useTimeoutFn(update, ms)
}
