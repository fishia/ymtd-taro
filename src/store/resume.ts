import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { setStorageSync } from '@tarojs/taro'
import { sortBy } from 'lodash'
import dayjs from 'dayjs'

import {
  defaultResume,
  IEducationExp,
  IJobExp,
  INullableResume,
  IProjectExp,
  IResumeBasicInfo,
  IResumeExp,
  IResumeIntentInfo,
} from '@/def/resume'
import appStore from '.'
import { PROFILE } from '@/config'

function sortExp<T extends IResumeExp>(exps?: T[]): T[] {
  return sortBy(exps, exp => {
    const endDate = (Array.isArray(exp.duringDate) && exp.duringDate[1]) || exp.endDate

    if (endDate.startsWith('0000')) {
      return -Infinity
    }

    return -dayjs(endDate)
  })
}

export const resumeSliceName = 'resume'

export type ResumeStoreType = INullableResume

const initialState: ResumeStoreType = null as ResumeStoreType

const resumeSlice = createSlice({
  name: resumeSliceName,
  initialState,
  reducers: {
    // 设置简历
    setResumeAction(_state, action: PayloadAction<INullableResume>) {
      return action.payload
    },

    // 设置简历基础信息
    setResumeBasicAction(state, action: PayloadAction<IResumeBasicInfo>) {
      return { ...(state || defaultResume), ...action.payload }
    },

    // 设置简历意向信息
    setResumeIntentAction(state, action: PayloadAction<IResumeIntentInfo[]>) {
      state!.intents = action.payload
    },

    // 添加简历意向信息
    addResumeIntentAction(state, action: PayloadAction<IResumeIntentInfo>) {
      state!.intents = [...state!.intents, action.payload]
    },

    // 添加简历教育经历
    addEduExpAction(state, action: PayloadAction<IEducationExp>) {
      state!.profileEdu = sortExp([...state!.profileEdu, action.payload])
    },

    // 添加简历工作经历
    addJobExpAction(state, action: PayloadAction<IJobExp>) {
      state!.profileJob = sortExp([...state!.profileJob, action.payload])
    },

    // 添加简历项目经历
    addProjExpAction(state, action: PayloadAction<IProjectExp>) {
      state!.profileProject = sortExp([...state!.profileProject, action.payload])
    },

    // 删除简历意向信息
    deleteIntentAction(state, action: PayloadAction<number>) {
      state!.intents = state!.intents.filter(e => e.id !== action.payload)
    },

    // 删除简历教育经历
    deleteEduExpAction(state, action: PayloadAction<number>) {
      state!.profileEdu = state!.profileEdu.filter(e => e.id !== action.payload)
    },

    // 删除简历工作经历
    deleteJobExpAction(state, action: PayloadAction<number>) {
      state!.profileJob = state!.profileJob.filter(e => e.id !== action.payload)
    },

    // 删除简历项目经历
    deleteProjExpAction(state, action: PayloadAction<number>) {
      state!.profileProject = state!.profileProject.filter(e => e.id !== action.payload)
    },
  },
})

export default resumeSlice.reducer

const {
  setResumeAction,
  setResumeBasicAction,
  setResumeIntentAction,
  addResumeIntentAction,
  addEduExpAction,
  addJobExpAction,
  addProjExpAction,
  deleteIntentAction,
  deleteEduExpAction,
  deleteJobExpAction,
  deleteProjExpAction,
} = resumeSlice.actions

// 设置简历
export const dispatchSetResume = (resume: INullableResume) => {
  setStorageSync(PROFILE, resume)
  appStore.dispatch(setResumeAction(resume))
}

// 设置简历基础信息
export const dispatchSetResumeBasic = (resumeBasicInfo: IResumeBasicInfo) =>
  void appStore.dispatch(setResumeBasicAction(resumeBasicInfo))

// 设置简历意向信息
export const dispatchSetResumeIntent = (resumeIntentInfo: IResumeIntentInfo[]) =>
  void appStore.dispatch(setResumeIntentAction(resumeIntentInfo))

// 添加求职意向
export const dispatchAddResumeIntent = (resumeIntentInfo: IResumeIntentInfo) =>
  void appStore.dispatch(addResumeIntentAction(resumeIntentInfo))

// 添加简历教育经历
export const dispatchAddEduExp = (eduExp: IEducationExp) =>
  void appStore.dispatch(addEduExpAction(eduExp))

// 添加简历工作经历
export const dispatchAddJobExp = (jobExp: IJobExp) =>
  void appStore.dispatch(addJobExpAction(jobExp))

// 添加简历项目经历
export const dispatchAddProjExp = (projExp: IProjectExp) =>
  void appStore.dispatch(addProjExpAction(projExp))

// 删除简历意向信息
export const dispatchDeleteResumeIntent = (id: number) =>
  void appStore.dispatch(deleteIntentAction(id))

// 删除简历教育经历
export const dispatchDeleteEduExp = (id: number) => void appStore.dispatch(deleteEduExpAction(id))

// 删除简历工作经历
export const dispatchDeleteJobExp = (id: number) => void appStore.dispatch(deleteJobExpAction(id))

// 删除简历项目经历
export const dispatchDeleteProjExp = (id: number) => void appStore.dispatch(deleteProjExpAction(id))
