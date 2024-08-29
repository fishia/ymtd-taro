import { View } from '@tarojs/components'
import { eventCenter, useRouter } from '@tarojs/taro'
import React, { useMemo } from 'react'

import { appendUserIntentApi } from '@/apis/resume'
import { updateUserStatusApi } from '@/apis/user'
import { REFRESH_INTENTS_LIST } from '@/config'
import { IFormError } from '@/def/client'
import { createDefaultIntent, IResumeIntentInfo } from '@/def/resume'
import { useCurrentResume, useRefreshCurrentResume } from '@/hooks/custom/useResume'
import { getNewLoginIntent, refreshUserInfo, setNewLoginIntent } from '@/services/AccountService'
import { activityStatus } from '@/services/DateService'
import appStore from '@/store'
import { sendDataRangersEvent, sendHongBaoEvent } from '@/utils/dataRangers'

import EditIntentBlock from '../components/EditIntentBlock'
import FixedButton from '../components/FixedButton'
import { useFormRef } from '../components/Form'

import { IResumeStepProps } from '.'

const Step4Intent: React.FC<IResumeStepProps> = props => {
  const { onNext } = props
  const router = useRouter()

  const refreshCurrentResume = useRefreshCurrentResume()
  const resume = useCurrentResume()
  const effectiveActivity = activityStatus()

  const steps = resume?.workBeginTime === '0000-00-00' ? 3 : 4

  const data = useMemo(() => {
    const intentInfo = getNewLoginIntent() || createDefaultIntent()

    const isCreate = router.path === '/weapp/resume/resume-step/index'
    if (isCreate) {
      const resumeBasicInfo = appStore.getState().resume!
      const resumeJobExp = appStore.getState().resume!.profileJob[0]

      if (intentInfo.cityId === 0) {
        intentInfo.cityId = resumeBasicInfo.cityId
        intentInfo.cityName = resumeBasicInfo.cityName
      }

      if (intentInfo.expectPosition === 0 && resumeJobExp) {
        intentInfo.expectPosition = resumeJobExp.functionType
        intentInfo.expectPositionName = resumeJobExp.functionTypeName
        intentInfo.keywords = resumeJobExp.keywords
      }
    }

    return intentInfo
  }, [router.path])
  const formRef = useFormRef<IResumeIntentInfo>()

  // 点击保存
  const completeClickHandler = async () => {
    sendHongBaoEvent('SaveRaffleClick')

    if (!(await formRef.current?.validateAndToast())) {
      return
    }

    appendUserIntentApi(formRef.current!.getData(), true)
      .then(() => {
        sendDataRangersEvent('JobIntention')
        refreshCurrentResume().then(() => eventCenter.trigger(REFRESH_INTENTS_LIST))
        if (!appStore.getState().user?.status) {
          updateUserStatusApi(Number(formRef.current!.getData().userStatus)).then(refreshUserInfo)
        }
        onNext()
        setNewLoginIntent(null)
      })
      .catch((err: IFormError<IResumeIntentInfo>) => {
        formRef.current?.validateAndToastByResponse(err)
      })
  }

  return (
    <View>
      <View className="resume-step-title">
        <View className="resume-step-title__title">
          告诉我你的求职意向（{steps}/{steps}）
        </View>
        <View className="resume-step-title__tips">一大波高薪机会即将赶到</View>
      </View>

      <EditIntentBlock data={data} formRef={formRef} />

      <FixedButton btnType="primary" onClick={completeClickHandler}>
        {effectiveActivity ? '提交并领红包' : '保存简历'}
      </FixedButton>
    </View>
  )
}

export default Step4Intent
