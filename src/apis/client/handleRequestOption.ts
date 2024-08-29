import { getStorageSync } from '@tarojs/taro'
import { trimEnd } from 'lodash'

import { APP_TOKEN_FLAG, NEW_ONLINE_HOST, ONLINE_HOST, STATIC_HOST } from '@/config'
import { IRequestOption } from '@/def/client'
import { getOpenId } from '@/services/AccountService'

/** 处理 url，会自动切换 wx 与 api 域名前缀 */
export function handleUrl(urlInput: string = ''): string {
  const url = urlInput || ''

  if (url.startsWith('http') && url.endsWith('/')) {
    return trimEnd(url, '/')
  } else if (url.startsWith('http')) {
    return url
  }

  if (url.includes('/ymtd-')) {
    return NEW_ONLINE_HOST + url
  }

  return ONLINE_HOST + url
}

/** 处理静态资源的 url */
export function handleStaticUrl(urlInput: string = ''): string {
  const url = urlInput || ''

  if (url.startsWith('http') && url.endsWith('/')) {
    return trimEnd(url, '/')
  } else if (url.startsWith('http')) {
    return url
  }

  return STATIC_HOST + url
}

/** 处理请求的 Options */
export function handleRequestOption<T extends IRequestOption>(requestOption: T): T {
  const { url: originUrl, header: originHeader, ...restOptions } = requestOption

  const url = handleUrl(originUrl)

  // 处理 header
  // 这里允许使用 Authorization: null 来手动阻止 token 的发送
  const { Authorization, ...restHeaders } = (originHeader || {}) as any
  const header: any = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Platform: 3,
    openid: getOpenId(),
    ...restHeaders,
  }

  const tokenString = getStorageSync(APP_TOKEN_FLAG)
  if (Authorization) {
    header.Authorization = Authorization
  } else if (Authorization !== null && tokenString) {
    header.Authorization = getStorageSync(APP_TOKEN_FLAG)
  }

  return { url, header, ...restOptions } as T
}
