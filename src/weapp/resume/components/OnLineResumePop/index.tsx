import { View } from '@tarojs/components'
import { disableAlertBeforeUnload, getCurrentPages, navigateTo, reLaunch } from '@tarojs/taro'
import { FC, useEffect, useState } from 'react'
import { AtFloatLayout } from 'taro-ui'

import { chooseMessage, getMaiProfile } from '@/apis/MAIchat'
import { completedSetResumeApi } from '@/apis/resume'
import Button from '@/components/Button'
import { IEducationExp, IJobExp, IProjectExp, IResumeIntentInfo, defaultResume } from '@/def/resume'
import { useRefreshCurrentResume } from '@/hooks/custom/useResume'
import { usePreviewResume } from '@/hooks/custom/useResumePreview'
import useShowModal2 from '@/hooks/custom/useShowModal2'
import useToast from '@/hooks/custom/useToast'
import { checkResumeErrorBlock } from '@/services/ResumeService'
import { encodeURLParams } from '@/services/StringService'
import { sendResumeEvent } from '@/utils/dataRangers'

import BasicInfoBlock from '../BasicInfoBlock'
import EduExpBlock from '../EduExpBlock'
import IntegrityBar from '../IntegrityBar'
import IntentInfoBlock from '../IntentInfoBlock'
import JobExpBlock from '../JobExpBlock'
import OnLineLoading from '../OnLineLoading'
import ProjExpBlock from '../ProjExpBlock'

import './index.scss'

interface IProps {
  open: boolean
  uuid: string
  extraContent?: string
  onClose: () => void
  page_name: string
}

const OnLineResumePop: FC<IProps> = props => {
  //   const resumeInfo = useCurrentResume()
  const { open, onClose, uuid, extraContent, page_name } = props
  const confirmResume = usePreviewResume()[0] || defaultResume
  const [, dispatchSetPreviewResume] = usePreviewResume()
  const isStudent = confirmResume?.workBeginTime === '0000-00-00'
  const [showTips, setShowTips] = useState<boolean>(true)
  const [percent, setPercent] = useState(0)
  const [loadingType, setLoadingType] = useState<'loading' | 'fail' | 'success'>('loading')
  const showToast = useToast()
  const refreshResume = useRefreshCurrentResume()
  const showModal = useShowModal2()
  const way_name = 'M.AI自动生成简历'

  const basicInfoEdit = () => {
    navigateTo({ url: `/weapp/resume/edit-basic-info/index?mode=confirm` })
  }

  const intentInfoEdit = (item: Nullable<IResumeIntentInfo>, index: number) => {
    const urlParam = encodeURLParams({ mode: 'confirm', id: item?.id, index: String(index) })
    navigateTo({ url: `/weapp/resume/edit-intent-info/index?${urlParam}` })
  }

  const edusExpEdit = (item: Nullable<IEducationExp>, index: number) => {
    const urlParam = encodeURLParams({
      mode: 'confirm',
      id: item?.id,
      index: String(index),
      isStudent,
    })
    navigateTo({ url: `/weapp/resume/edit-edu-exp/index?${urlParam}` })
  }

  const jobsExpEdit = (item: Nullable<IJobExp>, index: number) => {
    const urlParam = encodeURLParams({ mode: 'confirm', id: item?.id, index: String(index) })
    navigateTo({ url: `/weapp/resume/edit-job-exp/index?${urlParam}` })
  }

  const projsExpEdit = (item: Nullable<IProjectExp>, index: number) => {
    const urlParam = encodeURLParams({ mode: 'confirm', id: item?.id, index: String(index) })
    navigateTo({ url: `/weapp/resume/edit-proj-exp/index?${urlParam}` })
  }

  const save = () => {
    const pageStack = getCurrentPages() || []
    const prePage = pageStack[pageStack.length - 2]
    sendResumeEvent('SaveResume', {
      page_name: page_name,
      prepage_name: prePage?.config?.navigationBarTitleText || '',
      way_name,
      user_role: isStudent ? '学生' : '职场人',
    })
    const checkResume = checkResumeErrorBlock(confirmResume)
    if (checkResume) {
      showToast({ content: '请补全必填信息' })
      return
    }
    completedSetResumeApi(confirmResume, way_name)
      .then(() => {
        disableAlertBeforeUnload()
        // showToast({ content: '导入简历成功' })
      })
      .then(refreshResume)
      .then(() => {
        extraContent && chooseMessage(extraContent, uuid)
      })
      .then(() => {
        reLaunch({ url: `/weapp/pages/job/index?MAIprofile=true` })
      })
      .catch(err => void showToast({ content: err.errorMessage || '导入简历失败' }))
  }

  const getResume = () => {
    setLoadingType('loading')
    setTimeout(() => {
      setPercent(90)
    }, 100)
    getMaiProfile(uuid)
      .then(res => {
        setPercent(100)
        dispatchSetPreviewResume(res)
        setLoadingType('success')
      })
      .catch(() => {
        setLoadingType('fail')
      })
  }

  useEffect(() => {
    if (open) {
      getResume()
      return
    }
    setPercent(0)
  }, [open])

  useEffect(() => {
    const checkResume = checkResumeErrorBlock(confirmResume)
    if (checkResume) {
      setShowTips(true)
      return
    }
    setShowTips(false)
  }, [confirmResume])

  return (
    <>
      <AtFloatLayout
        isOpened={open}
        title="我的在线简历"
        className="OnLineResumePopCss"
        onClose={onClose}
      >
        {confirmResume && loadingType === 'success' ? (
          <>
            <View
              className="OnLineResumePopCss__resumeContent"
              style={{ paddingTop: `${showTips ? 80 : 0}rpx` }}
            >
              {showTips && <View className="resumeTips">您的简历不完整，完善后可以查看职位</View>}
              <IntegrityBar integrity={confirmResume.integrity} />
              <BasicInfoBlock basicInfo={confirmResume} onEditClick={basicInfoEdit} />
              <IntentInfoBlock intentInfo={confirmResume.intents} onEditClick={intentInfoEdit} />
              <EduExpBlock
                isStudent={isStudent}
                edusInfo={confirmResume.profileEdu}
                onEditClick={edusExpEdit}
              />
              <JobExpBlock
                isStudent={isStudent}
                jobsInfo={confirmResume.profileJob}
                onEditClick={jobsExpEdit}
              />
              <ProjExpBlock projsInfo={confirmResume.profileProject} onEditClick={projsExpEdit} />
            </View>
            <View className="OnLineResumePopCss__saveBtnContent">
              <Button className="saveBtn" onClick={save}>
                保存
              </Button>
            </View>
          </>
        ) : (
          <OnLineLoading type={loadingType} percent={percent} onClick={getResume} />
        )}
      </AtFloatLayout>
    </>
  )
}

export default OnLineResumePop
