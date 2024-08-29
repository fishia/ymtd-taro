import { View } from '@tarojs/components'
import {
  eventCenter,
  getCurrentPages,
  navigateBack,
  redirectTo,
  useDidHide,
  useDidShow,
  useRouter,
} from '@tarojs/taro'
import React, { useState } from 'react'

import { firstSaveProfile } from '@/apis/active-page'
import { tryContinueLoginRecordJd } from '@/components/LoginButton'
import LuckyDrawPopup from '@/components/Popup/luckyDrawPopup'
import { COMPLETE_RESUME_EVENT_KEY } from '@/config'
import useAlertBeforeUnload from '@/hooks/custom/useAlertBeforeUnload'
import { useLuckyDrawPupupRef } from '@/hooks/custom/usePopup'
import { useRefreshCurrentResume } from '@/hooks/custom/useResume'
import { useAllPagesRoute, useGetUserLuckyDrawFlow } from '@/hooks/custom/useUser'
import MainLayout from '@/layout/MainLayout'
import { activityStatus } from '@/services/DateService'
import { connectIM } from '@/services/IMService'
import { ensureResumeOptions } from '@/services/ResumeService'
import { useTryOpenWJXMp } from '@/services/ResumeService/tryOpenWJXMp'
import appStore from '@/store'
import { sendResumeEvent } from '@/utils/dataRangers'

import { useUploadResumeByWx } from '../create-resume/useUploadResumeByWx'
import Step1Intro from './Step1Intro'
import Step2Edu from './Step2Edu'
import Step3Job from './Step3Job'
import Step4Intent from './Step4Intent'

import './index.scss'

export interface IResumeStepProps {
  onNext(steps?: number): void
}

const steps = [Step1Intro, Step2Edu, Step3Job, Step4Intent]
const ResumeStep: React.FC = () => {
  ensureResumeOptions()

  const router = useRouter()
  const jobId = router.params.jobId

  const refreshCurrentResume = useRefreshCurrentResume()
  const effectiveActivity = activityStatus()
  const luckyDrawPopupRef = useLuckyDrawPupupRef()
  const getUserLuckyDrawFlow = useGetUserLuckyDrawFlow()
  const allPages = useAllPagesRoute()
  const tryOpenWJXMp = useTryOpenWJXMp()

  const [step, setStep] = useState<number>(() => 0)
  const { enableAlertBeforeUnload, disableAlertBeforeUnload } = useAlertBeforeUnload()

  useDidShow(() => void enableAlertBeforeUnload('现在退出，您编辑的信息将不会保存，是否继续？'))

  //保存简历后的操作
  const continueProcess = async () => {
    if (jobId) {
      eventCenter.trigger(COMPLETE_RESUME_EVENT_KEY, true)
      return navigateBack({ delta: 2 })
    } else {
      return navigateBack().then(
        () => void redirectTo({ url: '/weapp/resume/index/index?hideRecreate=1' })
      )
    }
  }
  const stepHandler = (s: number = 1) => {
    disableAlertBeforeUnload()

    // 创建第一步完成，直接连接 IM
    if (step <= 0) {
      connectIM().then(() => {
        tryContinueLoginRecordJd(false)
      })
    }

    const isStudent = appStore.getState().resume?.workBeginTime === '0000-00-00'
    const isHasIntent = appStore.getState().user?.is_intent
    const stepEnd = 3 - (isStudent ? 1 : 0) - (isHasIntent ? 1 : 0)

    if (step >= stepEnd) {
      // sendResumeEvent('SaveResume', { way_name: '手动填写' })
      const pageStack = getCurrentPages() || []
      const prePage = pageStack[pageStack.length - 2]
      sendResumeEvent('SaveResume', {
        page_name: '我的在线简历页',
        prepage_name: prePage?.config?.navigationBarTitleText || '',
        way_name: '在线填写',
        user_role: isStudent ? '学生' : '职场人',
      })
      //红包
      if (effectiveActivity) {
        firstSaveProfile()
        getUserLuckyDrawFlow()
          .then(() => void continueProcess())
          .then(tryOpenWJXMp)
          .catch(() => void continueProcess())
      } else {
        continueProcess().then(tryOpenWJXMp)
      }

      return
    }

    setStep(i => i + s)
  }

  useDidShow(() => {
    const prePage = allPages[allPages.length - 2]
    if (prePage === 'weapp/general/webview/index') {
      continueProcess()
    }
  })

  useDidHide(() => {
    disableAlertBeforeUnload()
    if (step > 0) {
      refreshCurrentResume()
      // setStep(0)
    }
  })

  const Step = steps[step]

  const uploadWxFile = useUploadResumeByWx(jobId)

  const createByWxDoc = () => {
    sendResumeEvent('WechatImportClick')
    uploadWxFile()
  }

  return (
    <MainLayout className="resume-step">
      <View className="resume-step__banner">
        <View className="resume-step__banner__tips">填写简历太麻烦？试试微信上传附件智能填充</View>
        <View onClick={createByWxDoc} className="resume-step__banner__button">
          微信导入
        </View>
      </View>

      {Step ? <Step onNext={stepHandler} /> : null}
      <LuckyDrawPopup ref={luckyDrawPopupRef} />
    </MainLayout>
  )
}

export default ResumeStep
