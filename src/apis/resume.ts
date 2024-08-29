import { getStorageSync } from '@tarojs/taro'
import dayjs from 'dayjs'

import { PROFILE } from '@/config'
import { IFormError } from '@/def/client'
import { IPair } from '@/def/common'
import {
  ICurrentKeyword,
  IEducationExp,
  IJobExp,
  IProjectExp,
  IResume,
  IResumeBasicInfo,
  IResumeIntegrity,
  IResumeIntentInfo,
  IFunctionTypeKeyword,
  ISearchType,
  IFunctionType,
  IAddKeywordParams,
  IResumeExp,
  IResumeIntentsInfo,
  IResumeAttachmentUploadResult,
} from '@/def/resume'
import { getNewLoginIntent, isSchoolVersion, setNewLoginIntent } from '@/services/AccountService'
import { getDefaultAvatarBySex, getRandomAvatarBySex } from '@/services/ResumeService'
import appStore from '@/store'
import { getVarParam } from '@/utils/dataRangers'
import { mpIsInIos } from '@/utils/utils'

import Client from './client'
import FileClient from './client/file'

// 新表单校验错误结果格式，注意此时 success 为 true 不会走 catch 逻辑
interface IFormCheckFailed<FormType> {
  invalidResult: { errorField: keyof FormType; errorMessage: string }[]
}

// 处理表单新字段校验结果，转为旧版结构
async function transformFormCheckFailedResult<T = any>(checkResult: T): Promise<T> {
  return new Promise((resolve, reject) => {
    if (checkResult && typeof checkResult === 'object' && (checkResult as any).invalidResult) {
      const checkErrorInfo: IFormCheckFailed<T> = checkResult as any

      const errors: Partial<Record<keyof T, string[]>> = {}
      checkErrorInfo.invalidResult.forEach(({ errorField, errorMessage }) => {
        errors[errorField] = [errorMessage]
      })

      const formError: IFormError<T> = {
        code: 1,
        success: false,
        errorCode: 500,
        errors,
        message: '填写的信息有空缺或不符合要求，请检查修改后重新保存',
        errorMessage: '填写的信息有空缺或不符合要求，请检查修改后重新保存',
        data: errors,
      }

      reject(formError)
    } else {
      resolve(checkResult)
    }
  })
}

// 拉取用户简历
export async function fetchResumeApi(): Promise<IResume> {
  const userId = appStore.getState().user?.id || getStorageSync(PROFILE)?.id
  return Client({ url: '/ymtd-profile/profiles/getProfileInfo', data: { userId } })
}

// 拉取简历基础信息
export async function fetchResumeBasicApi(): Promise<IResumeBasicInfo> {
  return Client<IResumeBasicInfo>({
    url: `/ymtd-profile/profile/basic`,
    data: { id: appStore.getState().resume?.id },
  })
    .then(basicInfo => {
      const newBasicInfo = { ...basicInfo }
      if (!newBasicInfo.avatar) {
        newBasicInfo.avatar = getDefaultAvatarBySex(newBasicInfo.sex)
      }

      return newBasicInfo
    })
    .then(transformFormCheckFailedResult)
}

// 添加简历基础信息
export async function createResumeBasicApi(basicInfo: IResumeBasicInfo): Promise<IResumeBasicInfo> {
  const isSchool = isSchoolVersion()
  let params = { userId: appStore.getState().user?.id, ...basicInfo },
    ab_sdk_version = getVarParam('ab_sdk_version')
  if (ab_sdk_version) Object.assign(params, { abSdkVersion: ab_sdk_version })
  return Client({
    url: `/ymtd-profile/profile/basic`,
    method: 'POST',
    data: {
      ...params,
      platForm: isSchool ? '校园版' : '社招版',
      eventName: appStore.getState().common.jdInviteCode ? '顾问合作拉简历' : '',
    },
    reportAddTags: ['core', 'resume', 'createresume'],
  }).then(transformFormCheckFailedResult)
}

// 更新简历基础信息
export async function updateResumeBasicApi(basicInfo: IResumeBasicInfo): Promise<IResumeBasicInfo> {
  return Client({
    url: `/ymtd-profile/profile/basic`,
    method: 'PUT',
    data: { ...basicInfo, id: appStore.getState().resume?.id },
  }).then(transformFormCheckFailedResult)
}

function handleFetchEduExpItem(eduItem: IEducationExp): IEducationExp {
  const edu = { ...eduItem } as any
  if (Number(edu.education) <= 2) {
    edu.school = ''
    edu.schoolId = 0
    edu.major = ''
    edu.majorId = 0
  }

  return edu
}

