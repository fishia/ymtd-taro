import { View } from '@tarojs/components'
import {
  eventCenter,
  getCurrentPages,
  navigateBack,
  navigateTo,
  useDidHide,
  useDidShow,
  useRouter,
  pageScrollTo,
  reLaunch,
  setNavigationBarTitle,
  hideHomeButton,
  switchTab,
} from '@tarojs/taro'
import c from 'classnames'
import { noop } from 'lodash'
import R from 'ramda'
import React, { useEffect } from 'react'

import { firstSaveProfile } from '@/apis/active-page'
import { completedSetResumeApi, SyncProfile } from '@/apis/resume'
import { tryContinueLoginRecordJd } from '@/components/LoginButton'
import LuckyDrawPopup from '@/components/Popup/luckyDrawPopup'
import { REFRESH_INTENTS_LIST } from '@/config'
import {
  IEducationExp,
  IJobExp,
  IProjectExp,
  defaultResume,
  IResumeIntentInfo,
  ProfileType,
} from '@/def/resume'
import useAlertBeforeUnload from '@/hooks/custom/useAlertBeforeUnload'
import { useLuckyDrawPupupRef } from '@/hooks/custom/usePopup'
import {
  useCurrentResume,
  useCurrentResumeErrorBlock,
  useRefreshCurrentResume,
} from '@/hooks/custom/useResume'
import { usePreviewResume, usePreviewResumeErrorBlock } from '@/hooks/custom/useResumePreview'
import useToast from '@/hooks/custom/useToast'
import {
  useAllPagesRoute,
  useGetUserLuckyDrawFlow,
  useLocalUserProfile,
} from '@/hooks/custom/useUser'
import MainLayout from '@/layout/MainLayout'
import { activityStatus } from '@/services/DateService'
import { connectIM } from '@/services/IMService'
import { ensureResumeOptions } from '@/services/ResumeService'
import { useTryOpenWJXMp } from '@/services/ResumeService/tryOpenWJXMp'
import { encodeURLParams } from '@/services/StringService'
import { sendHongBaoEvent, sendResumeEvent } from '@/utils/dataRangers'

import IntentInfoBlock from '../../resume/components/IntentInfoBlock'
import BasicInfoBlock from '../components/BasicInfoBlock'
import EduExpBlock from '../components/EduExpBlock'
import FixedButton from '../components/FixedButton'
import IntegrityBar from '../components/IntegrityBar'
import JobExpBlock from '../components/JobExpBlock'
import ProjExpBlock from '../components/ProjExpBlock'

import './index.scss'
import { closeCreateResumeModal } from '@/components/Modal/CreateResumeModal'

const completeResumeEventKey = 'apply-job-complete-resume'

