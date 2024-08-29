import { getStorageSync, makePhoneCall } from '@tarojs/taro'
import { useCallback } from 'react'

import { initActivity, getActivityLink, dismiss } from '@/apis/active-page'
import { SUBSCRIBE, PROFILE, IS_INTENT, APP_IS_OLD_USER } from '@/config'
import { IResumeForHomepage } from '@/def/resume'
import { IUserInfo, INullableUserInfo, defaultUserInfo } from '@/def/user'
import { logout, loginWithWx, refreshUserInfo, isSchoolVersion } from '@/services/AccountService'
import { dispatchClearUserNoticeCount, useAppSelector } from '@/store'
import { getVarParam, sendHongBaoEvent } from '@/utils/dataRangers'
import { jumpToWebviewPage } from '@/utils/utils'

import { useLuckyDrawPopup } from './usePopup'
import useToast from './useToast'
import useChannel from '@/weapp/landing/hr/layout/useChannel'

export function useIsLogin(): boolean {
  return useAppSelector(store => (store.user ? true : false))
}

export function useLogout() {
  return logout
}

// 获取用户 profile 字段的简历 ID
export function useUserProfileId(): string {
  return useAppSelector(store => store.user?.profile?.id || '')
}

export function useCurrentUserInfo(): INullableUserInfo {
  return useAppSelector(store => store.user)
}

export function useSpringStatus() {
  const userInfo = useCurrentUserInfo() || defaultUserInfo;

  // 可以抽奖
  const showSpringGetAward = userInfo.stage === 1 && !userInfo.isDraw;

  // 抽过奖了
  const isGetAwarded = userInfo.stage === 1 && userInfo.isDraw;

  return {
    showSpringGetAward,
    isGetAwarded
  }
}

export function useUpdateCurrentUserInfo(): Func0<Promise<IUserInfo>> {
  return useCallback(refreshUserInfo, [])
}

export function useClearUserNoticeCount(): Func1<'record' | 'recommend', void> {
  return (category: 'record' | 'recommend') => void dispatchClearUserNoticeCount(category)
}

export interface IrData {
  type?: string
  pageName?: string
}

// 微信登录
export const useWxLogin = () => {
  const showToast = useToast()
  useChannel()
  async function wxLoginFn(
    code: string,
    encryptedData: string,
    iv: string,
    callback?: (isSuccess: boolean, loginParam?: any) => void,
    rangersData?: IrData
  ): Promise<void> {
    const ab_sdk_version = getVarParam('ab_sdk_version')
    const args = { code, encryptedData, iv }
    const isSchool = isSchoolVersion()

    if (ab_sdk_version) Object.assign(args, { platForm: isSchool ? '校园版' : '社招版' })

    Object.assign(args, { ab_sdk_version })

    const isOldUser = getStorageSync(APP_IS_OLD_USER)
    if (isOldUser) Object.assign(args, { oldUserLoseLoginStats: isOldUser ? 1 : 0 })

    if(rangersData) Object.assign(args, { ...rangersData })

    return loginWithWx(args)
      .then(params => {
        showToast({ content: '极速登录成功' })
        callback && callback(true, params)
      })
      .catch(({ errorMessage }) => {
        showToast({ content: errorMessage || '极速登录失败' })
        callback && callback(false)
      })
  }

  const wxLogin = useCallback(wxLoginFn, [showToast])

  return wxLogin
}

// 获取订阅状态
export function useUserSubscribeStatus(): boolean | undefined {
  return getStorageSync(SUBSCRIBE)
}

// 获取本地存储简历数据
export function useLocalUserProfile(
  key: keyof IResumeForHomepage
): IResumeForHomepage[keyof IResumeForHomepage] {
  return getStorageSync(PROFILE)?.[key]
}

//获取用户是否有求职意向
export function useGetUserIndentStatus() {
  return useAppSelector(store => store.user?.is_intent || '') || getStorageSync(IS_INTENT)
}
//用户抽奖流程
export function useGetUserLuckyDrawFlow() {
  const [openLuckyDrawPopup] = useLuckyDrawPopup()
  const showToast = useToast()
  async function luckyDraw(isHomePage?: boolean) {
    return new Promise<void>((res, rej) => {
      initActivity()
        .then(({ canJoin, verifyResult }) => {
          if (canJoin) {
            getActivityLink().then(({ activityLink }) => {
              let luckyDrawPopupData = {
                route: activityLink,
                showClear: true,
                onClose: () => {
                  sendHongBaoEvent('FirstRafflePopup', { is_first_raffle: 0 })
                  return res()
                },
              }
              if (isHomePage)
                luckyDrawPopupData = Object.assign(luckyDrawPopupData, {
                  title: '您已完成简历创建',
                  confirmText: '去领红包',
                  cancelText: '没兴趣',
                  showClear: false,
                  onClose: () => {
                    sendHongBaoEvent('SecondRafflePopup', { is_second_raffle: 0 })
                    dismiss().catch(result => showToast({ content: result.message }))
                    return res()
                  },
                })
              openLuckyDrawPopup({
                ...luckyDrawPopupData,
                onConfirm: () => {
                  //是否是第一次确定去抽奖
                  if (!isHomePage) sendHongBaoEvent('FirstRafflePopup', { is_first_raffle: 1 })
                  else sendHongBaoEvent('SecondRafflePopup', { is_second_raffle: 1 })
                  jumpToWebviewPage(activityLink, '领红包')
                },
              })
            })
          } else if (verifyResult === 'reject' && !isHomePage) {
            openLuckyDrawPopup({
              title: '很遗憾，您的简历未通过审核',
              content: '可咨询现场工作人员或客服',
              cancelText: '联系客服',
              confirmText: '知道了',
              onConfirm: () => res(),
              onClose: () => {
                makePhoneCall({
                  phoneNumber: '0512-62626030',
                  complete: () => res(),
                })
              },
            })
          }
        })
        .catch(rej)
    })
  }

  return useCallback(luckyDraw, [])
}
//获取所有路由
export function useAllPagesRoute() {
  return useAppSelector(store => store.common.pages)
}
//获取是否沟通过
export function useGetHaveChat(): number {
  return useAppSelector(store => store.user?.haveChat || 0)
}
