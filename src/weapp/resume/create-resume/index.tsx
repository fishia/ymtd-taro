import { View, Image, Text } from '@tarojs/components'
import Taro, {
  authorize,
  eventCenter,
  getStorageSync,
  navigateTo,
  setNavigationBarTitle,
  setStorageSync,
  useDidShow,
} from '@tarojs/taro'
import React, { useEffect, useState } from 'react'

import { existsProfile } from '@/apis/MAIchat'
import { fetchDragonSpringWarActivityInfo } from '@/apis/award'
import { fetchUploadResumeResultApi } from '@/apis/resume'
import { fetchIsDyUser, getInfoApi } from '@/apis/user'
import redEnvelopesPng from '@/assets/imgs/springWar/red-envelopes.png'
import Navbar from '@/components/Navbar'
import ToastTips from '@/components/ToastTips'
import { COMPLETE_RESUME_EVENT_KEY, OPEN_REDPACKET_POPUP, OSS_STATIC_HOST } from '@/config'
import { IResume, ProfileType } from '@/def/resume'
import { defaultUserInfo } from '@/def/user'
import useOnce, { MAIResumeTool, MAIcreateResumeTips } from '@/hooks/custom/useOnce'
import { useShowLoginPopup } from '@/hooks/custom/usePopup'
import { useCurrentResume } from '@/hooks/custom/useResume'
import { usePreviewResume } from '@/hooks/custom/useResumePreview'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import useShowLoadingStatus from '@/hooks/custom/useShowLoadingStatus'
import useShowModal2 from '@/hooks/custom/useShowModal2'
import useToast from '@/hooks/custom/useToast'
import { useCurrentUserInfo } from '@/hooks/custom/useUser'
import { senceData } from '@/hooks/message/maiSocket'
import MainLayout from '@/layout/MainLayout'
import { activityStatus } from '@/services/DateService'
import { polling } from '@/services/NetworkService'
import { ensureResumeOptions } from '@/services/ResumeService'
import { encodeURLParams } from '@/services/StringService'
import { getVarParam, sendDataRangersEvent, sendHongBaoEvent } from '@/utils/dataRangers'
import { mpIsInIos } from '@/utils/utils'

import CreateResumeCard from '../components/CreateResumeCard'
import OnLineResumePop from '../components/OnLineResumePop'
import { useUploadResumeByWx } from './useUploadResumeByWx'

import './index.scss'
import { closeCreateResumeModal } from '@/components/Modal/CreateResumeModal'

export const uploadResumeFileEventKey = 'create-resume-upload'

const trackResumeCreateWay = (create_path_name: string) => {
  sendHongBaoEvent('CVCreateSelect', { page_name: '简历创建方式页', way_name: create_path_name })
}

const createByMAIIcon = `${OSS_STATIC_HOST}/mp/createResume/ic_M.AI%402x.png`

const createByPhoneIcon = `${OSS_STATIC_HOST}/mp/createResume/ic_online%402xpng%402x.png`

const createByWxDocIcon = `${OSS_STATIC_HOST}/mp/createResume/ic_Middle_weixin%402xpng%402x.png`

const createByFileIcon = `${OSS_STATIC_HOST}/mp/createResume/ic_phone%402xpng%402x.png`

const createByPCIcon = `${OSS_STATIC_HOST}/mp/createResume/ic_phone%402xpng%E5%A4%87%E4%BB%BD%402x.png`

