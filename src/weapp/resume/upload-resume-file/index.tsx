import { View, Image } from '@tarojs/components'
import { chooseMessageFile, eventCenter, navigateBack, navigateTo } from '@tarojs/taro'
import { last, noop } from 'lodash'
import { useCallback, useEffect, useState } from 'react'

import { uploadResumeAttachmentByWxDocApi } from '@/apis/resume'
import arrowIcon from '@/assets/imgs/cell-arrow.png'
import { ALLOW_RESUME_ATTACHMENT_TYPE } from '@/config'
import { IResumeAttachmentUploadResult } from '@/def/resume'
import { IUserInfo } from '@/def/user'
import MainLayout from '@/layout/MainLayout'
import { previewCurrentResumeAttachment } from '@/services/ResumeService'
import appStore, { dispatchSetUser } from '@/store'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import createByFileIcon from '../assets/create-resume/upload.png'
import createByWxDocIcon from '../assets/create-resume/wechat.png'
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

export default function UploadResumeFile() {
  const [status, setStatus] = useState(PageStatusEnum.READY)
  const [error, setError] = useState<Nullable<string>>(null)

  const uploadHandler = (attachmentInfo: IResumeAttachmentUploadResult) => {
    dispatchSetUser({
      ...appStore.getState().user,
      attProfileUrl: attachmentInfo.attUrl,
    } as IUserInfo)
  }

  const webviewUploadHandler = useCallback((attachmentInfo: IResumeAttachmentUploadResult) => {
    setStatus(PageStatusEnum.OK)
    uploadHandler(attachmentInfo)
  }, [])

  const setErrorStatus = (errorMessage: string) => {
    setError(errorMessage)
    setStatus(PageStatusEnum.ERROR)
  }

  useEffect(() => {
    return () => {
      eventCenter.off(uploadResumeAttachmentEventKey, webviewUploadHandler)
    }
  }, [webviewUploadHandler])

  const wxUploadHandler = async () => {
    try {
      setError(null)
      setStatus(PageStatusEnum.READY)

      sendDataRangersEventWithUrl('ChooseReuploadAttachmentClick', { button_name: '微信上传' })

      const chooseFileResult = await chooseMessageFile({ count: 1 }).catch(noop)

      const fileInfo = chooseFileResult?.tempFiles?.[0]
      if (!fileInfo) {
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
      const attachmentInfo = await uploadResumeAttachmentByWxDocApi(fileInfo.path, fileInfo.name)
      uploadHandler(attachmentInfo)
      setStatus(PageStatusEnum.OK)
    } catch {
      setErrorStatus('出现未知错误，请重试')
    }
  }

  const fileUploadHandler = () => {
    eventCenter.once(uploadResumeAttachmentEventKey, webviewUploadHandler)
    navigateTo({ url: '/weapp/resume/upload-webview/index?type=attachment' })
    sendDataRangersEventWithUrl('ChooseReuploadAttachmentClick', { button_name: '手机文件上传' })
  }

  const backHandler = () => {
    navigateBack().then(() => {
      previewCurrentResumeAttachment()
    })
  }

  return (
    <MainLayout className="upload-resume-file">
      {status === PageStatusEnum.READY ? (
        <View className="upload-resume-file__block">
          <View className="upload-resume-file__block__title">选择一种方式上传附件</View>
          <View className="upload-resume-file__block__tips">
            建议上传pdf文件，也支持word/jpg/jpeg/png格式，大小不超过20M。投递时在线简历和附件简历都会发给招聘者
          </View>

          <View className="upload-resume-file__block-container">
            <View
              onClick={wxUploadHandler}
              hoverClass="hover"
              className="upload-resume-file__block-item"
            >
              <Image
                src={createByWxDocIcon}
                className="upload-resume-file__block-item__icon"
                mode="aspectFill"
              />
              <View className="upload-resume-file__block-item__body">
                <View className="upload-resume-file__block-item__title">从微信文件导入</View>
                <View className="upload-resume-file__block-item__badge">88%的人选择</View>
                <View className="upload-resume-file__block-item__recommend">推荐</View>
              </View>
              <Image
                src={arrowIcon}
                mode="aspectFill"
                className="upload-resume-file__block-item__arrow"
              />
            </View>

            <View
              onClick={fileUploadHandler}
              hoverClass="hover"
              className="upload-resume-file__block-item"
            >
              <Image
                src={createByFileIcon}
                mode="aspectFill"
                className="upload-resume-file__block-item__icon"
              />
              <View className="upload-resume-file__block-item__body">
                <View className="upload-resume-file__block-item__title">从手机文件导入</View>
              </View>
              <Image
                src={arrowIcon}
                mode="aspectFill"
                className="upload-resume-file__block-item__arrow"
              />
            </View>
          </View>
        </View>
      ) : status === PageStatusEnum.PENDING || status === PageStatusEnum.OK ? (
        <ProcessPanel onClickOK={backHandler} isFinished={status === PageStatusEnum.OK} />
      ) : (
        <ErrorPanel
          error={error}
          onRetry={wxUploadHandler}
          onOther={() => void setStatus(PageStatusEnum.READY)}
          showOthers
        />
      )}
    </MainLayout>
  )
}
