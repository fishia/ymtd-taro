import Taro, { Chain, getStorageSync, setStorage } from '@tarojs/taro'
import dayjs from 'dayjs'

import appStore from '@/store'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

const dataType = 'YYYY-MM-DD HH:mm:ss:SSS'

type CacheValueType = {
  timeStamp: number
  data: any
}

export const cacheInterceptor = function (chain: Chain): Promise<any> {
  const requestParams = chain.requestParams
  const { throttle, cacheKey } = requestParams
  if (cacheKey && throttle) {
    const take: CacheValueType = getStorageSync(cacheKey)
    if (take && Date.now() - take.timeStamp < throttle) {
      return new Promise(resolve => resolve(take.data))
    }
    return chain.proceed(requestParams).then(res => {
      const put: CacheValueType = {
        timeStamp: Date.now(),
        data: res,
      }
      setStorage({ key: cacheKey, data: put })

      return res
    })
  }

  return chain.proceed(requestParams)
}

export const dataRangerInterceptor = function (chain: Chain): Promise<any> {
  const requestParams = chain.requestParams
  const requeset_time = dayjs()
  const { header, url } = requestParams
  const userId = appStore.getState().user?.id

  sendDataRangersEventWithUrl('front_request', {
    plat_form: header?.Platform,
    request_url: url,
    user_id: userId,
    json_body: requestParams.data,
    requeset_time: requeset_time.format(dataType),
  })

  return chain
    .proceed(requestParams)
    .then(res => {
      const response_time = dayjs()

      sendDataRangersEventWithUrl('front_get_response', {
        plat_form: header?.Platform,
        request_url: url,
        user_id: userId,
        json_body: res,
        status: '成功',
        requeset_time: requeset_time.format(dataType),
        response_time: response_time.format(dataType),
        duration_time: response_time.diff(requeset_time),
      })

      return res
    })
    .catch(res => {
      const response_time = dayjs()

      sendDataRangersEventWithUrl('front_get_response', {
        plat_form: header?.Platform,
        request_url: url,
        user_id: userId,
        json_body: res,
        status: '失败',
        requeset_time: requeset_time.format(dataType),
        response_time: response_time.format(dataType),
        duration_time: response_time.diff(requeset_time),
      })

      return res
    })
}

export const timeoutInterceptor = Taro.interceptors.timeoutInterceptor

export const logInterceptor = Taro.interceptors.logInterceptor
