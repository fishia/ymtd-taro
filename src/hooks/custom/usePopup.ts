import {
  eventCenter,
  getLaunchOptionsSync,
  getStorageInfo,
  getStorageSync,
  setStorageSync,
  useRouter,
} from '@tarojs/taro'
import dayjs from 'dayjs'
import { orderBy, omit, includes } from 'lodash'
import { useCallback, useEffect, useRef } from 'react'

import { saveProfileAward } from '@/apis/active-page'
import { listQualityPositionListApi } from '@/apis/job'
import { fetchQueryChatHRCountTodayApi, getInfoApi, isLogined, isProfile } from '@/apis/user'
import {
  FixedBottomPopupState,
  FullScreenPopupState,
  GuidePopupState,
  PriorityPopState,
} from '@/components/Popup'
import { addFavoritePopupEventKey } from '@/components/Popup/addFavoritePopup'
import { fixedBottomPopupEventKey } from '@/components/Popup/fixedBottomPopup'
import { fullScreenPopupEventKey } from '@/components/Popup/fullScreenPopup'
import { guidePopupEventKey } from '@/components/Popup/guidePopup'
import { ILoginPopupProps, loginPopupEventKey } from '@/components/Popup/loginPopup'
import { luckyDrawPopupEventKey, LuckyDrawPopupState } from '@/components/Popup/luckyDrawPopup'
import {
  refuelPackagePopupEventKey,
  RefuelPackagePopupState,
} from '@/components/Popup/refuelPackagePopup'
import { resumeStickyPopupEventKey } from '@/components/Popup/resumeStickyPopup'
import { WarmTipsPopupState, warmTipsPopupEventKey } from '@/components/Popup/warmTipsPopup'
import {
  qualityPositionPopupEventKey,
  shouldShowQualityPositionPopup,
  useQualityPositionPopup,
} from '@/components/QualityPositionPopup'
import { ADS_POPUP_DATE, APP_TOKEN_FLAG, HAVEDRAW } from '@/config'
import { PopupMode } from '@/def/common'
import { ProfileType } from '@/def/resume'
import { getPopupOpenTimes, increasePopupOpenTimes, getWechatInfo } from '@/services/PopupService'
import appStore from '@/store'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import fnUseOnce from './useOnce'
import useShowModal from './useShowModal'
import { useGetUserLuckyDrawFlow } from './useUser'

export const selectTitle = (title?: string) => {
  // const titleList = ['品牌', '升职季', '交换微信', '简历置顶', '百济神州']
  // const arr = titleList.map(item => includes(title ? title : '', item))
  // return includes(arr, true)
  return true
}

/**
 * 底部弹窗
 * @returns showFixedBottomPopup()
 * showClear?: boolean
 * confirmText?: string
 * isOpened?: boolean
 * onClose?: Function
 * onConfirm?: Function
 * web_url?: string
 * route?: string
 * icon?: string
 * bg_image?: string //背景
 * tips_text?: string
 * closeIconStyle?: CSSProperties //关闭图标样式
 * times?: number //底部弹窗关闭次数
 */
// 底部弹窗
export const useFixedBottomPopup = () => {
  const router = useRouter()
  function showFixedBottomPopup(options: FixedBottomPopupState) {
    const { key: timesKey, maxOpenTimes } = options
    const times = getPopupOpenTimes(PopupMode.FIXEDBOTTOM_OPEN_TIMES, timesKey)
    //maxOpenTimes未定义则是无限次
    if (!maxOpenTimes) {
      eventCenter.trigger(router.path + fixedBottomPopupEventKey, options)
    } else if (times < maxOpenTimes) {
      eventCenter.trigger(router.path + fixedBottomPopupEventKey, options)
    } else {
      console.log(`超过${maxOpenTimes}次不再弹出`)
    }
  }
  const open = useCallback(showFixedBottomPopup, [router.path])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const openSharePopup = useCallback(opts => getWechatInfo(() => showFixedBottomPopup(opts)), [
    router.path,
  ])
  const close = useCallback(() => {
    eventCenter.trigger(router.path + fixedBottomPopupEventKey, {}, 'close')
  }, [router.path])

  return { open, close, openSharePopup }
}

