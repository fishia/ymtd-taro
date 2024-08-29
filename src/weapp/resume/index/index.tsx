import { eventCenter, navigateTo, useRouter } from '@tarojs/taro'
import c from 'classnames'
import React, { useEffect } from 'react'

import { fetchBatchSaveIntentsApi, fetchHistoryUserIntentsApi } from '@/apis/resume'
import { FixedBottomPopup } from '@/components/Popup'
import { REFRESH_INTENTS_LIST } from '@/config'
import { IEducationExp, IJobExp, IProjectExp, IResumeIntentInfo } from '@/def/resume'
import {
  useFixedBottomPopup,
  useFixedBottomPupupRef,
  useShowLoginPopup,
} from '@/hooks/custom/usePopup'
import { useCurrentResume, useRefreshCurrentResume } from '@/hooks/custom/useResume'
import useToast from '@/hooks/custom/useToast'
import { useIsLogin } from '@/hooks/custom/useUser'
import MainLayout from '@/layout/MainLayout'
import { ensureResumeOptions, previewCurrentResumeAttachment } from '@/services/ResumeService'
import { encodeURLParams } from '@/services/StringService'
import { sendDataRangersEventWithUrl, sendHongBaoEvent, sendResumeEvent } from '@/utils/dataRangers'

import BasicInfoBlock from '../components/BasicInfoBlock'
import EduExpBlock from '../components/EduExpBlock'
import IntegrityBar from '../components/IntegrityBar'
import IntentInfoBlock from '../components/IntentInfoBlock'
import JobExpBlock from '../components/JobExpBlock'
import NoLogin from '../components/NoLogin'
import NoResume from '../components/NoResume'
import ProjExpBlock from '../components/ProjExpBlock'
import SelectIntentsPopupCard from '../intent-info-list/components/selectIntentsPopupCard'
import ActionBar from './ActionBar'
import AttachmentNoticePopup, { showAttachmentNoticePopup } from './AttachmentNoticePopup'

import './index.scss'

const Resume: React.FC = () => {
  const { hideRecreate, soucre } = useRouter().params

  const fixedbottomPopupRef = useFixedBottomPupupRef()
  const showLoginPopup = useShowLoginPopup()
  const showToast = useToast()
  const isLogined = useIsLogin()
  const resumeInfo = useCurrentResume()
  const refreshResume = useRefreshCurrentResume()
  const isStudent = resumeInfo?.workBeginTime === '0000-00-00'

  const { open, close } = useFixedBottomPopup()

  useEffect(() => {
    if (hideRecreate) {
      showAttachmentNoticePopup(soucre === 'fileupload')
    }
  }, [hideRecreate, soucre])

  useEffect(() => {
    if (isLogined) {
      refreshResume()
        .then(ensureResumeOptions)
        .catch(() => void showToast({ content: '获取简历信息失败' }))

      fetchHistoryUserIntentsApi().then(data => {
        const batchSaveIntents = (intents: IResumeIntentInfo[]) => {
          fetchBatchSaveIntentsApi(intents).then(list => {
            close()
            refreshResume()
            eventCenter.trigger(REFRESH_INTENTS_LIST, list)
          })
        }

        // 0未处理，1已处理
        if (data && !data.isMigrated) {
          open({
            key: 'select_intent',
            closeIconStyle: {
              position: 'absolute',
              top: '28px',
              right: '20px',
              color: '#333',
            },
            children: (
              <SelectIntentsPopupCard
                data={data.intents}
                primaryButtonText="知道了"
                onPrimaryButtonClick={() => batchSaveIntents(data.intents)}
              />
            ),
            onClose: () => batchSaveIntents(data.intents),
          })
        }
      })
    }
  }, [close, isLogined, open, refreshResume, showToast])

  // 未登录：返回登录提示
  if (!isLogined) {
    return (
      <MainLayout className="resume-index">
        <NoLogin onLoginClick={showLoginPopup} />
      </MainLayout>
    )
  }

  // 无简历：提示创建
  if (!resumeInfo) {
    const createClickHandler = () => {
      sendResumeEvent('CreateResumeClick')
      navigateTo({ url: '/weapp/resume/create-resume/index' })
    }

    return (
      <MainLayout className="resume-index">
        <NoResume onCreateClick={createClickHandler} />
      </MainLayout>
    )
  }

  const basicInfoEdit = () => void navigateTo({ url: '/weapp/resume/edit-basic-info/index' })

  const intentInfoEdit = (item: Nullable<IResumeIntentInfo>) => {
    sendHongBaoEvent(item?.id ? 'IntentionCardClick' : 'IntentionAddClick')

    navigateTo({
      url: `/weapp/resume/edit-intent-info/index${item ? '?id=' + item.id : ''}`,
    })
  }

  const edusExpEdit = (item: Nullable<IEducationExp>) => {
    const urlParam = encodeURLParams({ id: item?.id, isStudent })
    void navigateTo({ url: `/weapp/resume/edit-edu-exp/index?${urlParam}` })
  }

  const jobsExpEdit = (item: Nullable<IJobExp>) =>
    void navigateTo({ url: `/weapp/resume/edit-job-exp/index${item ? '?id=' + item.id : ''}` })

  const projsExpEdit = (item: Nullable<IProjectExp>) =>
    void navigateTo({ url: `/weapp/resume/edit-proj-exp/index${item ? '?id=' + item.id : ''}` })

  const recreateHandler = () => void navigateTo({ url: '/weapp/resume/create-resume/index' })

  const previewAttachmentHandler = () => {
    previewCurrentResumeAttachment()
    sendDataRangersEventWithUrl('PreviewAttachmentShow', {
      button_name: '附件简历',
      source: '我的简历',
    })
  }

  const reuploadAttachmentHandler = () => {
    navigateTo({ url: '/weapp/resume/upload-resume-file/index' })
    sendDataRangersEventWithUrl('ReuploadAttachmentClick', {
      button_name: '重传简历',
      source: '我的简历',
    })
  }

  return (
    <MainLayout className={c('resume-index', hideRecreate ? 'hide-button' : '')}>
      <IntegrityBar integrity={resumeInfo.integrity} />
      <BasicInfoBlock basicInfo={resumeInfo} onEditClick={basicInfoEdit} />
      <IntentInfoBlock intentInfo={resumeInfo.intents} onEditClick={intentInfoEdit} />
      <EduExpBlock
        isStudent={isStudent}
        edusInfo={resumeInfo.profileEdu}
        onEditClick={edusExpEdit}
      />
      <JobExpBlock
        isStudent={isStudent}
        jobsInfo={resumeInfo.profileJob}
        onEditClick={jobsExpEdit}
      />
      <ProjExpBlock projsInfo={resumeInfo.profileProject} onEditClick={projsExpEdit} />

      {hideRecreate ? null : (
        <ActionBar
          onReuploadResume={recreateHandler}
          onPreviewAttachment={previewAttachmentHandler}
          onReuploadAttachment={reuploadAttachmentHandler}
        />
      )}

      <AttachmentNoticePopup />
      <FixedBottomPopup ref={fixedbottomPopupRef} />
    </MainLayout>
  )
}

export default Resume
