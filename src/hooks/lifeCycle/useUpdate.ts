import { useReducer } from 'react'

const updateReducer = (num: number) => (num + 1) % 1000000

/**
 * 强制更新组件
 * @returns dispatch
 */
const useUpdate = () => {
  const reducer = useReducer(updateReducer, 0)
  const update = reducer[1]
  return update
}

export default useUpdate