// 全屏弹窗
export const useFullScreenPopup = () => {
  const router = useRouter()

  function showFullScreenPopup(options: FullScreenPopupState) {
    const { key: timesKey, maxOpenTimes } = options
    const times = getPopupOpenTimes(PopupMode.FULLSCREEN_OPEN_TIMES, timesKey)
    //maxOpenTimes未定义则是无限次
    if (!maxOpenTimes) {
      eventCenter.trigger(router.path + fullScreenPopupEventKey, options)
    } else if (times < maxOpenTimes) {
      eventCenter.trigger(router.path + fullScreenPopupEventKey, options)
    } else {
      console.log(`超过${maxOpenTimes}次不再弹出`)
    }
  }

  const open = useCallback(showFullScreenPopup, [router.path])
  const close = (options?: FullScreenPopupState) => {
    eventCenter.trigger(router.path + fullScreenPopupEventKey, options, 'close')
  }

  return [open, close]
}

// 登录弹窗
export function useShowLoginPopup() {
  const router = useRouter()

  async function showLoginPopup(options?: ILoginPopupProps) {
    return new Promise((res, rej) => {
      eventCenter.trigger(loginPopupEventKey, {
        onConfirm: res,
        onClose: rej,
        ...options,
      })
    })
  }

  return useCallback(showLoginPopup, [router?.path])
}

// 关闭登录弹窗
export function useHideLoginPopup() {
  const router = useRouter()

  function hideLoginPopup() {
    eventCenter.trigger(loginPopupEventKey, {}, 'close')
  }

  return useCallback(hideLoginPopup, [router.path])
}

// 添加到我的小程序提示
export function useShowAddFavoritePopup() {
  // const useTabItemTap = useCustomTabItemTap()
  // useTabItemTap(() => void eventCenter.trigger(router.path + addFavoritePopupEventKey, {}, 'close'))
  const router = useRouter()

  function showAddFavoritePopup() {
    const times = getPopupOpenTimes(PopupMode.ADD_FAVORITE_OPEN_TIMES)
    if (times < 1 && getLaunchOptionsSync().scene !== 1154) {
      eventCenter.trigger(router.path + addFavoritePopupEventKey)
      increasePopupOpenTimes(PopupMode.ADD_FAVORITE_OPEN_TIMES)
    }
  }

  return useCallback(showAddFavoritePopup, [router.path])
}

// 指引页面弹窗
export function useShowGuidePopup() {
  const router = useRouter()

  function showGuidePopup(options: GuidePopupState) {
    const { key: timesKey, maxOpenTimes = 1 } = options
    const times = getPopupOpenTimes(PopupMode.GUIDE_OPEN_TIMES, timesKey)
    //maxOpenTimes未定义则是无限次
    if (!maxOpenTimes) {
      eventCenter.trigger(router.path + guidePopupEventKey, options)
    } else if (times < maxOpenTimes) {
      eventCenter.trigger(router.path + guidePopupEventKey, options)
    } else {
      console.log(`超过${maxOpenTimes}次不再弹出`)
    }
  }

  const open = useCallback(showGuidePopup, [router.path])
  const close = (options?: GuidePopupState) => {
    eventCenter.trigger(router.path + guidePopupEventKey, options, 'close')
  }

  return [open, close]
}

