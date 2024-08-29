import { useCallback } from 'react'
import { getStorageSync, hideKeyboard, requestSubscribeMessage, setStorage } from '@tarojs/taro'
import dayjs from 'dayjs'

import {
  IM_LAST_NOTICE_SUBSCRIBE_TIME_STORAGE_KEY,
  LAST_CLOSE_NOTICE_SUBSCRIBE_TIME_STORAGE_KEY,
  SUBSCRIBE_CHAT_MESSAGE_TEMPLATE_ID,
  SUBSCRIBE_TEMPLATE_ID,
} from '@/config'
import { dispatchSetIsFollowWx, useAppSelector } from '@/store'
import { subscribeApplyJobNoticeApi } from '@/apis/job'
import {
  fetchIsFollowWxApi,
  fetchMessageNoticeRestTimes,
  subscribeMessageNotice,
} from '@/apis/message'
import { useIsLogin } from '../custom/useUser'

// 是否已关注公众号
export function useIsFollowWx(): Boolean {
  return useAppSelector(root => root.message.isFollowWx || false)
}

// 拉取并设置是否已关注公众号
export function useRefreshIsFollowWx(): Func0<Promise<boolean>> {
  return useCallback(async () => {
    const isFollowWx = await fetchIsFollowWxApi()
    dispatchSetIsFollowWx(isFollowWx)

    return isFollowWx
  }, [])
}

// 设置今日已弹出订阅消息
export function useTryShowSubscribe(): Func0<void> {
  const isFollowWx = useIsFollowWx()

  const lastNoticeTime = getStorageSync(IM_LAST_NOTICE_SUBSCRIBE_TIME_STORAGE_KEY)
  const todayStartTime = dayjs().startOf('day').valueOf()

  const shouldShow = !isFollowWx && todayStartTime > (+lastNoticeTime || 0)

  function tryShowSubscribe() {
    if (!shouldShow) {
      return
    }

    setStorage({ key: IM_LAST_NOTICE_SUBSCRIBE_TIME_STORAGE_KEY, data: new Date().getTime() })

    fetchMessageNoticeRestTimes().then(times => {
      if (times < 3) {
        hideKeyboard()
        requestSubscribeMessage({
          tmplIds: [SUBSCRIBE_TEMPLATE_ID, SUBSCRIBE_CHAT_MESSAGE_TEMPLATE_ID],
        }).then(res => {
          if (res[SUBSCRIBE_TEMPLATE_ID] === 'accept') {
            subscribeApplyJobNoticeApi([SUBSCRIBE_TEMPLATE_ID])
          }
          if (res[SUBSCRIBE_CHAT_MESSAGE_TEMPLATE_ID] === 'accept') {
            subscribeMessageNotice()
          }
        })
      }
    })
  }

  return tryShowSubscribe
}

//设置临时关闭引导关注
export function setTemporaryClosureSubscribe() {
  setStorage({ key: LAST_CLOSE_NOTICE_SUBSCRIBE_TIME_STORAGE_KEY, data: new Date().getTime() })
}
// 是否已关注公众号
export function useIsShowSubscribeCard(): boolean {
  const isFollowWx = useIsFollowWx()
  const isLogined = useIsLogin()
  const lastNoticeTime = getStorageSync(LAST_CLOSE_NOTICE_SUBSCRIBE_TIME_STORAGE_KEY)
  const todayStartTime = dayjs().startOf('day').valueOf()
  const show = !isFollowWx && todayStartTime > (+lastNoticeTime || 0) && isLogined
  return show
}
