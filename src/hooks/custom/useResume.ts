import { useCallback } from 'react'

import { INullableResume } from '@/def/resume'
import { dispatchSetResume, useAppSelector } from '@/store'
import { fetchResumeApi } from '@/apis/resume'
import { checkResumeErrorBlock } from '@/services/ResumeService'
import { refreshUserInfo } from '@/services/AccountService'
import { setStorageSync } from '@tarojs/taro'
import { PROFILE } from '@/config'

// 当前简历
export function useCurrentResume(): INullableResume {
  return useAppSelector(store => store.resume)
}

export async function refreshCurrentResumeFn() {
  return fetchResumeApi().then(resume => {
    setStorageSync(PROFILE, resume)
    dispatchSetResume(resume)

    return resume
  })
}

// 刷新当前简历
export function useRefreshCurrentResume(): Func0<Promise<INullableResume>> {
  const refreshCurrentResume = useCallback(
    () =>
      fetchResumeApi().then(resume => {
        setStorageSync(PROFILE, resume)
        dispatchSetResume(resume)
        refreshUserInfo()

        return resume
      }),
    []
  )

  return refreshCurrentResume
}

// 当前简历是否已通过校验
export function useCurrentResumeChecked(): boolean {
  const resume = useAppSelector(store => store.resume)

  return !checkResumeErrorBlock(resume)
}

// 当前简历中错误的 block
export function useCurrentResumeErrorBlock(): string | null {
  const resume = useAppSelector(store => store.resume)

  return checkResumeErrorBlock(resume)
}

export { useUserProfileId as useResumeId } from '@/hooks/custom/useUser'

export { useResumeOptions } from '@/services/ResumeService'
