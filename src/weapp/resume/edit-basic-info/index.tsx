import { navigateBack, useDidHide, useDidShow } from '@tarojs/taro'
import React, { useEffect, useState } from 'react'

import { fetchResumeBasicApi, updateResumeBasicApi } from '@/apis/resume'
import { IFormError } from '@/def/client'
import { IResumeBasicInfo, defaultBasicInfo } from '@/def/resume'
import useAlertBeforeUnload from '@/hooks/custom/useAlertBeforeUnload'
import { useRefreshCurrentResume, useResumeId } from '@/hooks/custom/useResume'
import { usePreviewResumeBasicInfo } from '@/hooks/custom/useResumePreview'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import useShowLoadingStatus from '@/hooks/custom/useShowLoadingStatus'
import useToast from '@/hooks/custom/useToast'
import MainLayout from '@/layout/MainLayout'
import { sendDataRangersEvent } from '@/utils/dataRangers'

import EditBasicBlock from '../components/EditBasicBlock'
import FixedButton from '../components/FixedButton'
import { useFormRef } from '../components/Form'

import './index.scss'

const EditBasicInfo: React.FC = () => {
  const { mode } = useRouterParam()

  const resumeId = useResumeId()
  const refreshCurrentResume = useRefreshCurrentResume()

  const [confirmBasicInfo, setConfirmBasicInfo] = usePreviewResumeBasicInfo()
  const { enableAlertBeforeUnload, disableAlertBeforeUnload } = useAlertBeforeUnload()

  const showToast = useToast()
  const { hideLoadingStatus } = useShowLoadingStatus()

  const formRef = useFormRef<IResumeBasicInfo>()
  const [basicInfo, setBasicInfo] = useState<IResumeBasicInfo>(defaultBasicInfo)

  // 加载页面
  useEffect(() => {
    const fetchFn =
      mode === 'confirm'
        ? () => Promise.resolve<IResumeBasicInfo>(confirmBasicInfo)
        : () => fetchResumeBasicApi()

    fetchFn()
      .then(setBasicInfo)
      .then(hideLoadingStatus)
      .catch(() => void showToast({ content: '获取简历信息失败' }))
  }, [confirmBasicInfo, hideLoadingStatus, mode, resumeId, showToast])

  useDidShow(() => {
    enableAlertBeforeUnload('现在退出，您编辑的信息将不会保存，是否继续？')
  })

  useDidHide(disableAlertBeforeUnload)

  // 点击保存
  const saveClickHandler = async () => {
    if (!(await formRef.current?.validateAndToast())) {
      return
    }

    if (mode === 'confirm') {
      setConfirmBasicInfo(formRef.current!.data)
      disableAlertBeforeUnload()
      navigateBack()
    } else {
      updateResumeBasicApi(formRef.current!.getData())
        .then(() => {
          disableAlertBeforeUnload()
          refreshCurrentResume()
          if (!basicInfo.wechat)
            sendDataRangersEvent('SaveWechat', {
              way_name: '简历基本信息',
              user_role:
                formRef.current!.getData().workBeginTime === '0000-00-00' ? '学生' : '职场人',
            })
          navigateBack()
        })
        .catch((err: IFormError<IResumeBasicInfo>) => {
          formRef.current?.validateAndToastByResponse(err)
        })
    }
  }

  return (
    <MainLayout defaultLoading border navBarTitle="基本信息" className="edit-basic-info">
      <EditBasicBlock data={basicInfo} formRef={formRef} />

      <FixedButton btnType="primary" onClick={saveClickHandler}>
        {mode === 'confirm' ? '确认' : ' 保存'}
      </FixedButton>
    </MainLayout>
  )
}

export default EditBasicInfo
