import Client from '@/apis/client'
import {
  IContactInfo,
  IJobCategory,
  ILocation,
  IList,
  IRelational,
  defaultLocation,
} from '@/def/common'
import store from '@/store'
import { IDiscover } from '@/def/discover'
import { ICompany, IJob } from '@/def/job'
import {
  ApplyStatusType,
  ISubscribeStatus,
  IUserInfo,
  wxHRRegisterParms,
  wxLoginParams,
} from '@/def/user'
import { mpIsInIos } from '@/utils/utils'
import { reportStore } from '@/weapp/landing/hr/layout/useChannel'
import { getStorageSync } from '@tarojs/taro'
import { APP_TOKEN_FLAG, PROFILE } from '@/config'



// 登录用户获取个人信息
export const getInfoApi = () => Client<IUserInfo>({ url: '/auth/info' })
  .then((res) => {
    const isIos = mpIsInIos()

    return {
      ...res,
      profileTopADExpose: isIos ? 0 : res?.profileTopADExpose,
    }
  })

// 获取是否是登录态失效的老用户
export const getOldUser = (openId: string) => Client({ url: '/ymtd-capp/api/auth/checkOldUser', method: 'POST', data: { openId } })

// 获取用户已投递的职位
export const listRecordApi = (page: number, status: ApplyStatusType) =>
  Client({ url: '/auth/applies', data: { page, status } })

// 获取用户已收藏的职位
export async function listFavoriteJobsApi(page: number): Promise<IList<IRelational<'jd', IJob>>> {
  return Client({ url: '/auth/favorites', data: { type: 'jd', page } })
}

// 获取用户已收藏的公司
export async function listFavoriteCompaniesApi(
  page: number
): Promise<IList<IRelational<'jd', ICompany>>> {
  return Client({ url: '/auth/favorites', data: { type: 'company', page } })
}

// 获取用户已收藏的文章
export async function listFavoriteAritclesApi(
  page: number
): Promise<IList<IRelational<'article', IDiscover>>> {
  return Client({ url: '/auth/favorites', data: { type: 'article', page } })
}

// 获取推荐职位列表
export async function listRecommendedJobsApi(
  page: number
): Promise<IList<IRelational<'jd', IJob>>> {
  return Client({ url: '/auth/recommended-jds', data: { page } })
}

// 获取用户 OpenId
export async function getUserOpenIdApi(code: string): Promise<{ openid: string }> {
  return Client({ url: '/app/init', method: 'POST', data: { code } })
}

// 小程序手机号登录
//！！！ 一定要在之前调用 useChannel   reportStore才能拿到数据，坑点！
export const wxLoginApi = (params: wxLoginParams) =>
  Client({
    url: '/auth/login',
    method: 'POST',
    data: {
      ...params,
      ...reportStore,
      consultantCode: store.getState().common.jdInviteCode || '',
      eventName: store.getState().common.jdInviteCode ? '顾问合作拉简历' : params.eventName,
    },
  })

interface IResponseSubscribeStatus {
  is_subscribe: boolean
  cities: ILocation[]
  positions: string[]
  positions_label: string
  conditions: {
    cities: boolean
    positions: boolean
    wx: boolean
  }
}

// 拉取用户订阅职位详情
export async function fetchSubscribeStatusApi(): Promise<ISubscribeStatus> {
  function handleExpectJobs(labels: string, jobIds: number[]): IJobCategory[] {
    return (labels || '')
      .split(',')
      .filter(Boolean)
      .reduce(
        (result, jobLabel, index) => [
          ...result,
          { label: jobLabel, value: String(jobIds[index]), id: jobIds[index] },
        ],
        []
      )
  }

  return Client<IResponseSubscribeStatus>({ url: '/auth/intents/subscription' }).then(result => ({
    is_subscribe: result.is_subscribe,
    cities: result.cities,
    jobs: handleExpectJobs(result.positions_label, result.positions.map(Number)),
    conditions: {
      cities: result.conditions.cities,
      positions: result.conditions.positions,
      wx: result.conditions.wx,
    },
  }))
}

