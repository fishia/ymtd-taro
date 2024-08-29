import {
  setStorageSync,
  getStorageSync,
  login,
  navigateTo,
  redirectTo,
  hideHomeButton,
  eventCenter,
  getCurrentInstance,
  switchTab,
} from '@tarojs/taro'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { debounce, pick } from 'lodash'

import { initActivity } from '@/apis/active-page'
import { appendUserIntentApi } from '@/apis/resume'
import { getInfoApi, getUserOpenIdApi, wxLoginApi, getOldUser } from '@/apis/user'
import { tryContinueLoginRecordJd } from '@/components/LoginButton'
import { showPickIntentPopup } from '@/components/PickIntentPopup'
import {
  APP_TOKEN_FLAG,
  APP_OPENID_KEY,
  SUBSCRIBE,
  PROFILE,
  IS_JD_RECOMMAND,
  IS_INTENT,
  HAVEDRAW,
  NEW_LOGIN_INTENT_STORAGE_KEY,
  REFRESH_INTENTS_LIST,
  IS_IMPORTANT_USERINFO,
  APP_IS_OLD_USER,
} from '@/config'
import { IResumeIntentInfo, ProfileType } from '@/def/resume'
import { IUserInfo, wxLoginParams } from '@/def/user'
import { setOnceReguler } from '@/hooks/custom/useOnce'
import { refreshCurrentResumeFn } from '@/hooks/custom/useResume'
import { connectIM, disconnectIM } from '@/services/IMService'
import { checkResumeErrorBlock, ensureResume } from '@/services/ResumeService'
import store, {
  dispatchInitMessageStore,
  dispatchRefreshHomePage,
  dispatchSetPreviewResume,
  dispatchSetResume,
  dispatchSetUser,
} from '@/store'
import { resetDataRangersUserId, setDataRangersUserId } from '@/utils/dataRangers'

import { activityStatus } from '../DateService'
import { openCreateResumeModal } from '@/components/Modal/CreateResumeModal'

dayjs.extend(isBetween)

// 刷新用户信息
export async function refreshUserInfo(): Promise<IUserInfo> {
  const userInfo = await getInfoApi()
  setUserInfoStorage(userInfo)
  dispatchSetUser(userInfo)

  return userInfo
}

// 是否跳过首页流程的情况，在launch里面拿不到
export function isNeedSkipLogin() {
  const currentPagePath = '/' + getCurrentPages()[0]?.route
  const pages = [
    '/weapp/resume/app-upload-resume/index',
    '/weapp/resume/app-upload-resume-file/index',
    '/weapp/general/infoStation/index',
  ]

  return pages.includes(currentPagePath)
}

// 初始化登录时，获取并设置用户信息
export async function initFetchAndSetUserInfo(createResume = false): Promise<void> {
  if (isNeedSkipLogin()) {
    return
  }

  setTimeout(() => {
    const isCv = true

    const checkResumeFn = (wechat?: string) => {
      ensureResume().then(resume => {
        // 简历不完善进行拦截，微信号未填写跳转填写微信页
        if (resume) {
          const resumeIsError = checkResumeErrorBlock(resume)
          if (resumeIsError) {
            redirectTo({ url: `/weapp/resume/complete-resume/index?isHome=true` })
          } else {
            const { needShow, setCurrentTips } = setOnceReguler('go-add-wechat-guide', 3)
            if (!wechat && needShow) {
              setCurrentTips()
              navigateTo({
                url: `/weapp/general/add-wechat-guide/index`,
              })
            }
          }
        }
      })
    }

    getInfoApi()
      .then(userInfo => {
        setDataRangersUserId(userInfo.id, 500).then(async () => {
          if (userInfo.profile) {
            if (userInfo.profile.isActivated === ProfileType.NOSYNCS) {
              debounceCreateResume(userInfo.profile.isActivated)
            } else {
              connectIM()
                .then(async () => {
                  const newLoginIntent = getNewLoginIntent()
                  if (userInfo.intent_count >= 3 && newLoginIntent) {
                    showPickIntentPopup()
                    tryContinueLoginRecordJd(false)
                  } else if (userInfo.intent_count < 3 && newLoginIntent) {
                    await appendUserIntentApi(newLoginIntent)
                    setNewLoginIntent(null)
                    // await ensureResume()
                    await refreshCurrentResumeFn()

                    eventCenter.trigger(REFRESH_INTENTS_LIST)
                    tryContinueLoginRecordJd(true)
                  } else {
                    setNewLoginIntent(null)
                    tryContinueLoginRecordJd(true)
                  }

                  checkResumeFn(userInfo?.wechat)
                })
                .catch(connectIM)
            }
          } else {
            // 需刷新首页
            // dispatchRefreshHomePage()
            const isSchool = isSchoolVersion()
            if ((createResume || isCv) && !isSchool) {
              debounceCreateResume(0)
            }

            const newLoginIntent = getNewLoginIntent()
            if (userInfo.intent_count >= 3 && newLoginIntent) {
              setTimeout(showPickIntentPopup, 350)
            } else if (userInfo.intent_count < 3 && newLoginIntent) {
              try {
                await appendUserIntentApi(newLoginIntent)
              } catch {}

              setNewLoginIntent(null)
              // await ensureResume()
              await refreshCurrentResumeFn()

              eventCenter.trigger(REFRESH_INTENTS_LIST)
            }
          }
        })

        setUserInfoStorage(userInfo)

        dispatchSetUser(userInfo)

        //获取求职意向
        //eventCenter.trigger(REFRESH_INTENTS_LIST)
      })
      .catch(() => {
        tryJumpToNewLoginPage()
      })
  }, 400)
}

