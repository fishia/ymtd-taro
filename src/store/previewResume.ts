import { createSlice, PayloadAction } from '@reduxjs/toolkit'
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

function sortExp<T extends IResumeExp>(exps?: T[]): T[] {
  return sortBy(exps, exp => {
    const endDate = (Array.isArray(exp.duringDate) && exp.duringDate[1]) || exp.endDate
    if (endDate.startsWith('0000')) {
      return -Infinity
    }

    return -dayjs(endDate)
  })
}

export const previewResumeSliceName = 'previewResume'

export type PreviewResumeStoreType = INullableResume

const initialState: PreviewResumeStoreType = null as PreviewResumeStoreType

const previewResumeSlice = createSlice({
  name: previewResumeSliceName,
  initialState,
  reducers: {
    // 设置简历
    setPreviewResumeAction(_state, action: PayloadAction<INullableResume>) {
      return action.payload
    },

    // 设置简历基础信息
    setPreviewResumeBasicAction(state, action: PayloadAction<IResumeBasicInfo>) {
      return { ...(state || defaultResume), ...action.payload }
    },

    // 设置简历意向信息
    setPreviewResumeIntentAction(state, action: PayloadAction<IResumeIntentInfo[]>) {
      state!.intents = action.payload
    },

    // 添加或按 index 更新简历意向
    updatePreviewIntentAction(
      state,
      action: PayloadAction<{ intentInfo: IResumeIntentInfo; index: number }>
    ) {
      if (action.payload.index < 0) {
        state!.intents = [...state!.intents, action.payload.intentInfo]
      } else {
        state!.intents[action.payload.index] = action.payload.intentInfo
      }
    },

    // 添加或按 index 更新简历教育经历
    updatePreviewEduExpAction(
      state,
      action: PayloadAction<{ eduExp: IEducationExp; index: number }>
    ) {
      if (action.payload.index < 0) {
        state!.profileEdu = sortExp([...state!.profileEdu, action.payload.eduExp])
      } else {
        state!.profileEdu[action.payload.index] = action.payload.eduExp
      }
    },

    // 添加或按 index 更新简历工作经历
    updatePreviewJobExpAction(state, action: PayloadAction<{ jobExp: IJobExp; index: number }>) {
      if (action.payload.index < 0) {
        state!.profileJob = sortExp([...state!.profileJob, action.payload.jobExp])
      } else {
        state!.profileJob[action.payload.index] = action.payload.jobExp
      }
    },

    // 添加或按 index 更新简历项目经历
    updatePreviewProjExpAction(
      state,
      action: PayloadAction<{ projExp: IProjectExp; index: number }>
    ) {
      if (action.payload.index < 0) {
        state!.profileProject = sortExp([...state!.profileProject, action.payload.projExp])
      } else {
        state!.profileProject[action.payload.index] = action.payload.projExp
      }
    },

    // 按 index 删除意向信息
    omitPreviewIntentAction(state, action: PayloadAction<number>) {
      state!.intents = state!.intents.filter((_, index) => index !== action.payload)
    },

    // 按 index 删除简历教育经历
    omitPreviewEduExpAction(state, action: PayloadAction<number>) {
      state!.profileEdu = state!.profileEdu.filter((_, index) => index !== action.payload)
    },

    // 按 index 删除简历工作经历
    omitPreviewJobExpAction(state, action: PayloadAction<number>) {
      state!.profileJob = state!.profileJob.filter((_, index) => index !== action.payload)
    },

    // 按 index 删除简历项目经历
    omitPreviewProjExpAction(state, action: PayloadAction<number>) {
      state!.profileProject = state!.profileProject.filter((_, index) => index !== action.payload)
    },
  },
})

export default previewResumeSlice.reducer

const {
  setPreviewResumeAction,
  setPreviewResumeBasicAction,
  setPreviewResumeIntentAction,
  updatePreviewIntentAction,
  updatePreviewEduExpAction,
  updatePreviewJobExpAction,
  updatePreviewProjExpAction,
  omitPreviewIntentAction,
  omitPreviewEduExpAction,
  omitPreviewJobExpAction,
  omitPreviewProjExpAction,
} = previewResumeSlice.actions

// 设置简历
export const dispatchSetPreviewResume = (resume: INullableResume) =>
  void appStore.dispatch(setPreviewResumeAction(resume))

// 设置简历基础信息
export const dispatchSetPreviewResumeBasic = (resumeBasicInfo: IResumeBasicInfo) =>
  void appStore.dispatch(setPreviewResumeBasicAction(resumeBasicInfo))

// 设置简历意向信息
export const dispatchSetPreviewResumeIntent = (resumeIntentInfo: IResumeIntentInfo[]) =>
  void appStore.dispatch(setPreviewResumeIntentAction(resumeIntentInfo))

// 添加或按 index 更新意向信息
export const dispatchUpdatePreviewIntent = (intentInfo: IResumeIntentInfo, index: number) =>
  void appStore.dispatch(updatePreviewIntentAction({ intentInfo, index }))

// 添加或按 index 更新简历教育经历
export const dispatchUpdatePreviewEduExp = (eduExp: IEducationExp, index: number) =>
  void appStore.dispatch(updatePreviewEduExpAction({ eduExp, index }))

// 添加或按 index 更新简历工作经历
export const dispatchUpdatePreviewJobExp = (jobExp: IJobExp, index: number) =>
  void appStore.dispatch(updatePreviewJobExpAction({ jobExp, index }))

// 添加或按 index 更新简历项目经历
export const dispatchUpdatePreviewProjExp = (projExp: IProjectExp, index: number) =>
  void appStore.dispatch(updatePreviewProjExpAction({ projExp, index }))

// 按 index 删除意向信息
export const dispatchOmitPreviewIntent = (index: number) =>
  void appStore.dispatch(omitPreviewIntentAction(index))

// 按 index 删除简历教育经历
export const dispatchOmitPreviewEduExp = (index: number) =>
  void appStore.dispatch(omitPreviewEduExpAction(index))

// 按 index 删除简历工作经历
export const dispatchOmitPreviewJobExp = (index: number) =>
  void appStore.dispatch(omitPreviewJobExpAction(index))

// 按 index 删除简历项目经历
export const dispatchOmitPreviewProjExp = (index: number) =>
  void appStore.dispatch(omitPreviewProjExpAction(index))