function fetchExpGenerator<T>(field: string): (expId: number) => Promise<T> {
  return async expId =>
    Client({ url: `/ymtd-profile/profile/${field}`, data: { id: expId } }).then(data => ({
      ...data,
      id: expId,
    }))
}

function appendExpGenerator<T extends IResumeExp>(field: string): (expItem: T) => Promise<T> {
  return async expItem => {
    const data = { ...expItem, profileId: appStore.getState().resume?.id }

    ;(data as any).id = undefined
    ;(data as any).majorId = undefined
    ;(data as any).schoolId = undefined

    return Client({ url: `/ymtd-profile/profile/${field}`, method: 'POST', data }).then(
      transformFormCheckFailedResult
    )
  }
}

function updateExpGenerator<T extends { id: number | string }>(
  field: string
): (expItem: T) => Promise<T> {
  return async expItem =>
    Client({ url: `/ymtd-profile/profile/${field}`, method: 'PUT', data: expItem }).then(
      transformFormCheckFailedResult
    )
}

function deleteExpGenerator(field: string): (expItemId: number) => Promise<void> {
  return async expItemId =>
    Client({ url: `/ymtd-profile/profile/${field}?id=${expItemId}`, method: 'DELETE' })
}

// 检查简历状态
export async function checkResumeApi(pId: string): Promise<IResumeIntegrity> {
  return Client({ url: `/profiles/${pId}/check` })
}

// 拉取教育经历
export const fetchEduExpApi = id =>
  fetchExpGenerator<IEducationExp>('edu')(id).then(handleFetchEduExpItem)
// 添加教育经历
export const appendEduExpApi = edu =>
  appendExpGenerator<IEducationExp>('edu')(handleFetchEduExpItem(edu))
// 更新教育经历
export const updateEduExpApi = edu =>
  updateExpGenerator<IEducationExp>('edu')(handleFetchEduExpItem(edu))
// 删除教育经历
export const deleteEduExpApi = deleteExpGenerator('edu')

// 拉取工作经历
export const fetchJobExpApi = fetchExpGenerator<IJobExp>('job')
// 添加工作经历
export const appendJobExpApi = appendExpGenerator<IJobExp>('job')
// 更新工作经历
export const updateJobExpApi = updateExpGenerator<IJobExp>('job')
// 删除工作经历
export const deleteJobExpApi = deleteExpGenerator('job')

// 拉取项目经历
export const fetchProjApi = fetchExpGenerator<IProjectExp>('project')
// 添加项目经历
export const appendProjExpApi = appendExpGenerator<IProjectExp>('project')
// 更新项目经历
export const updateProjExpApi = updateExpGenerator<IProjectExp>('project')
// 删除项目经历
export const deleteProjExpApi = deleteExpGenerator('project')

// 拉取简历表单 Options 数据（当日内走缓存）
export async function fetchResumeOptionsApi() {
  return Client({ url: '/options/forms', cacheKey: 'com.ymtd.m.cache.resume_options' })
}

// PC 扫码登录创建简历
export async function fetchQRCodeLoginApi(sign: string) {
  return Client({ url: '/qrcode/login', method: 'POST', data: { sign } })
}

// 从微信聊天文件中上传简历文件
export async function uploadResumeByWxDocApi(filePath: string, fileName?: string): Promise<number> {
  return FileClient({
    url: '/ymtd-profile/profiles/uploadProfile',
    filePath,
    fileName,
    data: { type: 0 },
    reportAddTags: ['resume'],
  }).then(data => data.id)
}

// 获取微信上传简历文件的结果
export async function fetchUploadResumeResultApi(id: number): Promise<IResume | null> {
  return Client({ url: `/ymtd-profile/profilePath/selectStatus`, data: { id } }).then(res => {
    if (!res.isOver) {
      return null
    }

    res.info.intents = res.info.intents.map(item => {
      const newItem = { ...item }
      delete newItem.id
      delete newItem.positionPreference

      return newItem
    })

    const loginIntent = getNewLoginIntent()
    if (loginIntent && res.info.intents.length < 3) {
      res.info.intents.push(loginIntent)
    }

    res.info.avatar = getRandomAvatarBySex(res.info.sex)
    res.info.profileEdu = res.info.profileEdu!.map(handleFetchEduExpItem)

    res.info.pathId = id

    return res.info
  })
}

