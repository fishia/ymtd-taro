declare module '*.png'
declare module '*.gif'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.svg'
declare module '*.css'
declare module '*.less'
declare module '*.scss'
declare module '*.sass'
declare module '*.styl'

declare namespace NodeJS {
  interface ProcessEnv {
    readonly TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'quickapp' | 'qq' | 'jd'
    readonly NODE_ENV: 'Do not use NODE_ENV, use ENV instead.'
    readonly ENV: 'development' | 'production'

    /** 是否开启火山埋点，注意生产环境必须开启，判断逻辑需写对 */
    readonly DEBUG_REPORT: 'on' | 'off'

    /** 是否打印 IM 消息 */
    readonly DEBUG_MESSAGE: 'on' | 'off'

    /** 是否打印全局状态 */
    readonly DEBUG_REDUX: 'on' | 'off'
  }
}

type Func0<R> = () => R
type Func1<T1, R> = (a1: T1) => R
type Func2<T1, T2, R> = (a1: T1, a2: T2) => R
type Func3<T1, T2, T3, R> = (a1: T1, a2: T2, a3: T3, ...args: any[]) => R

type Nullable<T> = T | null

type PropsType<T> = T[keyof T]
