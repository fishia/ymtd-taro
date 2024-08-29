import Taro from '@tarojs/taro'

import { IApiRequestOption, IError, IResponse } from '@/def/client'
import { logout } from '@/services/AccountService'
import { reportLog } from '@/utils/reportLog'

import { handleRequestOption } from './handleRequestOption'
import { cacheInterceptor, timeoutInterceptor, dataRangerInterceptor } from './inceptors'

const Request = function () {
  Taro.addInterceptor(cacheInterceptor)
  Taro.addInterceptor(dataRangerInterceptor)
  Taro.addInterceptor(timeoutInterceptor)

  return <T = any>(options: IApiRequestOption): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const requestOptions = handleRequestOption(options)

      Taro.request(requestOptions)
        .then(rawResponse => {
          // 现在代码中已经移除了响应拦截器，因为响应拦截器只能处理 200 的响应
          // 响应成功/失败/身份过期，统一在此回调中处理

          // 此处的 rawResponse 是原始响应，带有 header、statusCode、data 等字段
          // 响应的数据存放在 data 字段里
          const responseData: IResponse = rawResponse.data

          // 此处建议通过 success 来判断，有一些旧接口例如（/api/share/jd-card）没有 code
          if (responseData.code == 0 || responseData.success) {
            // 成功的响应，把响应体中的 data 字段返回即可
            resolve(responseData.data)
          } else {
            reportLog(
              'api',
              `req:${requestOptions.url}`,
              ...(requestOptions.reportAddTags || [])
            ).warn('request params:', requestOptions, 'response:', responseData.data)

            // 以下几种情况为身份失效，需做注销动作
            if (
              responseData.code == 5112 ||
              responseData.code == 401 ||
              responseData.code == 401000
            ) {
              // logout()
            }

            // 此处构造错误数据体，因为业务代码中通过 errorCode、errorMessage 来读取错误信息
            // 此处需拷贝这些信息
            const errorBody: IError = {
              ...responseData,
              success: false,
              errorCode: responseData.code,
              errorMessage: responseData.message,
            }
            reject(errorBody)
          }
        })
        .catch(rawError => {
          // 此回调处理状态码不为 200 的情况，新版已经不存在此情况了，考虑到旧 API 还是会有，需做处理

          // 此处的错误也为原始错误相应，带有 header、statusCode、data 等字段
          // 错误的数据体在 data 字段里
          const errorData: IError | undefined = rawError.data

          reportLog(
            'api',
            'apistatuserror',
            `req:${requestOptions.url}`,
            ...(requestOptions.reportAddTags || [])
          ).warn('request params:', requestOptions, 'response:', rawError.data)

          // 判断条件写充分
          if (
            rawError.statusCode == 5112 ||
            rawError.statusCode == 401 ||
            rawError.statusCode == 401000 ||
            errorData?.code == 5112 ||
            errorData?.code == 401 ||
            errorData?.code == 401000
          ) {
            // logout()
          }

          const errorBody: IError = Object.assign(
            {
              code: 1,
              errorCode: errorData?.code || 1,
              errorMessage: errorData?.message || '服务器开小差了，请稍后重试',
            },
            errorData,
            { success: false }
          )
          reject(errorBody)
        })
    })
  }
}

const Client = Request()

export default Client
