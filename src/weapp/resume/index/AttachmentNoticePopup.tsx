import { Image, View } from '@tarojs/components'
import { eventCenter, getCurrentPages, navigateTo, switchTab, useRouter } from '@tarojs/taro'
import c from 'classnames'
import { last } from 'lodash'
import { useEffect, useState } from 'react'

import closeIcon from '@/assets/imgs/close.svg'
import { IProps } from '@/def/common'
import useModalState from '@/hooks/custom/useModalState'
import { previewCurrentResumeAttachment } from '@/services/ResumeService'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import './AttachmentNoticePopup.scss'

export const attachmentNoticePopupEventKey = 'attachment-notice'

export function showAttachmentNoticePopup(hasAttachment?: boolean) {
  const path = '/' + last(getCurrentPages())?.route
  eventCenter.trigger(path + attachmentNoticePopupEventKey, hasAttachment)
}

enum AttachmentNoticePopupTypeEnum {
  OK = 'ok',
  CONFIRM = 'confirm',
  SKIP = 'skip',
}

export interface IAttachmentNoticePopupProps extends IProps {}

export default function AttachmentNoticePopup(props: IAttachmentNoticePopupProps) {
  const { className, style } = props

  const router = useRouter()
  const { alive, active, setModal } = useModalState(250)

  const [type, setType] = useState<AttachmentNoticePopupTypeEnum>(AttachmentNoticePopupTypeEnum.OK)

  useEffect(() => {
    const callback = (hasAttachment?: boolean) => {
      setType(
        hasAttachment ? AttachmentNoticePopupTypeEnum.OK : AttachmentNoticePopupTypeEnum.CONFIRM
      )
      setModal(true)

      sendDataRangersEventWithUrl('SuccessfullyUploadExpose', { page: '我的简历' })
    }
    eventCenter.on(router.path + attachmentNoticePopupEventKey, callback)

    return () => {
      eventCenter.off(router.path + attachmentNoticePopupEventKey, callback)
    }
  }, [router.path, setModal])

  const previewHandler = () => {
    previewCurrentResumeAttachment()
    setModal(false)
    sendDataRangersEventWithUrl('PreviewAttachmentShow', {
      button_name: '立即查看',
      source:
        type === AttachmentNoticePopupTypeEnum.OK
          ? '我的简历-同步上传弹窗'
          : '求职意向-自动生成弹窗',
    })
  }

  const uploadHandler = () => {
    navigateTo({ url: '/weapp/resume/upload-resume-file/index' })
    setModal(false)
    sendDataRangersEventWithUrl('UploadAttachmentClick', { button_name: '上传附件' })
  }

  const skipHandler = () => {
    setType(AttachmentNoticePopupTypeEnum.SKIP)
    sendDataRangersEventWithUrl('UploadAttachmentClick', { button_name: '暂不上传' })
  }

  const closeHandler = () => {
    setModal(false)

    if (type === AttachmentNoticePopupTypeEnum.SKIP) {
      setTimeout(() => void switchTab({ url: '/weapp/pages/job/index' }), 275)
    }
  }

  if (!alive) {
    return null
  }

  return (
    <View className={c('attachment-notice-popup-mask', active ? 'active' : '')}>
      <View
        className={c('attachment-notice-popup', className, type, active ? 'active' : '')}
        style={style}
      >
        <View
          className={c(
            'attachment-notice-popup__text',
            type === AttachmentNoticePopupTypeEnum.CONFIRM ? '' : 'center'
          )}
        >
          {type === AttachmentNoticePopupTypeEnum.OK
            ? '保存成功，附件简历已同步上传'
            : type === AttachmentNoticePopupTypeEnum.CONFIRM
            ? '保存成功，上传附件简历可更全面向面试官展示自己的履历'
            : '系统已自动为您生成附件简历'}
        </View>
        <View className="attachment-notice-popup__action">
          {type === AttachmentNoticePopupTypeEnum.CONFIRM ? (
            <>
              <View onClick={skipHandler} className="attachment-notice-popup__sub button">
                暂不上传
              </View>
              <View onClick={uploadHandler} className="attachment-notice-popup__main button">
                上传附件
              </View>
            </>
          ) : (
            <View onClick={previewHandler} className="attachment-notice-popup__main button">
              立即查看
            </View>
          )}

          {type !== AttachmentNoticePopupTypeEnum.CONFIRM ? (
            <Image
              onClick={closeHandler}
              className="attachment-notice-popup__close"
              src={closeIcon}
            />
          ) : null}
        </View>
      </View>
    </View>
  )
}
