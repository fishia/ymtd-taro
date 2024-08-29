import { useCallback, useMemo } from 'react'

import {
  INullableResume,
  IResumeBasicInfo,
  defaultBasicInfo,
  IResume,
  IResumeExp,
} from '@/def/resume'
import {
  dispatchUpdatePreviewEduExp,
  dispatchUpdatePreviewJobExp,
  dispatchUpdatePreviewProjExp,
  dispatchOmitPreviewEduExp,
  dispatchOmitPreviewJobExp,
  dispatchOmitPreviewProjExp,
  dispatchSetPreviewResume,
  dispatchSetPreviewResumeBasic,
  useAppSelector,
} from '@/store'
import { checkResumeErrorBlock } from '@/services/ResumeService'

// state hook of 预览中的简历
export function usePreviewResume(): [
  INullableResume,
  React.Dispatch<React.SetStateAction<INullableResume>>
] {
  const currentPreviewResume = useAppSelector(store => store.previewResume)

  return [currentPreviewResume, dispatchSetPreviewResume]
}

// state hook of 预览中的简历的基本信息
export function usePreviewResumeBasicInfo(): [
  IResumeBasicInfo,
  React.Dispatch<React.SetStateAction<IResumeBasicInfo>>
] {
  const basicInfo = useAppSelector(store => store.previewResume) || defaultBasicInfo

  return [basicInfo, dispatchSetPreviewResumeBasic]
}

type ResumeListMap = Pick<IResume, 'profileEdu' | 'profileJob' | 'profileProject'>

const updateExpDispatcherMap = {
  profileEdu: dispatchUpdatePreviewEduExp,
  profileJob: dispatchUpdatePreviewJobExp,
  profileProject: dispatchUpdatePreviewProjExp,
}

const omitExpDispatcherMap = {
  profileEdu: dispatchOmitPreviewEduExp,
  profileJob: dispatchOmitPreviewJobExp,
  profileProject: dispatchOmitPreviewProjExp,
}

const defaultExpList = []

// list state hook of 预览中的简历的经历信息
export function usePreviewResumeList<T extends IResumeExp>(type: keyof ResumeListMap) {
  const list = (useAppSelector(store => store.previewResume?.[type] ?? defaultExpList) as any) as T

  const updateListItem = useCallback(
    (item: T, index: number) => {
      updateExpDispatcherMap[type](item as any, index)
    },
    [type]
  )
  const omitListItem = useCallback(
    (index: number) => {
      omitExpDispatcherMap[type](index)
    },
    [type]
  )

  return { list, updateListItem, omitListItem }
}

// 预览中的简历是否符合校验条件
export function usePreviewResumeChecked(): boolean {
  const resume = useAppSelector(store => store.previewResume)

  return useMemo(() => !checkResumeErrorBlock(resume), [resume])
}

// 预览中的简历的错误 block
export function usePreviewResumeErrorBlock(): string | null {
  const resume = useAppSelector(store => store.previewResume)

  return useMemo(() => checkResumeErrorBlock(resume), [resume])
}
