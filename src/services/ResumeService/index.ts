import { setStorageSync } from '@tarojs/taro'
import _ from 'lodash'
import R from 'ramda'
import { useState } from 'react'

import { fetchResumeApi, fetchResumeOptionsApi } from '@/apis/resume'
import { PROFILE } from '@/config'
import {
  defaultBasicInfo,
  defaultResumeOptions,
  INullableResume,
  IResume,
  IResumeBasicInfo,
  IResumeIntentInfo,
  IResumeOptions,
} from '@/def/resume'
import store, { dispatchSetResume } from '@/store'

import { getResumeOptions, setResumeOptions } from './resumeOptions'

export * from './avatar'
export * from './attachment'

let flag: any = null
// 可确保 store 中的简历为最新
export async function ensureResume(p?: any) {
  const resume = store.getState().resume
  if (flag) {
    return flag
  }
  flag = new Promise(async resolve => {
    try {
      if (!resume) {
        fetchResumeApi()
          .then(data => {
            setStorageSync(PROFILE, data)
            dispatchSetResume(data)
            flag = null
            resolve(data)
          })
          .catch(_.noop)
      } else {
        setStorageSync(PROFILE, resume)
        flag = null
        resolve(resume)
      }
    } catch (error) {
      flag = null
      resolve(p)
    }
  })
  return flag
}

// 在 .then() 链中使用，后续步骤可确保 resumeOptions 已加载
export async function ensureResumeOptions(p?: any) {
  const resumeOptions = getResumeOptions()

  if (!resumeOptions) {
    await fetchResumeOptionsApi()
      .then(data => setResumeOptions(data))
      .catch(_.noop)
  }

  return Promise.resolve(p)
}

// 尝试自存储和 API 获取 resumeOptions 的钩子，始终会返回一个对象确保不出错
export function useResumeOptions(): IResumeOptions {
  const [options, setOptions] = useState<Nullable<IResumeOptions>>(getResumeOptions())

  if (!options) {
    fetchResumeOptionsApi()
      .then(data => {
        setOptions(data)
        setResumeOptions(data)
      })
      .catch(_.noop)
  }

  return (options || defaultResumeOptions) as IResumeOptions
}

// 自简历对象中提取基础信息
export function extractResumeBasicInfo(resume: IResume): IResumeBasicInfo {
  return R.pick(R.keys(defaultBasicInfo), resume)
}

const noCheck = () => true

const valueNotNull = str => Boolean(str)
const optionNotNull = val => Boolean(val) && String(val) !== '0'
const arrayNotNull = list => list && list.length > 0

// 简历意向部分是否为空
export function isResumeIntentOk(intents?: IResumeIntentInfo[]): boolean {
  if (!intents || intents.length <= 0) {
    return false
  }

  for (const intent of intents) {
    if (
      !R.where(
        {
          cityId: optionNotNull,
          expectPosition: optionNotNull,
          expectSalaryFrom: valueNotNull,
          expectSalaryTo: valueNotNull,
          workType: optionNotNull,
        },
        intent
      )
    ) {
      return false
    }
  }

  return true
}

// 前端校验简历完整性
export function checkResumeErrorBlock(resume: INullableResume): string | null {
  if (!resume) {
    return 'no-resume'
  }

  // 校验基本信息中的必填项
  const isBasicOk = R.where(
    {
      name: valueNotNull,
      sex: optionNotNull,
      cityId: optionNotNull,
      cityName: valueNotNull,
      birthDate: valueNotNull,
      workBeginTime: optionNotNull,
    },
    resume
  )
  if (!isBasicOk) {
    return 'basicinfo-block'
  }

  // 求职意向不能缺失
  const isIntentOk = isResumeIntentOk(resume.intents)
  if (!isIntentOk) {
    return 'intent-block'
  }

  // 教育经历不能为空
  if (R.isEmpty(resume.profileEdu || [])) {
    return 'eduexp-block'
  }

  const isStudent = resume?.workBeginTime === '0000-00-00'
  // 教育经历不能有缺失必填项
  for (const edu of resume.profileEdu) {
    if (
      !R.where(
        {
          education: optionNotNull,
          startDate: valueNotNull,
          endDate: valueNotNull,
          major: Number(edu.education) <= 2 ? noCheck : valueNotNull,
          school: Number(edu.education) <= 2 ? noCheck : valueNotNull,
          schoolExperience: isStudent && Number(edu.education) >= 4 ? valueNotNull : noCheck,
        },
        edu
      )
    ) {
      return 'eduexp-block'
    }
  }

  // 工作经历不能为空
  if (!isStudent && R.isEmpty(resume.profileJob || [])) {
    return 'jobexp-block'
  }

  // 工作经历不能有缺失必填项
  for (const job of resume.profileJob) {
    if (
      !R.where(
        {
          company: valueNotNull,
          position: valueNotNull,
          functionType: valueNotNull,
          workDesc: valueNotNull,
          startDate: valueNotNull,
          endDate: valueNotNull,
        },
        job
      )
    ) {
      return 'jobexp-block'
    }
  }

  // 项目经历不能有缺失必填项
  for (const proj of resume.profileProject) {
    if (
      !R.where(
        {
          name: valueNotNull,
          startDate: valueNotNull,
          endDate: valueNotNull,
        },
        proj
      )
    ) {
      return 'jobexp-block'
    }
  }

  return null
}