// 订阅职位：保存期望职位
export async function setExpectJobsApi(jobs: IJobCategory[]): Promise<void> {
  return Client({
    url: '/auth/intents/positions',
    method: 'POST',
    data: { positions: jobs.map(job => job.value) },
  })
}

// 订阅职位：保存期望城市
export async function setExpectCitiesApi(cities: ILocation[]): Promise<void> {
  return Client({
    url: '/auth/intents/cities',
    method: 'POST',
    data: { cities: cities.map(city => city.id) },
  })
}

// 订阅职位：提交订阅
export async function subscribeApi(): Promise<void> {
  return Client({ url: '/auth/intents/subscribe', method: 'PUT' })
}

// 订阅职位：取消订阅
export async function cancelSubscribeJobsApi(): Promise<void> {
  return Client({ url: '/auth/intents/unsubscribe', method: 'PUT' })
}

// 设置用户隐私
export async function setUserPrivacyApi(isOpen: boolean): Promise<void> {
  return Client({ url: '/auth/privacy', method: 'PUT', data: { is_open: isOpen } })
}

// 设置个性化推荐
export async function setJdRecommendApi(isOpen: boolean): Promise<void> {
  return Client({ url: '/jd/recommend', method: 'PUT', data: { is_jd_recommend: isOpen } })
}

// 拉取商务合作页联系方式
export async function fetchBizContactApi(): Promise<IContactInfo> {
  return Client({ url: '/options/contacts' })
}

// 营销弹窗背景图
export async function fetchMarketWindowBgImage(): Promise<any> {
  return Client({ url: '/market-window' })
}

// 小程序授权注册B端
export const signUpForHRApi = (data: wxHRRegisterParms) =>
  Client({ url: '/ymtd-user/hr/miniAppRegister', method: 'POST', data })

// 更新用户求职状态
export const updateUserStatusApi = (status: number) =>
  Client({ url: '/ymtd-user/users/status', method: 'PUT', data: { status } })

// BApp 跳转小程序提交 UnionId 和用户 ID 关联关系
export const bindUnionIdAndUserIdApi = (userId: string | number, jsCode: string | number) =>
  Client({
    url: '/ymtd-bapp/wechat/officialAccount/preBind',
    method: 'POST',
    data: { userId, jsCode },
    header: { Authorization: null },
  })

export const fetchIsDyUser = () =>
  Client({
    url: '/ymtd-capp/dy/isFromDyChannel',
    method: 'POST',
  })

export async function fetchCityByIpApi(): Promise<ILocation> {
  return Client({ url: '/ymtd-capp/common/getLocationCity' }).then(res => ({
    id: res.cityId,
    name: res.cityName,
  }))
}

// 今天开聊人数
export async function fetchQueryChatHRCountTodayApi(): Promise<{chatHRCountToday: number}> {
  return Client({ url: '/ymtd-capp/im/queryChatHRCountToday', method: 'POST', })
}

// 发送短信验证码
export async function fetchSendCaptcha(phone: string): Promise<{}> {
  return Client({ url: '/ymtd-capp/app/user/sendCaptcha', data: { phone } })
}


export async function fetchSendCaptchaByCode(captchaParam: string, phone: string): Promise<{}> {
  return Client({ method: 'POST', url: '/ymtd-capp/app/user/sendCaptchaByCode', data: { captchaParam, phone } })
}
interface ILoginParams {
  phone: string,
  captcha: string,
}
/**
 * 注册接口
 * @param data 
 * @returns 
 */
export function fetchUserLogin(data: ILoginParams): Promise<{
  jwtToken: string
}> {
  return Client({url: '/ymtd-capp/app/user/login', method: 'POST', data: {
    ...data,
    consultantCode: store.getState().common.jdInviteCode || '',
    eventName: store.getState().common.jdInviteCode ? '顾问合作拉简历' : ''
  }})
}

export const isProfile = getStorageSync(PROFILE)
export const isLogined = getStorageSync(APP_TOKEN_FLAG)