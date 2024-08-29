import { uploadFile } from '@tarojs/taro'
import { initial } from 'lodash'

import { IError, IRequestOption } from '@/def/client'
import { reportLog } from '@/utils/reportLog'

import { handleRequestOption } from './handleRequestOption'

export interface IFileRequestOptions extends IRequestOption {
  filePath: string
  fileName?: string
  name?: string
}

export default async function FileClient<T = any>(options: IFileRequestOptions): Promise<T> {
  const {
    name = 'file',
    fileName: originFilename,
    data: originFormData,
    reportAddTags = [],
  } = options
  const requestOption = handleRequestOption(options)

  delete requestOption.header!['Content-Type']

  const fileName = initial((originFilename || '').split('.')).join('')
  const formData = fileName ? { ...originFormData, filename: fileName } : { ...originFormData }

  return uploadFile({ ...requestOption, name, fileName, formData })
    .then(res => {
      // 注意上传文件时，返回值 res.data 会被微信序列化成字符串
      const resDataJson = JSON.parse(res.data || '{}')
      const responseData = resDataJson.data || {}

      if (res.statusCode >= 400 || resDataJson.success === false) {
        const errorBody: IError = {
          code: resDataJson.code || res.statusCode || 501,
          message: resDataJson.message || '上传时出现错误，请稍后重试',
          errorCode: resDataJson.code || res.statusCode || 501,
          errorMessage: resDataJson.message || '上传时出现错误，请稍后重试',
          data: responseData,
          success: false,
        }

        reportLog('api', `upload:${requestOption.url}`, ...reportAddTags).warn(
          'request params:',
          requestOption,
          'response:',
          errorBody
        )

        throw errorBody
      }

      return responseData
    })
    .catch(errorResponse => {
      reportLog('api', `upload:${requestOption.url}`, ...reportAddTags).warn(
        'request params:',
        requestOption,
        'response:',
        errorResponse
      )

      throw errorResponse
    })
}