// 上传附件简历
export async function uploadResumeAttachmentByWxDocApi(
  filePath: string,
  fileName?: string
): Promise<IResumeAttachmentUploadResult> {
  return FileClient({
    url: '/ymtd-capp/profile/uploadProfileAttachment',
    name: 'attProfileFile',
    filePath,
    fileName,
    data: { userId: appStore.getState().user?.id || 0 },
    reportAddTags: ['resumeAttachment'],
  })
}

// 上传简历头像
export async function uploadAvatarApi(filePath: string, fileName?: string): Promise<string> {
  return FileClient({ url: '/auth/avatar', filePath, fileName }).then(data => data.path)
}

enum ResumeCompleteCheckErrorModuleEnum {
  BASIC = 0,
  INTENT,
  JOB,
  PROJ,
  EDU,
}

type IResumeCompleteCheckError = Array<{
  invalidModule: ResumeCompleteCheckErrorModuleEnum
  invalidData: Array<{
    itemIndex: number
    itemResult: Array<{
      errorField: string
      errorMessage: string
    }>
  }>
}>

// 处理表单新字段校验结果，转为旧版结构
async function transformFormAllFieldCheckFailedResult<T>(checkResult: T): Promise<T> {
  return new Promise((resolve, reject) => {
    if (checkResult && Array.isArray(checkResult)) {
      const checkErrorInfo: IResumeCompleteCheckError = checkResult as any
      const tipsMap = ['基本信息', '求职意向', '工作经历', '项目经历', '教育经历']

      const errorInfo = checkErrorInfo[0]!
      const errorBlockInfo = errorInfo.invalidData[0]!
      const errorFieldInfo = errorBlockInfo.itemResult[0]!

      const indexTips = errorInfo.invalidModule <= 1 ? '' : `的第${errorBlockInfo.itemIndex + 1}项`
      const message = `简历中${tipsMap[errorInfo.invalidModule]}部分${indexTips}，${
        errorFieldInfo.errorMessage
      }`

      const formError = {
        code: 1,
        success: false,
        errorCode: 500,
        message,
        errorMessage: message,
        data: null,
      }

      reject(formError)
    } else {
      resolve(checkResult)
    }
  })
}

// 提交整个简历所有字段
export async function completedSetResumeApi(resume: IResume, wayName?: string): Promise<void> {
  const newData = { ...resume } as Partial<IResume>
  newData.birthDate = `${dayjs(newData.birthDate).format('YYYY-MM')}-01`
  newData.integrity = undefined
  newData.profileEdu = newData.profileEdu!.map(handleFetchEduExpItem)
  newData.intents = newData.intents!.map(item => {
    const newItem = { ...item } as any
    newItem.positionPreferenceName = undefined
    newItem.userId = undefined
    newItem.id = undefined

    return newItem
  })
  const isSchool = isSchoolVersion()
  const ab_sdk_version = getVarParam('ab_sdk_version')
  const isIos = mpIsInIos()
  if (ab_sdk_version) Object.assign(newData, { abSdkVersion: ab_sdk_version })

  setNewLoginIntent(null)

  return Client({
    url: '/ymtd-profile/profiles/saveProfileInfo',
    method: 'POST',
    data: {
      ...newData,
      platForm: isSchool ? '校园版' : '社招版',
      wayName,
      modelType: isIos ? 2 : 1,
    },
    reportAddTags: ['core', 'resume'],
  }).then(transformFormAllFieldCheckFailedResult)
}

// 简历大赛获取状态
export async function fetchResumeCompetitionCompletedApi(type: string | number): Promise<boolean> {
  return Client({ url: `/activities/profile-paths/${type}/check` }).then(data => data.exists)
}

// 简历大赛上传简历
export async function uploadResumeCompetitionApi(
  type: string | number,
  filePath: string,
  fileName: string
): Promise<number> {
  return FileClient({
    url: '/profile-paths',
    filePath,
    fileName,
    data: { type },
  }).then(data => data.id)
}

export interface IBackgroundUrl {
  completedUrl: string
  entranceUrl: string
}

export async function competitionEntranceApi(type: string): Promise<IBackgroundUrl> {
  return Client({ url: '/ymtd-profile/profiles/competitionEntrance', data: { type } })
}

// 获取Ai职位类别、关键词
export async function fetchAIforecastJdApi(
  profile_job_id: number,
  type: ISearchType
): Promise<IFunctionType | IPair[]> {
  return Client({ url: `/ai/forecast-jd`, data: { profile_job_id, type } })
}

