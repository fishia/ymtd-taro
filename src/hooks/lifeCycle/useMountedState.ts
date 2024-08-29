import React from 'react'

/**
 * 获取挂载状态
 * @returns get 获取挂载状态 ()=> boolean
 */
const useMountedState = () => {
  const mountedRef = React.useRef(false)
  const get = React.useCallback(() => mountedRef.current, [])
  React.useEffect(() => {
    mountedRef.current = true
    return () => {
        mountedRef.current = false
    }
  }, [])
  return get
}

export default useMountedState
