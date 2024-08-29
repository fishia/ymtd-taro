import { View } from '@tarojs/components'
import React, { useMemo, useState } from 'react'

import { createResumeBasicApi } from '@/apis/resume'
import { IFormError } from '@/def/client'
import { defaultBasicInfo, IResumeBasicInfo } from '@/def/resume'
import { useRefreshCurrentResume } from '@/hooks/custom/useResume'
import { getRandomMaleAvatar } from '@/services/ResumeService'
import appStore from '@/store'
import { sendDataRangersEvent } from '@/utils/dataRangers'

import EditBasicBlock from '../components/EditBasicBlock'
import FixedButton from '../components/FixedButton'
import { useFormRef } from '../components/Form'

import { IResumeStepProps } from '.'
import '../components/Form/style/normalized.scss'

const Step1Intro: React.FC<IResumeStepProps> = props => {
  const { onNext } = props
  const refreshCurrentResume = useRefreshCurrentResume()

  const basicInfo = useMemo(() => ({ ...defaultBasicInfo, avatar: getRandomMaleAvatar() }), [])
  const formRef = useFormRef<IResumeBasicInfo>()

  const [isStudent, setIsStudent] = useState(false)
  const isHasIntent = appStore.getState().user?.is_intent
  const steps = 4 - (isStudent ? 1 : 0) - (isHasIntent ? 1 : 0)

  const fieldChangeHandler = (field: keyof IResumeBasicInfo, value: any) => {
    if (field === 'workBeginTime') {
      setIsStudent(value === '0000-00-00')
    }
  }

  // 点击下一步
  const nextStepHandler = async () => {
    if (!(await formRef.current?.validateAndToast())) {
      return
    }

    createResumeBasicApi(formRef.current!.getData())
      .then(refreshCurrentResume)
      .then(() => {
        sendDataRangersEvent('BasicInfo')
        if (!basicInfo.wechat)
          sendDataRangersEvent('SaveWechat', {
            way_name: '简历基本信息',
            user_role:
              formRef.current!.getData().workBeginTime === '0000-00-00' ? '学生' : '职场人',
          })
      })
      .then(() => void onNext())
      .catch((err: IFormError<IResumeBasicInfo>) => {
        formRef.current?.validateAndToastByResponse(err)
      })
  }

  return (
    <View>
      <View className="resume-step-title">
        <View className="resume-step-title__title">简单介绍一下自己（1/{steps}）</View>
        <View className="resume-step-title__tips">快速创建在线简历，医脉助你升职加薪</View>
      </View>

      <EditBasicBlock data={basicInfo} formRef={formRef} onFieldChange={fieldChangeHandler} />

      <FixedButton btnType="primary" onClick={nextStepHandler}>
        下一步
      </FixedButton>
    </View>
  )
}

export default Step1Intro