// 职位类别反馈
export async function fetchFeedbackFunctionTypeApi(function_type_label: string): Promise<void> {
  return Client({ url: `/feedback/function-type`, method: 'POST', data: { function_type_label } })
}

// 关键词
export async function fetchFunctionTypeKeywordApi(
  function_type: string
): Promise<IFunctionTypeKeyword> {
  return Client({ url: `/options/function-type-keywords`, data: { function_type } })
}

// 添加自定义关键词
export async function fetchAddKeywordsApi(data: IAddKeywordParams): Promise<ICurrentKeyword> {
  return Client({ url: `/custom/function-type-keywords`, method: 'POST', data })
}

// 获取用户历史求职意向转化结果（求职意向列表）
export async function fetchHistoryUserIntentsApi(): Promise<IResumeIntentsInfo> {
  return Client({ url: `/ymtd-profile/users/intents` })
}

// 批量保存用户求职意向
export async function fetchBatchSaveIntentsApi(
  data: IResumeIntentInfo[]
): Promise<IResumeIntentInfo[]> {
  data.forEach(item => ((item as any).positionPreference = undefined))
  return Client({ url: `/ymtd-user/intents/do/confirm`, method: 'POST', data })
}

// 获取当前用户的求职状态（首页）
export async function fetchUserIntentsApi(): Promise<IResumeIntentInfo[]> {
  return Client({ url: `/ymtd-user/users/intents` })
}

// 新增一条求职意向
export async function appendUserIntentApi(
  data: IResumeIntentInfo,
  isCreate?: boolean
): Promise<void> {
  const postData: any = { ...data }
  postData.isCreateProfile = isCreate ? 1 : 0
  postData.modelType = mpIsInIos() ? 2 : 1

  return Client({ url: '/ymtd-user/intents', method: 'POST', data: postData })
}

// 获取当前用户的某一条求职意向
export async function fetchUserIntentDetailByIdApi(
  id: number | string
): Promise<IResumeIntentInfo> {
  return Client({ url: `/ymtd-user/intents/${id}` }).then(data => {
    const newData = { ...data }
    newData.positionPreference = undefined
    newData.positionPreferenceName = undefined

    return newData
  })
}

// 更新当前用户的某条求职意向
export async function updateUserIntentInfoApi(data: IResumeIntentInfo): Promise<number> {
  return Client({ url: `/ymtd-user/intents/${data.id}`, method: 'PUT', data })
}

// 删除某条求职意向
export async function deleteUserIntentInfoApi(id: number | string): Promise<void> {
  return Client({ url: `/ymtd-user/intents/${id}`, method: 'DELETE' })
}

// 同步简历
export async function SyncProfile(): Promise<void> {
  return Client({ url: `/ymtd-capp/profile/syncCts`, method: 'POST' })
}

// 是否有关联简历
export async function isRelevance(): Promise<number> {
  return Client({ url: `/ymtd-capp/profile/hasRelation` })
}

// 【App 专用】从微信聊天文件中上传简历文件
export async function appUploadResumeByWxDocApi(
  filePath: string,
  fileName?: string,
  userId?: string
): Promise<number> {
  return FileClient({
    url: '/ymtd-capp/app/profile/uploadProfile',
    filePath,
    fileName,
    data: { type: 0, userId },
    header: { Authorization: null },
  }).then(data => data.pathId)
}

// 【App 专用】获取微信上传简历文件的结果
export async function appFetchUploadResumeResultApi(
  pathId: number,
  userId?: string
): Promise<IResume | null> {
  return Client({
    url: `/ymtd-capp/app/profile/profileParseStatus`,
    data: { pathId, userId },
    header: { Authorization: null },
  }).then(res => {
    if (!res.parseComplete) {
      return null
    }

    res.parseResult.pathId = pathId

    return res.parseResult
  })
}

// 【App 专用】从微信聊天文件中上传附件简历
export async function appUploadResumeAttachmentByWxDocApi(
  filePath: string,
  fileName?: string,
  userId?: string
): Promise<IResumeAttachmentUploadResult> {
  return FileClient({
    url: '/ymtd-capp/profile/uploadProfileAttachment',
    name: 'attProfileFile',
    filePath,
    fileName,
    data: { userId },
    header: { Authorization: null },
  })
}

// 校验字符串中是否包含敏感词
export async function checkSensitiveWordsApi(word: string = ''): Promise<boolean> {
  return Client({ url: '/ymtd-bapp/hr/checkSensitiveWords', method: 'POST', data: { word } }).catch(
    () => true
  )
}