//按优先级弹出营销弹窗
export function useShowMarketPopup() {
  const { open } = useFixedBottomPopup()
  const [showFullScreenPopup] = useFullScreenPopup()
  const getUserLuckyDrawFlow = useGetUserLuckyDrawFlow()
  const [showQualityPositionPopup] = useQualityPositionPopup()

  async function showMarketPopup(priorityList: PriorityPopState[], maxOpenTimes: number = 0) {
    return new Promise(async (res, rej) => {
      //根据权重排序
      let newArr = orderBy(priorityList, ['priority'], ['desc']),
        isOpen = false

      if ((isLogined && !isProfile) || isProfile.isActivated === ProfileType.NOSYNCS) {
        return
      }

      try {
        for (let i = 0; i < newArr.length; i++) {
          let item = { maxOpenTimes, ...newArr[i] }
          if (item.show) {
            // 优选职位弹窗
            if (item.PopupMode === qualityPositionPopupEventKey) {
              if (!shouldShowQualityPositionPopup('daily')) {
                isOpen = false
              } else {
                const jobList = await listQualityPositionListApi()
                if (jobList.length > 0) {
                  isOpen = true
                  showQualityPositionPopup({ type: 'daily', jobList })
                } else {
                  isOpen = false
                }
              }
            }
            // 营销弹窗
            else if (item.PopupMode === PopupMode.FULLSCREEN_OPEN_TIMES) {
              if (
                item.maxOpenTimes &&
                getPopupOpenTimes(PopupMode.FULLSCREEN_OPEN_TIMES, item.key) >= item.maxOpenTimes
              ) {
                isOpen = false
              } else {
                const currentDay = dayjs().format('YYYY-MM-DD')
                if (selectTitle(item.title)) {
                  if (getStorageSync(`${ADS_POPUP_DATE}+${item.key}`) !== currentDay) {
                    isOpen = true
                    showFullScreenPopup({
                      ...omit(item, ['priority', 'show', 'PopupMode']),
                    })
                  }
                } else {
                  isOpen = false
                }
              }
            } else if (item.PopupMode === PopupMode.FIXEDBOTTOM_OPEN_TIMES) {
              //如果超过最大次数，则不跳出循环,继续下一个权重
              if (
                item.maxOpenTimes &&
                getPopupOpenTimes(PopupMode.FIXEDBOTTOM_OPEN_TIMES, item.key) >= item.maxOpenTimes
              ) {
                isOpen = false
              } else {
                isOpen = true
                open({
                  ...omit(item, ['priority', 'show', 'PopupMode']),
                })
              }
            } else if (item.PopupMode === PopupMode.LUCKYDRAW_OPEN_TIMES) {
              //没抽过奖就需要弹窗，抽过则直接下一个弹窗
              if (!getStorageSync(HAVEDRAW)) {
                isOpen = true
                getUserLuckyDrawFlow(true)
              }
            }
          }
          // 打开一次直接退出循环
          if (isOpen && !item.Unstoppable) {
            // 如果是未登录状态展示立即加群则不将第一次进入小程序状态更新为true
            res(true)
            break
          }
        }
      } catch {
        return rej('弹窗UI渲染错误')
      }
    })
  }
  return useCallback(showMarketPopup, [])
}

// 红包弹窗
export const useLuckyDrawPopup = () => {
  const router = useRouter()

  function showLuckyDrawPopupPopup(options?: LuckyDrawPopupState) {
    eventCenter.trigger(router.path + luckyDrawPopupEventKey, options)
  }

  const open = useCallback(showLuckyDrawPopupPopup, [router.path])
  const close = (options?: LuckyDrawPopupState) => {
    eventCenter.trigger(router.path + luckyDrawPopupEventKey, options, 'close')
  }

  return [open, close]
}

//底部ref
export function useFixedBottomPupupRef() {
  const router = useRouter()
  const fixedBottomPopupRef = useRef<any>(null)

  useEffect(() => {
    eventCenter.on(
      router.path + fixedBottomPopupEventKey,
      (p, type = 'open') => void fixedBottomPopupRef?.current?.[type](p)
    )

    return () => {
      eventCenter.off(router.path + fixedBottomPopupEventKey)
    }
  })

  return fixedBottomPopupRef
}

//领红包
export function useLuckyDrawPupupRef() {
  const router = useRouter()
  const luckyDrawPopupRef = useRef<any>(null)

  useEffect(() => {
    eventCenter.on(
      router.path + luckyDrawPopupEventKey,
      (p, type = 'open') => void luckyDrawPopupRef?.current?.[type](p)
    )

    return () => {
      eventCenter.off(router.path + luckyDrawPopupEventKey)
    }
  })

  return luckyDrawPopupRef
}

// 加油包弹窗
export const useRefuelPackagePopup = () => {
  const router = useRouter()

  function showRefuelPackagePopupPopup(options?: RefuelPackagePopupState) {
    eventCenter.trigger(router.path + refuelPackagePopupEventKey, options)
  }

  const open = useCallback(showRefuelPackagePopupPopup, [router.path])
  const close = (options?: RefuelPackagePopupState) => {
    eventCenter.trigger(router.path + refuelPackagePopupEventKey, options, 'close')
  }

  return [open, close]
}

