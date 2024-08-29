import {
  getAccountInfoSync,
  getRealtimeLogManager,
  getStorageSync,
  getSystemInfoSync,
  RealtimeLogManager,
} from '@tarojs/taro'

import { APP_OPENID_KEY, APP_TOKEN_FLAG, IM_TOKEN_FLAG } from '@/config'
import appStore from '@/store'

/**
 * 上报微信小程序实时日志
 *
 * @param filters 该日志项附加的筛选标签
 * @returns 返回微信原生 logger 对象，可以调用 `.info()`、`.error()` 等来上报日志
 *
 * 文档：
 *   初始化 API：
 *     https://developers.weixin.qq.com/miniprogram/dev/api/base/debug/wx.getRealtimeLogManager.html
 *   实例 API：
 *     https://developers.weixin.qq.com/miniprogram/dev/api/base/debug/RealtimeLogManager.html
 *
 * 日志查看方法：
 *   登录小程序后台 > 左侧菜单【开发】/【开发管理】 > 实时日志
 */
export function reportLog(...filters: string[]): RealtimeLogManager {
  const logger = getRealtimeLogManager()

  logger.addFilterMsg(`uid:${appStore.getState().user?.id || ''}`)
  logger.addFilterMsg(`uname:${appStore.getState().user?.name || ''}`)
  logger.addFilterMsg(`phone:${appStore.getState().user?.phone || ''}`)
  logger.addFilterMsg(`openid:${getStorageSync(APP_OPENID_KEY) || ''}`)
  logger.addFilterMsg(`token:${getStorageSync(APP_TOKEN_FLAG) || ''}`)
  logger.addFilterMsg(`islogin:${Boolean(appStore.getState().user)}`)
  logger.addFilterMsg(`isiminit:${Boolean(getStorageSync(IM_TOKEN_FLAG))}`)
  logger.addFilterMsg(`platform:${getSystemInfoSync().platform}`)
  logger.addFilterMsg(`version:${getAccountInfoSync().miniProgram?.envVersion}`)

  filters.forEach(item => void logger.addFilterMsg(item))

  return logger
}
