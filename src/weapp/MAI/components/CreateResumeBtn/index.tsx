import { View, Text } from '@tarojs/components'
import { eventCenter, navigateTo, useDidShow } from '@tarojs/taro'
import { useState } from 'react'

import { existsProfile } from '@/apis/MAIchat'
import { fetchUploadResumeResultApi } from '@/apis/resume'
import { IResume } from '@/def/resume'
import useOnce, { MAIResumeTool } from '@/hooks/custom/useOnce'
import { usePreviewResume } from '@/hooks/custom/useResumePreview'
import useShowLoadingStatus from '@/hooks/custom/useShowLoadingStatus'
import useShowModal2 from '@/hooks/custom/useShowModal2'
import { polling } from '@/services/NetworkService'
import { ensureResumeOptions } from '@/services/ResumeService'
import { encodeURLParams } from '@/services/StringService'
import { sendDataRangersEvent, sendHongBaoEvent } from '@/utils/dataRangers'
import { useUploadResumeByWx } from '@/weapp/resume/create-resume/useUploadResumeByWx'

import './index.scss'

interface IProps {
  openResume: (uuid: string) => void
}

const uploadResumeFileEventKey = 'create-resume-upload'

const CreateResumeBtn: React.FC<IProps> = props => {
  const { openResume } = props
  const { showLoadingStatus, hideLoadingStatus } = useShowLoadingStatus()
  const [, setPreviewResume] = usePreviewResume()

  const { needShow: needShowModal, setCurrentTips: setCurrentTipsModal } = useOnce(MAIResumeTool)
  const [needShowModalVal, setNeedShowModalVal] = useState<boolean>(needShowModal)

  const showModal = useShowModal2()

  const trackResumeCreateWay = (create_path_name: string) => {
    sendHongBaoEvent('CVCreateSelect', { page_name: '简历创建方式页', way_name: create_path_name })
  }

  // 通过聊天文件 or Webview 上传文件后处理 fileKey
  const handleUploadByFileKey = async (fileKey: number, way_name: string) => {
    showLoadingStatus({ hasNavBar: true, loadingText: '文件上传中...' })
    const resume = await polling<IResume>(() => fetchUploadResumeResultApi(fileKey), Boolean).then(
      ensureResumeOptions
    )

    hideLoadingStatus()
    setPreviewResume(resume)
    navigateTo({
      url:
        '/weapp/resume/complete-resume/index?' +
        encodeURLParams({ mode: 'confirm', jobId: '', way_name }),
    })
  }

  const createByWxDoc = useUploadResumeByWx()

  const createByUploadFile = () => {
    trackResumeCreateWay('手机文件导入')

    eventCenter.once(uploadResumeFileEventKey, filekey =>
      handleUploadByFileKey(filekey, '手机文件导入')
    )
    navigateTo({ url: '/weapp/resume/upload-webview/index?type=resume' })
  }

  useDidShow(() => {
    eventCenter.off(uploadResumeFileEventKey)
  })

  const closeModal = () => {
    setCurrentTipsModal()
    setNeedShowModalVal(false)
  }

  const toResumeStep = () => {
    closeModal()
    sendDataRangersEvent('Button_click', {
      button_name: '继续在线填写',
      page_name: 'M.AI_IM页',
      popup_name: '自动填充弹窗',
    })
    navigateTo({ url: '/weapp/resume/resume-step/index' })
  }

  const createByPhone = async () => {
    const { hasMaiProfile, uuid } = await existsProfile()
    trackResumeCreateWay('小程序在线填写')

    if (!hasMaiProfile) {
      navigateTo({ url: '/weapp/resume/resume-step/index' })
      return
    }

    if (needShowModalVal) {
      showModal({
        text: '检测到M.AI已为你生成过简历内容，使用后可帮你更快的完成简历创建，是否自动填充？',
        confirmText: '自动填充简历内容',
        cancelText: '继续在线填写',
        cancelWidth: 327,
        confirmWidth: 327,
        cancelBtnClose: toResumeStep,
      }).then(res => {
        closeModal()
        if (res) {
          sendDataRangersEvent('Button_click', {
            button_name: '自动填充简历内容',
            page_name: 'M.AI_IM页',
            popup_name: '自动填充弹窗',
          })
          openResume(uuid)
        }
      })
      return
    }
    toResumeStep()
  }

  return (
    <View className="message-content-createResume">
      <View className="message-content-createResume__btn" onClick={createByPhone}>
        <Text className="icon iconfont iconic_online" />
        <Text>在线填写</Text>
      </View>
      <View className="message-content-createResume__btn" onClick={createByWxDoc}>
        <Text className="icon iconfont iconresumeWechat" />
        <Text>微信导入</Text>
      </View>
      <View className="message-content-createResume__btn" onClick={createByUploadFile}>
        <Text className="icon iconfont iconresumeMobile" />
        <Text>手机文件导入</Text>
      </View>
    </View>
  )
}

export default CreateResumeBtn
