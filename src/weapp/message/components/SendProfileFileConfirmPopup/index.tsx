import { Image, View } from '@tarojs/components'
import { getStorageSync, setStorageSync } from '@tarojs/taro'
import classNames from 'classnames'
import { noop } from 'lodash'
import { forwardRef, useImperativeHandle, useRef } from 'react'

import { IM_SEND_PROFILE_FILE_CONFIRM } from '@/config'
import { IProps } from '@/def/common'
import useModalState from '@/hooks/custom/useModalState'
import { previewCurrentResumeAttachment } from '@/services/ResumeService'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import closeIcon from './close.svg'

import './index.scss'

export interface ISendProfileFileConfirmPopupRef {
  show(): Promise<boolean>
  hide(): void
}

export interface ISendProfileFileConfirmPopupProps extends IProps {}

const SendProfileFileConfirmPopup = forwardRef<
  ISendProfileFileConfirmPopupRef,
  ISendProfileFileConfirmPopupProps
>((props: ISendProfileFileConfirmPopupProps, ref: any) => {
  const { className, style } = props

  const callbackRef = useRef<Func1<boolean, void>>(noop)

  const { alive, active, setModal } = useModalState(250)

  const previewProfileFileHandler = () => {
    previewCurrentResumeAttachment()
    sendDataRangersEventWithUrl('PreviewAttachmentShow', {
      button_name: '预览附件',
      source: 'IM-是否预览弹窗',
    })
    sendDataRangersEventWithUrl('WarmPromptClick', { button_name: '预览附件' })
  }

  const confirmHandler = () => {
    callbackRef.current(true)
    sendDataRangersEventWithUrl('WarmPromptClick', { button_name: '直接投递' })
  }

  const closeHandler = () => {
    callbackRef.current(false)
  }

  useImperativeHandle<any, ISendProfileFileConfirmPopupRef>(ref, () => {
    async function show(): Promise<boolean> {
      if (getStorageSync(IM_SEND_PROFILE_FILE_CONFIRM)) {
        return Promise.resolve(true)
      }

      return new Promise<boolean>(resolve => {
        callbackRef.current = (isAgree: boolean) => {
          if (isAgree) {
            resolve(true)
            setStorageSync(IM_SEND_PROFILE_FILE_CONFIRM, true)
          } else {
            resolve(false)
          }
          setModal(false)
        }

        setModal(true)
      })
    }

    function hide() {
      setModal(false)
    }

    return { show, hide }
  })

  if (!alive) {
    return null
  }

  return (
    <View
      className={classNames('send-profile-file-confirm-popup-mask', active ? 'active' : '')}
      catchMove
    >
      <View
        className={classNames('send-profile-file-confirm-popup', className, active ? 'active' : '')}
        style={style}
      >
        <View className="send-profile-file-confirm-popup__text">
          发送完整简历也会将你的附件简历一并发送给招聘者，是否需要预览简历再投递？
        </View>
        <View className="send-profile-file-confirm-popup__action">
          <View
            onClick={previewProfileFileHandler}
            className="send-profile-file-confirm-popup__button preview"
          >
            预览附件
          </View>
          <View
            onClick={confirmHandler}
            className="send-profile-file-confirm-popup__button confirm"
          >
            直接投递
          </View>
        </View>
        <Image
          className="send-profile-file-confirm-popup__close"
          onClick={closeHandler}
          src={closeIcon}
        />
      </View>
    </View>
  )
})

export default SendProfileFileConfirmPopup
