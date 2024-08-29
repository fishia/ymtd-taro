import { setStorageSync, getStorageSync, getUserProfile } from '@tarojs/taro'
import _ from 'lodash'

import { fetchMarketWindowBgImage } from '@/apis/user'
import { SHARE_USER_INFO } from '@/config'
import { IBanner } from '@/def/job'

export * from './loginPopup'

// 获取对应类型对应 key 弹窗次数
export function getPopupOpenTimes(type: string, key: string = 'default'): number {
  return (getStorageSync(type) || {})[key] || 0
}

// 给对应类型弹窗对应 key 的次数增加 1
export function increasePopupOpenTimes(type: string, key: string = 'default'): void {
  const times = getPopupOpenTimes(type, key)
  setStorageSync(type, { ...getStorageSync(type), [key]: times + 1 })
}
// 获取昵称
export const getWechatInfo = async callback => {
  if (getStorageSync(SHARE_USER_INFO)) {
    callback()
    return Promise.resolve(getStorageSync(SHARE_USER_INFO))
  } else {
    getUserProfile({
      lang: 'zh_CN',
      desc: '获取您的信息以生成分享卡片',
    })
      .then(({ userInfo }) => {
        setStorageSync(SHARE_USER_INFO, userInfo)
        callback()
        return Promise.resolve(userInfo)
      })
      .catch(() => {
        callback()
        return Promise.reject()
      })
  }
}

// 获取营销弹窗背景（随机)
export const getMarketWindowBgImage = (): Promise<IBanner> => {
  return new Promise(async resolve => {
    try {
      await fetchMarketWindowBgImage()
        .then(res => resolve({ ...res }))
        .catch(_.noop)
    } catch (error) {
      return resolve({ image_url: '', id: 0, link_url: '', link_type: 0 })
    }
  })
}
