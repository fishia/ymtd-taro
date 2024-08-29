import { getStorageSync, setStorageSync } from '@tarojs/taro'
import dayjs from 'dayjs'
import { isNumber } from 'lodash'

import { getPopupOpenTimes, increasePopupOpenTimes } from '@/services/PopupService'

// 未读消息提示
export const unreadMessageTips = 'unread-message-tips'
export const showGuideTips = 'show-guide-tips'

// 主动发起沟通提示
export const chatInitiativeTips = 'chat-initiative-tips'

// MAI创建简历
export const MAIcreateResumeTips = 'create-resume-tips'

// MAI简历弹窗
export const MAIResumeTool = 'create-resume-tool'

// MAI input提示
export const MAIInputTips = 'MAI-input-tips'

// 详情页返回上一页首次截停
export const stopJobDetailBackTips = "stop-job-detail-back-tips"

// MAI 春战tips
export const MAISpringWarTips = "MAI-spring-war-tips"

// MAI 职位榜单
export const MAIJobChoice = "MAI-job-choice"
// MAI SOHO简直
export const MAIJobSOHO = "MAI-job-SOHO"

const TodayFlag = dayjs().format('YYYY-MM-DD')

// 只展示一次：useOnce('key')
// 每天展示一次：useOnce('key', true)
// 前Number天每天展示一次：useOnce('key', Number)
//

/**
 *
 * @param key 唯一标识
 * @param daily true: 每天展示一次，number：前Number天每天展示一次
 * @param dailyExpose  number 每日最多曝光次数，暂未实现
 * @returns
 *  @callback needShow: 当前是否需要显示
 *  @
 */
export const useOnce = (key: string, daily?: boolean | number, dailyExpose?: number) => {
  let currentStorageValue: string = getStorageSync(key) || ''
  let currentExposeValue: string = getStorageSync(`${key}_expose`) || ''
  let needShow: boolean = !getStorageSync(key)
  let times: number

  if (daily) {
    needShow = getStorageSync(key) !== TodayFlag
  }

  if (isNumber(daily)) {
    const currentDay = currentStorageValue?.split('$')[0]
    times = Number(currentStorageValue?.split('$')[1]) || 0

    // 今天没弹过，并且弹过次数小于限制
    needShow = currentDay !== TodayFlag && times < daily
  }

  const clearCurrentExposeTips = () => {
    setStorageSync(`${key}_expose`, '')
  }

  const setCurrentTips = () => {
    let storageValue = daily ? TodayFlag : '1'

    if (isNumber(daily)) {
      storageValue = `${storageValue}$${times + 1}`
    }

    setStorageSync(key, storageValue)

    if (dailyExpose) {
      clearCurrentExposeTips()
    }
  }

  const clearCurrentTips = () => {
    setStorageSync(key, '')
  }

  const setExpose = () => {
    const currentExposeNum = Number(currentExposeValue || 0)
    const exposeNum = currentExposeNum + 1

    if (exposeNum >= (dailyExpose || 0)) {
      // 设置为已读，曝光设置为0
      setCurrentTips()

      return
    }

    setStorageSync(`${key}_expose`, String(exposeNum))
  }

  return {
    needShow,
    setCurrentTips,
    clearCurrentTips,
    setExpose,
  }
}

export const setOnceReguler = useOnce
export default useOnce
