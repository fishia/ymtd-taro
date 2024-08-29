import { eventCenter, getStorageSync } from '@tarojs/taro'
import _ from 'lodash'

import { ILoginPopupProps, loginPopupEventKey } from '@/components/Popup/loginPopup'
import { NEW_LOGIN_POPUP_APPLY } from '@/config'
import dataRangers from '@/utils/dataRangers'

// 展示登录弹窗
export function showLoginPopup(pagePath: string, options?: ILoginPopupProps) {
  //实验参数曝光是异步，所以延迟执行弹窗
  // dataRangers.getVar('focusCallToActionEnable', false, res => {
  //   setTimeout(() => void eventCenter.trigger(pagePath + loginPopupEventKey, { ...options }), 10)
  // })

  setTimeout(() => {
    if (!getStorageSync(NEW_LOGIN_POPUP_APPLY)) {
      eventCenter.trigger(loginPopupEventKey, { ...options })
    }
  }, 300)
}

// 仅展示一次登录弹窗
export const onceShowLoginPopupForLaunch = _.once(showLoginPopup)
