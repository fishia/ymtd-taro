import { View, Image } from '@tarojs/components'
import { chooseMessageFile, navigateBack, navigateTo, useDidShow } from '@tarojs/taro'
import _ from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'

import {
  competitionEntranceApi,
  fetchResumeCompetitionCompletedApi,
  fetchUploadResumeResultApi,
  IBackgroundUrl,
  uploadResumeCompetitionApi,
} from '@/apis/resume'
import { ALLOW_RESUME_FILE_TYPE } from '@/config'
import { IResume } from '@/def/resume'
import { useShowLoginPopup } from '@/hooks/custom/usePopup'
import { usePreviewResume } from '@/hooks/custom/useResumePreview'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import useShowLoadingStatus from '@/hooks/custom/useShowLoadingStatus'
import useToast from '@/hooks/custom/useToast'
import { useCurrentUserInfo } from '@/hooks/custom/useUser'
import MainLayout from '@/layout/MainLayout'
import { polling } from '@/services/NetworkService'
import { ensureResumeOptions } from '@/services/ResumeService'
import { sendHongBaoEvent } from '@/utils/dataRangers'

import './index.scss'

const ResumeCompetiton: React.FC = () => {
  const { type, icon_rank } = useRouterParam()
  const { showLoadingStatus, hideLoadingStatus } = useShowLoadingStatus()
  const showToast = useToast()
  const showLoginPopup = useShowLoginPopup()
  const [backgroundUrl, setBackgroundUrl] = useState<IBackgroundUrl>({
    completedUrl: '',
    entranceUrl: ''
  })

  const [, setPreviewResume] = usePreviewResume()
  const userInfo = useCurrentUserInfo()

  const [completed, setCompleted] = useState<boolean>(false)

  // 拉取查询活动参与状态
  const checkCompetiton = useCallback(
    () =>
      userInfo ? fetchResumeCompetitionCompletedApi(type).then(setCompleted) : Promise.resolve(),
    [type, userInfo]
  )

  useEffect(() => {
    competitionEntranceApi(type)
      .then((res) => {
        setBackgroundUrl(res)
      })
  }, [type])

  // 加载页面，拉取参与状态
  useEffect(() => {
    // type 参数错误
    if (type === undefined) {
      showToast({ content: '未设置活动 type', onClose: () => void navigateBack() })
      return
    }

    // 未登录用户
    if (!userInfo) {
      hideLoadingStatus()
      return
    }

    checkCompetiton().then(hideLoadingStatus)
  }, [checkCompetiton, hideLoadingStatus, showToast, type, userInfo])

  // 每次显示页面后都检查状态
  useDidShow(checkCompetiton)

  // 点击上传按钮
  const handleUpload = async () => {
    if (!userInfo) {
      showLoginPopup()
      return
    }
    sendHongBaoEvent('UploadcvClick', {
      event_name: '简历大赛',
      event_rank: icon_rank,
    })

    const chooseFileResult = await chooseMessageFile({ count: 1 })

    const fileInfo = chooseFileResult?.tempFiles?.[0]
    if (!fileInfo) {
      return
    } else if (fileInfo.size > 20 * 1024 * 1024) {
      showToast({ content: '文件过大，请选择20M以内的文件' })
      return
    } else if (!ALLOW_RESUME_FILE_TYPE.includes(_.last(fileInfo.path.split('.'))!)) {
      showToast({ content: '文件格式错误，请选择 word/pdf/jpg/jpeg/png 格式' })
      return
    }

    showLoadingStatus({ loadingText: '上传解析简历中...' })
    uploadResumeCompetitionApi(type, fileInfo.path, fileInfo.name)
      .then(fileKey => {
        polling<IResume>(() => fetchUploadResumeResultApi(fileKey), Boolean)
          .then(setPreviewResume)
          .then(ensureResumeOptions)
          .then(() => void navigateTo({ url: '/weapp/resume/complete-resume/index?mode=active' }))
          .then(hideLoadingStatus)
          .catch(() => {
            hideLoadingStatus()
            showToast({ content: '文件导入失败，请重试' })
          })
      })
      .catch(() => {
        hideLoadingStatus()
        showToast({ content: '文件导入失败，请重试' })
      })
  }

  return (
    <MainLayout defaultLoading navBarTitle="校园简历大赛" className="resume-competition">
      <Image
        className="resume-competition__background"
        mode="widthFix"
        src={completed ? backgroundUrl?.completedUrl : backgroundUrl?.entranceUrl}
      />
      <View className="resume-competition__confirm">
        <View className="resume-competition__button" onClick={handleUpload}>
          <View className="at-icon at-icon-share-2"></View>
          {completed ? '重新上传简历' : '上传附件简历'}
        </View>
      </View>
    </MainLayout>
  )
}

export default ResumeCompetiton
