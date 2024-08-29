import { IResumeStepProps } from '.'
import { View } from '@tarojs/components'
import React, { useRef } from 'react'

import { appendJobExpApi } from '@/apis/resume'
import { IFormError } from '@/def/client'
import { createDefaultJob, IJobExp } from '@/def/resume'
import { useRefreshCurrentResume } from '@/hooks/custom/useResume'
import { activityStatus } from '@/services/DateService'
import appStore from '@/store'
import { sendDataRangersEvent } from '@/utils/dataRangers'

import EditJobBlock from '../components/EditJobBlock'
import FixedButton from '../components/FixedButton'
import { useFormRef } from '../components/Form'

const Step3Job: React.FC<IResumeStepProps> = props => {
  const { onNext } = props
  const refreshCurrentResume = useRefreshCurrentResume()

  const data = useRef(createDefaultJob())
  const formRef = useFormRef<IJobExp>()

  const isHasIntent = appStore.getState().user?.is_intent
  const allSteps = 4 - (isHasIntent ? 1 : 0)
  const isLastStep = isHasIntent
  const effectiveActivity = activityStatus()

  // 点击下一步
  const nextStepHandler = async () => {
    if (!(await formRef.current?.validateAndToast())) {
      return
    }

    appendJobExpApi(formRef.current!.getData())
      .then(refreshCurrentResume)
      .then(() => sendDataRangersEvent('WorkExperience'))
      .then(() => void onNext(isLastStep ? 999 : 1))
      .catch((err: IFormError<IJobExp>) => {
        formRef.current?.validateAndToastByResponse(err)
      })
  }

  return (
    <View>
      <View className="resume-step-title">
        <View className="resume-step-title__title">最近一份工作经历（3/{allSteps}）</View>
        <View className="resume-step-title__tips">恭喜你，即将创建完成！</View>
      </View>

      <EditJobBlock data={data.current} formRef={formRef} isCreate />

      <FixedButton btnType="primary" onClick={nextStepHandler}>
        {isLastStep ? `${effectiveActivity ? '提交并领红包' : '保存简历'}` : '下一步'}
      </FixedButton>
    </View>
  )
}

export default Step3Job