const CreateResume: React.FC = () => {
  const focusCallToActionEnable = getVarParam('focusCallToActionEnable')
  const isCv = true
  const { jobId } = useRouterParam()
  const { showLoadingStatus, hideLoadingStatus } = useShowLoadingStatus()
  const showToast = useToast()
  const [isShowDyTips, setIsShowDyTips] = React.useState(false)

  const [toastOpen, setToastOpen] = React.useState<boolean>(false)
  const { needShow, setCurrentTips } = useOnce(MAIcreateResumeTips, true)
  const { needShow: needShowModal, setCurrentTips: setCurrentTipsModal } = useOnce(MAIResumeTool)
  const [showResume, setShowResume] = React.useState<boolean>(false)
  const [uuid, setUuid] = React.useState<string>('')
  const [needShowModalVal, setNeedShowModalVal] = useState<boolean>(needShowModal)

  const showModal = useShowModal2()
  const currentResume = useCurrentResume()
  const [, setPreviewResume] = usePreviewResume()
  const showLoginPopup = useShowLoginPopup()
  const userInfo = useCurrentUserInfo() || defaultUserInfo
  const [tipsVisible, setTipsVisible] = useState(true)
  const [redPacketCount, setRedPacketCount] = useState<number>()
  const isRecreate = Boolean(currentResume) && currentResume?.isActivated !== ProfileType.NOSYNCS
  const title = isRecreate ? '重新导入简历' : '选择创建方式'

  const createByWxDoc = useUploadResumeByWx(jobId)
  const effectiveActivity = activityStatus()

  useDidShow(() => {
    setNavigationBarTitle({ title })
  })

  const openActivityPopup = (flag = false) => {
    //TODO:B方案,开启活动弹窗
    if (flag) {
      setStorageSync(OPEN_REDPACKET_POPUP, true)
      showLoginPopup({
        noLoginMode: true,
        confirmText: '知道了',
      })
    }
  }

  useEffect(() => {
    closeCreateResumeModal()

    fetchDragonSpringWarActivityInfo().then(res => {
      setRedPacketCount(res.redPacketCount)
    })
  }, [])

  useEffect(() => {
    //活动期间内、首页红包弹窗未弹出则执行弹窗
    // if (effectiveActivity) openActivityPopup(!getStorageSync(OPEN_REDPACKET_POPUP))
    return () => {
      eventCenter.trigger(COMPLETE_RESUME_EVENT_KEY, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useDidShow(() => {
    eventCenter.off(uploadResumeFileEventKey)
  })

  useEffect(() => {
    // 判断释放为钓鱼用户，显示tips
    if (isRecreate) {
      return
    }

    fetchIsDyUser().then((res: boolean) => {
      setIsShowDyTips(res)
    })
  }, [])

  // 通过聊天文件 or Webview 上传文件后处理 fileKey
  const handleUploadByFileKey = async (fileKey: number, way_name: string) => {
    showLoadingStatus({ hasNavBar: true, loadingText: '文件上传中...' })
    const resume = await polling<IResume>(() => fetchUploadResumeResultApi(fileKey), Boolean).then(
      ensureResumeOptions
    )

    hideLoadingStatus()
    setPreviewResume(resume)

    navigateTo({
      url:
        '/weapp/resume/complete-resume/index?' +
        encodeURLParams({ mode: 'confirm', jobId: jobId, way_name }),
    })
  }

  const createByUploadFile = () => {
    trackResumeCreateWay('手机文件导入')

    eventCenter.once(uploadResumeFileEventKey, filekey =>
      handleUploadByFileKey(filekey, '手机文件导入')
    )
    navigateTo({ url: '/weapp/resume/upload-webview/index?type=resume' })
  }

  const closeModal = () => {
    setCurrentTipsModal()
    setNeedShowModalVal(false)
  }

  const toResumeStep = () => {
    sendDataRangersEvent('Button_click', {
      button_name: '继续在线填写',
      page_name: 'M.AI_IM页',
      popup_name: '自动填充弹窗',
    })
    closeModal()
    navigateTo({ url: '/weapp/resume/resume-step/index' + (jobId ? `?jobId=${jobId}` : '') })
  }

  const createByPhone = async () => {
    trackResumeCreateWay('在线填写')

    const { hasMaiProfile, uuid: id } = await existsProfile()

    if (!hasMaiProfile) {
      toResumeStep()
      return
    }
    setUuid(id)

    if (needShowModalVal) {
      showModal({
        text: '检测到M.AI已为你生成过简历内容，使用后可帮你更快的完成简历创建，是否自动填充？',
        confirmText: '自动填充简历内容',
        cancelText: '继续在线填写',
        cancelWidth: 327,
        confirmWidth: 327,
        cancelBtnClose: toResumeStep,
      }).then(res => {
        closeModal()
        if (res) {
          sendDataRangersEvent('Button_click', {
            button_name: '自动填充简历内容',
            page_name: 'M.AI_IM页',
            popup_name: '自动填充弹窗',
          })
          setShowResume(true)
        }
      })
      return
    }
    toResumeStep()
  }

  const createByPC = () => {
    trackResumeCreateWay('电脑端填写')
    authorize({ scope: 'scope.camera' })
      .then(() => void navigateTo({ url: '/weapp/resume/create-scan-qrcode/index' }))
      .catch(() => void showToast({ content: '请授权相机权限以扫码登录 PC 端' }))
  }

  const createByMAI = () => {
    trackResumeCreateWay('M.AI自动生成简历')
    const params = {
      sence: senceData.PROFILE,
    }
    navigateTo({
      url: `/weapp/MAI/chat/index?params=${JSON.stringify(params)}`,
    })
  }

  const onClose = e => {
    e.stopPropagation()
    setToastOpen(false)
    setCurrentTips()
  }

  const back = async () => {
    const { profile } = await getInfoApi()
    if (isCv && !profile) {
      Taro.showToast({
        title: '创建简历后即可查看相关职位，快去创建简历吧~',
        icon: 'none',
        duration: 1500,
      })
      return
    }
    Taro.navigateBack({ delta: 1 })
  }

  useEffect(() => {
    sendDataRangersEvent('CreateResumeWayPageExpose')

    setToastOpen(needShow)
  }, [])

  const renderTipsContent = () => {
    const isIos = mpIsInIos()

    return (
      <View className="tips-content">
        <View>2024医药人升职季活动期间</View>
        <View className="bold">
          创建简历可得
          <Text className="red">{isIos ? '大健康行业白皮书' : '50元大红包'}</Text>
        </View>
        <View>
          累积已发放
          <Text className="bold">{redPacketCount}</Text>
          个红包
        </View>
      </View>
    )
  }

  const onTipsClose = () => {
    setTipsVisible(false)
  }

  const renderExtra = () => {
    // TODO TODO 解除屏蔽
    if (userInfo.stage !== 1) {
      return
    }

    return (
      <View className="create-resume__title-extra">
        <Image src={redEnvelopesPng} className="create-resume__title-extra-icon" />
        <ToastTips
          className="create-resume__title-extra-tips"
          content={renderTipsContent()}
          isBlackClose
          visible={tipsVisible}
          onClose={onTipsClose}
        />
      </View>
    )
  }

  return (
    <>
      <Navbar title={title} onBack={back}></Navbar>
      {isShowDyTips && (
        <View className="create-resume__dytips">请先完成简历创建，再填写面试题</View>
      )}
      <MainLayout navBarTitle={title} className="create-resume">
        <View className="create-resume__title">
          创建简历
          {renderExtra()}
        </View>
        <View className="create-resume__subTitle">先创建简历才能查看职位</View>

        <View className="create-resume__topCard">
          <CreateResumeCard
            title="微信导入"
            isShowRecommend
            titleImgSrc={createByWxDocIcon}
            onClick={createByWxDoc}
          />

          <CreateResumeCard
            title="手机文件导入"
            titleImgSrc={createByFileIcon}
            onClick={createByUploadFile}
          />
          <View className="create-resume__tips">
            AI智能识别文件自动生成在线简历，支持word/pdf/jpg/jpeg/png格式，文件大小：20M以内
          </View>

          <CreateResumeCard
            title="M.AI自动生成简历"
            titleImgSrc={createByMAIIcon}
            onClick={createByMAI}
            isShowRedPoint
            onClose={onClose}
          />
          <View className="create-resume__tips">
            运用世界尖端AIGC技术，帮你30秒自动生成高质量简历
          </View>

          {isRecreate ? null : (
            <CreateResumeCard
              title="在线填写"
              titleImgSrc={createByPhoneIcon}
              onClick={createByPhone}
            />
          )}
        </View>

        <CreateResumeCard title="电脑端填写" titleImgSrc={createByPCIcon} onClick={createByPC} />
      </MainLayout>
      <OnLineResumePop
        page_name="我的在线简历页"
        uuid={uuid}
        open={showResume}
        onClose={() => setShowResume(false)}
      />
    </>
  )
}

export default CreateResume
