import _ from 'lodash'
import { eventCenter, getStorageSync, setStorageSync } from '@tarojs/taro'

import { IM_FIRST_LAUNCH_KEY } from '@/config'
import { IMConnectSuccessEvent } from '@/def/message'
import appStore from '@/store'
import { getIMConnectStatus, initConversations, refreshUnreadMessageCount } from '.'

// IM 初始化完成后的动作
const IMFirstLaunched = () => {
  refreshUnreadMessageCount()
  initConversations()
}

// 已防抖地设置融云初次初始化状态
const debouncedSetIMFirstLaunched = _.debounce(() => {
  setStorageSync(IM_FIRST_LAUNCH_KEY, appStore.getState().message.rcUserId)

  if (getIMConnectStatus()) {
    IMFirstLaunched()
  } else {
    eventCenter.once(IMConnectSuccessEvent, IMFirstLaunched)
  }
}, 600)

// IM 是否初始化过
export function isIMLaunched(): boolean {
  return getStorageSync(IM_FIRST_LAUNCH_KEY) === appStore.getState().message.rcUserId
}

// 执行并返回 IM 初始化流程的完成状态
export function runIMFirstLaunchedDone(): boolean {
  const isLaunched = isIMLaunched()
  if (!isLaunched) {
    debouncedSetIMFirstLaunched()
  }

  return isLaunched
}