//领红包
export function useRefuelPackagePopupRef() {
  const router = useRouter()
  const refuelPackagePopupRef = useRef<any>(null)

  useEffect(() => {
    eventCenter.on(
      router.path + refuelPackagePopupEventKey,
      (p, type = 'open') => void refuelPackagePopupRef?.current?.[type](p)
    )

    return () => {
      eventCenter.off(router.path + refuelPackagePopupEventKey)
    }
  })

  return refuelPackagePopupRef
}

// 简历置顶弹窗
export function useResumeStickyPopupRef() {
  const router = useRouter()
  const resumeStickyRef = useRef<any>(null)

  useEffect(() => {
    eventCenter.on(
      router.path + resumeStickyPopupEventKey,
      (p, type = 'open') => void resumeStickyRef?.current?.[type](p)
    )

    return () => {
      eventCenter.off(router.path + resumeStickyPopupEventKey)
    }
  })

  return resumeStickyRef
}

export const useResumeStickyPopup = () => {
  const router = useRouter()
  function showResumeStickyPopupPopup() {
    eventCenter.trigger(router.path + resumeStickyPopupEventKey)
  }

  const isShowResumeStickPop = useCallback(() => {
    const { needShow, setCurrentTips } = fnUseOnce(resumeStickyPopupEventKey, true)
    const userInfo = appStore.getState().user
    const isLogined = getStorageSync(APP_TOKEN_FLAG)

    sendDataRangersEventWithUrl('EventExpose', {
      event_name: '简历置顶服务',
      type: '弹窗',
    })

    // 曝光次数达到限制，不弹窗
    if (!needShow) {
      return false
    }

    // 没登录，不弹窗
    if (!isLogined) {
      return false
    }

    // 接口控制，不弹窗
    if (!userInfo?.profileTopADExpose) {
      return false
    }

    // 买过权益，不弹弹
    if (userInfo?.profileTop) {
      return false
    }

    // 品牌雇主没弹，一切免“弹”
    if (!getStorageSync('employerPopOpened')) {
      return false
    }
    // 弹窗, 设置曝光次数
    setCurrentTips()
    showResumeStickyPopupPopup()
    return true
  }, [])

  const checkImAndShowPop = async () => {
    const { needShow, setCurrentTips } = fnUseOnce(resumeStickyPopupEventKey + 'im', true)

    sendDataRangersEventWithUrl('EventExpose', {
      event_name: '简历置顶服务',
      type: '弹窗',
    })

    const res = await fetchQueryChatHRCountTodayApi()
    if (res.chatHRCountToday > 2 && needShow) {
      setCurrentTips()
      showResumeStickyPopupPopup()
      return true
    }
    return false
  }

  const open = useCallback(showResumeStickyPopupPopup, [router.path])
  const close = () => {
    eventCenter.trigger(router.path + resumeStickyPopupEventKey, {}, 'close')
  }

  return {
    open,
    close,
    isShowResumeStickPop,
    checkImAndShowPop,
  }
}

// 春战之后通用提示弹窗
export const useWarmTipsPopup = () => {
  const router = useRouter()

  function showWarmTipsPopup(options?: WarmTipsPopupState) {
    eventCenter.trigger(router.path + warmTipsPopupEventKey, options)
  }

  const open = useCallback(showWarmTipsPopup, [router.path])
  const close = (options?: WarmTipsPopupState) => {
    eventCenter.trigger(router.path + warmTipsPopupEventKey, options, 'close')
  }

  return [open, close]
}

// 通用弹窗打开关闭
export function useWarmTipsPopupRef() {
  const router = useRouter()
  const warmTipsPopupRef = useRef<any>(null)

  useEffect(() => {
    eventCenter.on(
      router.path + warmTipsPopupEventKey,
      (p, type = 'open') => void warmTipsPopupRef?.current?.[type](p)
    )

    return () => {
      eventCenter.off(router.path + warmTipsPopupEventKey)
    }
  })

  return warmTipsPopupRef
}
