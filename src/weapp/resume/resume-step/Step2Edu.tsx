import { View } from '@tarojs/components'
import React, { useRef } from 'react'

import { appendEduExpApi } from '@/apis/resume'
import { IFormError } from '@/def/client'
import { createDefaultEducation, IEducationExp } from '@/def/resume'
import { useCurrentResume, useRefreshCurrentResume } from '@/hooks/custom/useResume'
import { activityStatus } from '@/services/DateService'
import appStore from '@/store'
import { sendDataRangersEvent } from '@/utils/dataRangers'

import EditEduBlock from '../components/EditEduBlock'
import FixedButton from '../components/FixedButton'
import { useFormRef } from '../components/Form'

import { IResumeStepProps } from '.'

const Step2Edu: React.FC<IResumeStepProps> = props => {
  const { onNext } = props
  const refreshCurrentResume = useRefreshCurrentResume()
  const resume = useCurrentResume()

  const data = useRef(createDefaultEducation())
  const formRef = useFormRef<IEducationExp>()

  const isStudent = resume?.workBeginTime === '0000-00-00'
  const isHasIntent = appStore.getState().user?.is_intent
  const allSteps = 4 - (isStudent ? 1 : 0) - (isHasIntent ? 1 : 0)
  const isLastStep = isStudent && isHasIntent
  const effectiveActivity = activityStatus()

  // 点击下一步
  const nextStepHandler = async () => {
    if (!(await formRef.current?.validateAndToast())) {
      return
    }

    appendEduExpApi({ ...formRef.current!.getData() })
      .then(refreshCurrentResume)
      .then(() => sendDataRangersEvent('EduExperience'))
      .then(() => void onNext(isLastStep ? 999 : isStudent ? 2 : 1))
      .catch((err: IFormError<IEducationExp>) => {
        formRef.current?.validateAndToastByResponse(err)
      })
  }
  return (
    <View>
      <View className="resume-step-title">
        <View className="resume-step-title__title">最近一份教育经历（2/{allSteps}）</View>
        <View className="resume-step-title__tips">完善的教育经历将为你的简历加分</View>
      </View>

      <EditEduBlock data={data.current} formRef={formRef} isStudent={isStudent} />

      <FixedButton btnType="primary" onClick={nextStepHandler}>
        {isLastStep ? `${effectiveActivity ? '提交并领红包' : '保存简历'}` : '下一步'}
      </FixedButton>
    </View>
  )
}

export default Step2Edu
