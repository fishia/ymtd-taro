import { chooseMessageFile, hideHomeButton, useReady, useRouter } from '@tarojs/taro'
import { last, noop } from 'lodash'
import { useState } from 'react'

import { appUploadResumeAttachmentByWxDocApi } from '@/apis/resume'
import { ALLOW_RESUME_ATTACHMENT_TYPE } from '@/config'
import { IResumeAttachmentUploadResult } from '@/def/resume'
import useToast from '@/hooks/custom/useToast'
import MainLayout from '@/layout/MainLayout'

import ErrorPanel from './ErrorPanel'
import ProcessPanel from './ProcessPanel'

import './index.scss'

export const uploadResumeAttachmentEventKey = 'resume-upload-attachment'

enum PageStatusEnum {
  READY = 'ready',
  PENDING = 'pending',
  ERROR = 'error',
  OK = 'ok',
}

export default function AppUploadResumeFile() {
  const { userId } = useRouter().params
  const showToast = useToast()

  const [result, setResult] = useState<IResumeAttachmentUploadResult>()
  const [status, setStatus] = useState(PageStatusEnum.READY)
  const [error, setError] = useState<Nullable<string>>(null)

  const setErrorStatus = (errorMessage: string) => {
    setError(errorMessage)
    setStatus(PageStatusEnum.ERROR)
  }

  const wxUploadHandler = async () => {
    try {
      setError(null)
      setStatus(PageStatusEnum.READY)

      const chooseFileResult = await chooseMessageFile({ count: 1 }).catch(noop)

      const fileInfo = chooseFileResult?.tempFiles?.[0]
      if (!fileInfo) {
        setErrorStatus('请选择要上传的文件')
        return
      } else if (fileInfo.size > 20 * 1024 * 1024) {
        setErrorStatus('文件过大，请选择20M以内的文件')
        return
      } else if (
        !ALLOW_RESUME_ATTACHMENT_TYPE.includes(last(fileInfo.path.split('.'))!.toLowerCase())
      ) {
        setErrorStatus('文件格式错误，请选择 word/pdf/jpg/jpeg/png 格式')
        return
      }

      setStatus(PageStatusEnum.PENDING)
      const attachmentInfo = await appUploadResumeAttachmentByWxDocApi(
        fileInfo.path,
        fileInfo.name,
        userId
      )
      setResult(attachmentInfo)
      setStatus(PageStatusEnum.OK)
    } catch {
      setErrorStatus('出现未知错误，请重试')
    }
  }

  useReady(() => {
    hideHomeButton()
    wxUploadHandler()
  })

  const jumpErrorHandler = () => {
    setStatus(PageStatusEnum.READY)
    showToast({ content: '跳转失败，请手动切换至医脉同道 App' })
  }

  return (
    <MainLayout className="app-upload-resume-file">
      {status === PageStatusEnum.READY ? null : status === PageStatusEnum.PENDING ||
        status === PageStatusEnum.OK ? (
        <ProcessPanel
          onJumpError={jumpErrorHandler}
          isFinished={status === PageStatusEnum.OK}
          result={result}
        />
      ) : (
        <ErrorPanel
          error={error}
          onUpload={wxUploadHandler}
          onJumpError={jumpErrorHandler}
          showOthers
        />
      )}
    </MainLayout>
  )
}