const Resume: React.FC = () => {
  const router = useRouter()
  const mode = (router.params.mode || 'complete') as 'complete' | 'confirm' | 'active'

  const jobId = router.params.jobId
  const way_name = router.params.way_name
  const isHome = router.params.isHome

  const showToast = useToast()
  const refreshResume = useRefreshCurrentResume()
  const { enableAlertBeforeUnload, disableAlertBeforeUnload } = useAlertBeforeUnload()

  const currentResume = useCurrentResume() || defaultResume
  const confirmResume = usePreviewResume()[0] || defaultResume
  const resumeId = useLocalUserProfile('id')
  const currentResumeErrorBlock = useCurrentResumeErrorBlock()
  const confirmResumeErrorBlock = usePreviewResumeErrorBlock()
  const effectiveActivity = activityStatus() && !resumeId
  const luckyDrawPopupRef = useLuckyDrawPupupRef()
  const getUserLuckyDrawFlow = useGetUserLuckyDrawFlow()
  const allPages = useAllPagesRoute()
  const tryOpenWJXMp = useTryOpenWJXMp()

  const displayResume = mode === 'complete' ? currentResume : confirmResume
  const isStudent = displayResume?.workBeginTime === '0000-00-00'

  useDidShow(() => {
    hideHomeButton()
    const prePage = allPages[allPages.length - 2]
    if (prePage === 'weapp/general/webview/index') {
      backLinkUrl()
    }
  })

  // 加载页面
  useEffect(() => {
    closeCreateResumeModal()

    if (mode === 'complete') {
      refreshResume()
        .then(ensureResumeOptions)
        .catch(() => void showToast({ content: '获取简历信息失败' }))
    }

    return () => {
      eventCenter.trigger(completeResumeEventKey, false)
    }
  }, [mode, refreshResume, showToast])

  const backToJobDetail = async () => {
    const pages = getCurrentPages()
    const idx = R.findLastIndex(R.pathEq(['config', 'navigationBarTitleText'], '职位详情'), pages)
    const delta = pages.length - idx - 1
    disableAlertBeforeUnload()

    return navigateBack({ delta })
  }

  const backToResume = async () => {
    const pages = getCurrentPages()
    const idx = R.findLastIndex(R.pathEq(['config', 'navigationBarTitleText'], '我的简历'), pages)
    const delta = pages.length - idx
    disableAlertBeforeUnload()

    return navigateBack({ delta })
      .catch(noop)
      .finally(
        () => void navigateTo({ url: '/weapp/resume/index/index?hideRecreate=1&soucre=uploadfile' })
      )
  }

  // 点击继续沟通按钮
  const deliveryHandler = async () => {
    eventCenter.trigger(completeResumeEventKey, true)
    if (isHome) {
      switchTab({ url: '/weapp/pages/job/index' })
    } else {
      backToJobDetail()
    }
  }

  // 页面跳转
  const backLinkUrl = async () => {
    if (mode === 'confirm' && jobId) {
      return backToJobDetail()
    } else if (mode === 'confirm' && !jobId) {
      return backToResume()
    } else if (mode === 'active') {
      disableAlertBeforeUnload()

      return navigateBack()
    }
  }

  // 点击确认导入简历按钮
  const confirmHandler = async () => {
    const pageStack = getCurrentPages() || []
    const prePage = pageStack[pageStack.length - 2]
    sendHongBaoEvent('SaveRedPacketClick', { way_name })
    sendResumeEvent('SaveResume', {
      page_name: '我的在线简历页',
      prepage_name: prePage?.config?.navigationBarTitleText || '',
      way_name,
      user_role: confirmResume.workBeginTime === '0000-00-00' ? '学生' : '职场人',
    })

    completedSetResumeApi(confirmResume, way_name)
      .then(() => {
        disableAlertBeforeUnload()
        // showToast({ content: '导入简历成功' })
      })
      .then(refreshResume)
      .then(() => {
        eventCenter.trigger(REFRESH_INTENTS_LIST)
        connectIM().then(() => {
          tryContinueLoginRecordJd(false)
        })

        if (effectiveActivity) {
          // 是否第一次提交简历告诉后台
          firstSaveProfile()
          getUserLuckyDrawFlow().then(backLinkUrl).then(tryOpenWJXMp).catch(backLinkUrl)
        } else {
          backLinkUrl().then(tryOpenWJXMp)
        }
      })
      .catch(err => void showToast({ content: err.errorMessage || '导入简历失败' }))
  }

  // 快速同步
  const SyncProfileBtn = () => {
    SyncProfile()
      .then(() => {
        disableAlertBeforeUnload()
      })
      .then(refreshResume)
      .then(() => eventCenter.trigger(REFRESH_INTENTS_LIST))
      .then(() => {
        connectIM().then(() => {
          tryContinueLoginRecordJd(false)
        })

        if (effectiveActivity) {
          firstSaveProfile()
          getUserLuckyDrawFlow().then(backLinkUrl).then(tryOpenWJXMp).catch(backLinkUrl)
        } else {
          backLinkUrl().then(tryOpenWJXMp)
        }
      })
      .then(() => {
        reLaunch({ url: `/weapp/pages/job/index` })
      })
      .catch(err => void showToast({ content: err.errorMessage || '保存失败，请重新尝试' }))
  }

  const recreateClickHandler = () => void navigateTo({ url: '/weapp/resume/create-resume/index' })

  const tipErrorClickHandler = () => {
    const errorBlock = mode === 'confirm' ? confirmResumeErrorBlock : currentResumeErrorBlock
    pageScrollTo({ selector: '.' + errorBlock, offsetTop: -10 } as any)
  }

  // 编辑页只考虑是补全简历场合还是导入确认场合，不考虑 active
  const editPageMode = mode === 'complete' ? 'complete' : 'confirm'

  useDidShow(() => {
    enableAlertBeforeUnload('现在退出，您编辑的信息将不会保存，是否继续？')
  })

  useDidHide(disableAlertBeforeUnload)

  const basicInfoEdit = () => {
    navigateTo({ url: `/weapp/resume/edit-basic-info/index?mode=${editPageMode}` })
  }

  const intentInfoEdit = (item: Nullable<IResumeIntentInfo>, index: number) => {
    const urlParam = encodeURLParams({ mode: editPageMode, id: item?.id, index: String(index) })
    navigateTo({ url: `/weapp/resume/edit-intent-info/index?${urlParam}` })
  }

  const edusExpEdit = (item: Nullable<IEducationExp>, index: number) => {
    const urlParam = encodeURLParams({
      mode: editPageMode,
      id: item?.id,
      index: String(index),
      isStudent,
    })
    navigateTo({ url: `/weapp/resume/edit-edu-exp/index?${urlParam}` })
  }

  const jobsExpEdit = (item: Nullable<IJobExp>, index: number) => {
    const urlParam = encodeURLParams({ mode: editPageMode, id: item?.id, index: String(index) })
    navigateTo({ url: `/weapp/resume/edit-job-exp/index?${urlParam}` })
  }

  const projsExpEdit = (item: Nullable<IProjectExp>, index: number) => {
    const urlParam = encodeURLParams({ mode: editPageMode, id: item?.id, index: String(index) })
    navigateTo({ url: `/weapp/resume/edit-proj-exp/index?${urlParam}` })
  }

  useEffect(() => {
    if (displayResume.isActivated === ProfileType.NOSYNCS) {
      setNavigationBarTitle({
        title: '补充简历完整',
      })
    }
  }, [displayResume.isActivated])

  return (
    <MainLayout className={c('complete-resume', { 'no-integrity': mode !== 'complete' })}>
      {mode === 'complete' && displayResume.isActivated === ProfileType.CREATE ? (
        <IntegrityBar integrity={displayResume.integrity} />
      ) : null}
      {displayResume.isActivated === ProfileType.NOSYNCS ? (
        <>
          <View className="titleCard"></View>
          <View className="title">检测到与您手机号关联的简历，是否同步？</View>
        </>
      ) : null}
      <BasicInfoBlock basicInfo={displayResume} onEditClick={basicInfoEdit} />
      <IntentInfoBlock intentInfo={displayResume.intents} onEditClick={intentInfoEdit} />
      <EduExpBlock
        isStudent={isStudent}
        edusInfo={displayResume.profileEdu}
        onEditClick={edusExpEdit}
      />
      <JobExpBlock isStudent={isStudent} jobsInfo={displayResume.profileJob} onEditClick={jobsExpEdit} />
      <ProjExpBlock projsInfo={displayResume.profileProject} onEditClick={projsExpEdit} />

      {mode === 'complete' ? (
        displayResume.isActivated === ProfileType.NOSYNCS ? (
          <View className="bottomBtn">
            <FixedButton
              className="rounds"
              parentClassName="recreate"
              onClick={recreateClickHandler}
            >
              重新创建
            </FixedButton>
            <FixedButton
              parentClassName="syncBtn"
              onClick={SyncProfileBtn}
              onDisabledClick={tipErrorClickHandler}
              disabled={Boolean(currentResumeErrorBlock)}
              round={false}
            >
              快速同步
            </FixedButton>
          </View>
        ) : (
          <FixedButton
            onClick={deliveryHandler}
            onDisabledClick={tipErrorClickHandler}
            disabled={Boolean(currentResumeErrorBlock)}
            round={false}
          >
            {isHome ? '保存简历' : '继续沟通'}
          </FixedButton>
        )
      ) : (
        <FixedButton
          onClick={confirmHandler}
          onDisabledClick={tipErrorClickHandler}
          disabled={Boolean(confirmResumeErrorBlock)}
          round={false}
        >
          {effectiveActivity ? '保存简历领红包' : '保存简历'}
        </FixedButton>
      )}

      <LuckyDrawPopup ref={luckyDrawPopupRef} />
    </MainLayout>
  )
}

export default Resume
