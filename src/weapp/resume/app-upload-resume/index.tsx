import { chooseMessageFile, hideHomeButton, useRouter } from '@tarojs/taro'
import c from 'classnames'
import { last, noop } from 'lodash'
import { FC, useCallback, useEffect, useState } from 'react'

import { appFetchUploadResumeResultApi, appUploadResumeByWxDocApi } from '@/apis/resume'
import { ALLOW_RESUME_FILE_TYPE } from '@/config'
import { IResume } from '@/def/resume'
import useToast from '@/hooks/custom/useToast'
import MainLayout from '@/layout/MainLayout'
import { polling } from '@/services/NetworkService'
import appStore from '@/store'
import {
  resetDataRangersUserId,
  sendDataRangersEventWithUrl,
  setDataRangersUserId,
} from '@/utils/dataRangers'

import ErrorPanel from './ErrorPanel'
import GuidePanel from './GuidePanel'
import ProcessPanel from './ProcessPanel'

import './index.scss'

const AppUploadResume: FC = () => {
  const { userId } = useRouter().params
  const showToast = useToast()

  const [resumeInfo, setResumeInfo] = useState<Nullable<IResume>>(null)

  const [error, setError] = useState<Nullable<string>>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const [isShowOthers, setIsShowOthers] = useState(false)

  useEffect(() => {
    void hideHomeButton()
    setDataRangersUserId(userId!)

    return () => {
      resetDataRangersUserId()

      if (appStore.getState().user) {
        setDataRangersUserId(appStore.getState().user!.id)
      }
    }
  }, [userId])

  const uploadResumeFile = useCallback(
    async function onLoadFn() {
      const pageStack = getCurrentPages() || []
      const currentPage = pageStack[pageStack.length - 1]
      const prePage = pageStack[pageStack.length - 2]

      sendDataRangersEventWithUrl('UploadcvClick', {
        page_name: currentPage?.config?.navigationBarTitleText || '',
        prepage_name: prePage?.config?.navigationBarTitleText || '',
      })

      try {
        const chooseFileResult = await chooseMessageFile({ count: 1 }).catch(noop)

        const fileInfo = chooseFileResult?.tempFiles?.[0]
        if (!fileInfo) {
          return
        } else if (
          !ALLOW_RESUME_FILE_TYPE.includes(last(fileInfo.path.split('.'))!.toLowerCase())
        ) {
          setIsShowOthers(true)
          setError('文件格式不对')
          return
        } else if (fileInfo.size > 20 * 1024 * 1024) {
          if (error) {
            setIsShowOthers(true)
          }
          setError('文件过大，请重新上传')
          return
        }

        setError(null)
        setIsProcessing(true)
        const fileKey = await appUploadResumeByWxDocApi(fileInfo.path, fileInfo.name, userId)
        const resume = await polling<IResume>(
          () => appFetchUploadResumeResultApi(fileKey, userId),
          Boolean
        )

        setResumeInfo(resume)
      } catch {
        if (error) {
          setIsShowOthers(true)
        }
        setError('解析失败，请重新上传')
      }
    },
    [error, userId]
  )

  const errorHandler = () => {
    showToast({ content: '跳转失败，请手动切换至医脉同道 App' })
  }

  return (
    <MainLayout className={c('app-upload-resume', error || isProcessing ? 'bg-custom' : '')}>
      {error ? (
        <ErrorPanel
          error={error}
          showOthers={isShowOthers}
          onUpload={uploadResumeFile}
          onJumpError={errorHandler}
        />
      ) : isProcessing ? (
        <ProcessPanel
          isFinished={resumeInfo !== null}
          resume={resumeInfo}
          onJumpError={errorHandler}
        />
      ) : (
        <GuidePanel onUpload={uploadResumeFile} />
      )}
    </MainLayout>
  )
}

export default AppUploadResume
