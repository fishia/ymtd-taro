import React, { DependencyList } from 'react'
import useMountedState from '../lifeCycle/useMountedState'

export declare type PromiseType<P extends Promise<any>> = P extends Promise<infer T> ? T : never;
export declare type FunctionReturningPromise = (...args: any[]) => Promise<any>;

export declare type AsyncState<T> =
  | {
      loading: boolean
      error?: undefined
      value?: undefined
    }
  | {
      loading: true
      error?: Error | undefined
      value?: T
    }
  | {
      loading: false
      error: Error
      value?: undefined
    }
  | {
      loading: false
      error?: undefined
      value: T
    }
declare type StateFromFunctionReturningPromise<T extends FunctionReturningPromise> = AsyncState<
  PromiseType<ReturnType<T>>
>
export declare type AsyncFnReturn<T extends FunctionReturningPromise = FunctionReturningPromise> = [
  StateFromFunctionReturningPromise<T>,
  T
]

/**
 * 处理（async或promise）异步回调函数Fn
 * @param fn 异步回调函数
 * @param deps 依赖项
 * @param initialState 初始状态 {loading: false}
 * @returns [state,callback]
 * - state {loading,error}
 */
export function useAsyncFn<T extends FunctionReturningPromise>(
  fn: T,
  deps?: DependencyList,
  initialState?: StateFromFunctionReturningPromise<T>
): AsyncFnReturn<T> {
  if (deps === void 0) {
    deps = []
  }
  if (initialState === void 0) {
    initialState = { loading: false }
  }

  const lastCallId = React.useRef(0)
  const isMounted = useMountedState()
  const [state, setState] = React.useState(initialState)
  const callback = React.useCallback(function () {
    const args: any[] = []
    for (let i = 0; i < arguments.length; i++) {
      args[i] = arguments[i]
    }
    const callId = ++lastCallId.current
    setState(prevState => Object.assign({}, prevState, { loading: true }))
    return fn.apply(void 0, args).then(
      value => {
        isMounted() && callId === lastCallId.current && setState({ value, loading: false })
        return value
      },
      error => {
        isMounted() && callId === lastCallId.current && setState({ error, loading: false })
        return error
      }
    )
  }, deps)
  return [state, callback]
}

/**
 * 处理（async或promise）异步回调函数
 * @param fn 回调函数
 * @param deps 依赖项
 * @returns state
 */
export function useAsync(fn, deps) {
  if (deps === void 0) {
    deps = []
  }
  const [state, callback] = useAsyncFn(fn, deps, { loading: false })
  React.useEffect(() => {
    callback()
  }, [callback])
  return state
}