// 初始化抽奖状态
export async function initActivityStatus(): Promise<void> {
  const effectiveActivity = activityStatus()
  return new Promise(async resolve => {
    try {
      //活动期间需要存储用户是否已抽奖
      if (effectiveActivity) {
        initActivity()
          .then(({ canJoin }) => {
            setStorageSync(HAVEDRAW, !canJoin)
            resolve()
          })
          .catch(() => {
            //无简历
            setStorageSync(HAVEDRAW, true)
            resolve()
          })
      } else {
        setStorageSync(HAVEDRAW, true)
        resolve()
      }
    } catch (error) {
      resolve()
    }
  })
}

// 退出登录
export function logout() {
  disconnectIM()
  dispatchSetUser(null)

  resetDataRangersUserId()

  setStorageSync(APP_TOKEN_FLAG, null)
  setStorageSync(PROFILE, null)
  setStorageSync(SUBSCRIBE, null)
  setStorageSync(IS_JD_RECOMMAND, null)
  setStorageSync(IS_INTENT, null)
  setStorageSync(IS_IMPORTANT_USERINFO, null)
  dispatchInitMessageStore()
  dispatchSetPreviewResume(null)
  dispatchSetResume(null)
  dispatchRefreshHomePage()
  setStorageSync(APP_IS_OLD_USER, null)
}

// 请求 OpenID 并存储
export async function registerOpenId(): Promise<string> {
  return login()
    .then(loginInfo => loginInfo.code)
    .then(code => getUserOpenIdApi(code))
    .then(openIdInfo => {
      setStorageSync(APP_OPENID_KEY, openIdInfo.openid)

      return openIdInfo.openid
    })
}

// 获取已存储 OpenID
export function getOpenId() {
  return getStorageSync(APP_OPENID_KEY) || ''
}

// 微信小程序登录
export async function loginWithWx(params: wxLoginParams): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const { access_token, token_type } = await wxLoginApi(params)
      const token = `${token_type} ${access_token}`
      setStorageSync(APP_TOKEN_FLAG, token)

      await initFetchAndSetUserInfo(true)
      return resolve(token)
    } catch (error) {
      reject(error)
    }
  })
}

// 判断是否登录
export function hasUserLogined() {
  return store.getState().user ? true : false
}

//开启本地用户重要信息缓存
export async function setUserInfoStorage(userInfo: IUserInfo) {
  setStorageSync(SUBSCRIBE, userInfo.intent.is_subscribe)
  setStorageSync(IS_JD_RECOMMAND, userInfo.is_jd_recommend)
  setStorageSync(IS_INTENT, userInfo.is_intent)
  setStorageSync(IS_IMPORTANT_USERINFO, pick(userInfo, ['is_new', 'wechat']))
}

export async function noProfile() {
  const isLogined = getStorageSync(APP_TOKEN_FLAG)
  const isSchool = isSchoolVersion()
  const { profile } = (await getInfoApi()) as any
  if (isLogined && !profile && !isSchool) {
    debounceCreateResume(0)
  }
  if (profile) {
    // console.log(profile);
    // if (profile.integrity != 100) {
    //   navigateTo({ url: '/weapp/resume/complete-resume/index?mode=complete&type=save' })
    // }

    if (profile.isActivated === ProfileType.NOSYNCS) {
      debounceCreateResume(profile.isActivated)
    }
  }
}

// 判断是否校园版
export function isSchoolVersion() {
  return store.getState().common.version || false
}

const debounceCreateResume = debounce(
  async (value: number) => {
    const url =
      value === ProfileType.NOSYNCS
        ? '/weapp/resume/complete-resume/index'
        : '/weapp/resume/create-resume/index'
    openCreateResumeModal(url)
  },
  1000,
  { trailing: false, leading: true }
)

// 尝试转到新登录流程页
export function tryJumpToNewLoginPage() {
  // const current = getCurrentInstance()
  // const isSchool = current?.router?.path === 'weapp/resume/resume-competition/index'
  // const storagedIntent = getStorageSync(NEW_LOGIN_INTENT_STORAGE_KEY)
  // if (!storagedIntent && !isSchool) {
  //   setStorageSync(NEW_LOGIN_INTENT_STORAGE_KEY, 'skip')
  //   redirectTo({ url: '/weapp/general/new-login-guide/index' }).then(() => {
  //     hideHomeButton()
  //   })
  // }
}

// 存储新登录页填写的意向
export function setNewLoginIntent(newIntent: IResumeIntentInfo | null | 'skip') {
  if (!newIntent || newIntent === 'skip') {
    setStorageSync(NEW_LOGIN_INTENT_STORAGE_KEY, 'skip')
  } else {
    setStorageSync(NEW_LOGIN_INTENT_STORAGE_KEY, newIntent)
  }
}

// 获取新登录页填写的意向
export function getNewLoginIntent(): IResumeIntentInfo | null {
  const storagedIntent = getStorageSync(NEW_LOGIN_INTENT_STORAGE_KEY)

  if (!storagedIntent || storagedIntent === 'skip') {
    return null
  } else {
    return storagedIntent
  }
}

export async function getOldUserToMyPage(openId: string) {
  const data = await getOldUser(openId)
  if (data) {
    setStorageSync(APP_IS_OLD_USER, true)
    // switchTab({ url: '/weapp/pages/my/index' })
  }
}
