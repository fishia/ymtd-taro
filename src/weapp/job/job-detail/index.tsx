import { Button, Image, Swiper, SwiperItem, View } from '@tarojs/components'
import {
  eventCenter,
  getCurrentPages,
  getStorageSync,
  navigateBack,
  navigateTo,
  redirectTo,
  setStorageSync,
  switchTab,
  useDidShow,
  usePageScroll,
  useReachBottom,
  previewMedia,
  reLaunch,
  pageScrollTo,
} from '@tarojs/taro'
import c from 'classnames'
import _ from 'lodash'
import R from 'ramda'
import { useEffect, useRef, useState } from 'react'

import {
  detailJobApi,
  listSimilarJobsApi,
  generatorJobCardsApi,
  shareJobApi,
  favoriteJobApi,
  deleteFavoriteApi,
  listQualityPositionListApi,
  saveCheerApi,
  fetchGreetingWordsApi,
  fetchtRecommendPosition,
} from '@/apis/job'
import { fetchQueryHaveChat, initChatApi } from '@/apis/message'
import { checkResumeApi } from '@/apis/resume'
import { restoreCompanyApi } from '@/apis/shieldingCompany'
import Line from '@/components/Line'
import LoginButton from '@/components/LoginButton'
import Navbar from '@/components/Navbar'
import FixedBottomPopup from '@/components/Popup/fixedBottomPopup'
import { useSpringWarPopup } from '@/components/Popup/goSpringWarPopup'
import RefuelPackagePopup from '@/components/Popup/refuelPackagePopup'
import { onJumpStickyFn } from '@/components/Popup/resumeStickyPopup'
import ShareCard from '@/components/Popup/sharePopup'
import QualityPositionPopup, {
  shouldShowQualityPositionPopup,
  useQualityPositionPopup,
} from '@/components/QualityPositionPopup'
import ToastTips from '@/components/ToastTips'
import {
  APP_DEF_PAGE_SIZE,
  COMPLETE_RESUME_EVENT_KEY,
  HR_BASE_HOST,
  JOB_CHAT_RESUME_NOMORE_TIPS,
  PROFILE,
  STATIC_MP_IMAGE_HOST,
} from '@/config'
import { LoadStatusType } from '@/def/common'
import {
  ICompany,
  IGreetingMapItem,
  IHrInfo,
  IJob,
  IJobWithIndex,
  virtualType,
  JobType,
} from '@/def/job'
import { useCurrentCity } from '@/hooks/custom/useCity'
import useOnce, { chatInitiativeTips, stopJobDetailBackTips } from '@/hooks/custom/useOnce'
import {
  useShowLoginPopup,
  useFixedBottomPopup,
  useFixedBottomPupupRef,
  useRefuelPackagePopup,
  useRefuelPackagePopupRef,
  useResumeStickyPopup,
} from '@/hooks/custom/usePopup'
import { bestEmployerByToken } from '@/hooks/custom/usePopupData'
import { useResumeId } from '@/hooks/custom/useResume'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import useShowLoadingStatus from '@/hooks/custom/useShowLoadingStatus'
import useShowModal from '@/hooks/custom/useShowModal'
import useToast from '@/hooks/custom/useToast'
import {
  useCurrentUserInfo,
  useGetHaveChat,
  useIsLogin,
  useSpringStatus,
} from '@/hooks/custom/useUser'
import { useInitChatByTargetId } from '@/hooks/message'
import MainLayout from '@/layout/MainLayout'
import { isSchoolVersion } from '@/services/AccountService'
import { activityStatus } from '@/services/DateService'
import { checkIsRepeat, ensureIMConnect } from '@/services/IMService'
import store, {
  dispatchAddUserFavorite,
  dispatchDeleteUserFavorite,
  dispatchSetHaveChat,
  dispatchSetInviteCode,
} from '@/store'
import dataRangers, { sendDataRangersEventWithUrl } from '@/utils/dataRangers'
import { reportLog } from '@/utils/reportLog'
import { pxTransform } from '@/utils/taroUtils'
import { jumpToWebviewPage, getJobType, getJobDetailPath } from '@/utils/utils'
import Radio from '@/weapp/job/components/Radio'
import SwiperBar from '@/weapp/pages/job/components/SwiperBar'
import SubscriptionPopupCard from '@/weapp/pages/message/components/SubscriptionPopupCard'

import ChatConfirmPopup, {
  getLastConfirmType,
  IChatConfirmPopupRef,
} from '../components/ChatConfirmPopup'
import GreetingPopup, { GreetingPopupStatusEnum } from '../components/GreetingPopup'
import HrInfo from '../components/HrInfo'
import JobDetailCompany from '../components/JobDetailCompany'
import JobDetailsTemplate from '../components/JobDetailsTemplate'
import Position from '../components/Position'
import RecommendJobList from '../components/RecommendJobList'
import SafetyTips from '../components/SafetyTips'
import SubmitBar from '../components/SubmitBar'
import CompanyPhotos from '../components/WrapPanel'

import './index.scss'

// 职位详情埋点
const trackJobDetail = (job: IJob, routerParams, profileId) => {
  const time = new Date().getTime(),
    commonParams = {
      position_type: job.function_type_name || '',
      experience_level: job.work_time_name,
      corporate_name: job.company.name,
      corporate_type: job.company.type_name,
      company_size: job.company.scale_name,
      work_province: (job.addresses || []).map(t => t.province).join(','),
      work_city: (job.addresses || []).map(t => t.city).join(','),
      salary_range: job.salary,
      is_preferred: job.is_priority,
      is_top: job.is_top,
      jd_id: job.id,
    }
  if (job.updated_at) {
    Object.assign(commonParams, {
      renew_time: Math.floor((time - new Date(job.updated_at).valueOf()) / 1000),
    })
  }
  let eventParams = {
    ...routerParams,
    ...commonParams,
  }
  if (routerParams.scene in eventParams) {
    delete eventParams[routerParams.scene]
  }
  sendDataRangersEventWithUrl('PositionDetailsPageview', {
    ...eventParams,
  })

  if (!routerParams.isSeed) {
    sendDataRangersEventWithUrl('Job_view', {
      expose_id: routerParams.expose_id,
      cv_id: profileId,
      jd_id: job.id,
      hr_id: job.hr?.id,
      exp_channel: routerParams.exp_channel,
      ab_name: routerParams.expName,
      exp_source: 'C小程序',
      page_no: routerParams.page_no,
      position_no: routerParams.position_no,
      jd_type: virtualType(job.isVirtual),
      jd_status: getJobType(job?.is_priority, job?.topStatus),
      is_refresh: job?.refreshStatus ? '是' : '否',
      sales_done: routerParams?.salesDone || '',
    })
  }
}

// 跳转补全简历页面
const completeResume = (jobId: number) =>
  new Promise(res => {
    eventCenter.off(COMPLETE_RESUME_EVENT_KEY)
    eventCenter.once(COMPLETE_RESUME_EVENT_KEY, res)
    navigateTo({ url: `/weapp/resume/complete-resume/index?jobId=${jobId}` })
  })

const emptyArray: any[] = []

interface InavBarType {
  type?: string
}

const JobDetail = () => {
  // const isSendResume = getVarParam('isSendResume')
  const routerParams = useRouterParam()

  // 存在直接进入/扫码进入/扫旧版码进入等情况，且 ID 可能有逗号分隔，逗号前是职位 ID，逗号后是顾问邀请码 code
  const [jd_id, jdInviteCode] = routerParams.scene ? routerParams.scene.split(',') : ''
  const sceneJdId = jd_id
  if (jdInviteCode) {
    dispatchSetInviteCode(jdInviteCode)
  }

  const paramId = routerParams.jd_id || routerParams.id || sceneJdId

  const choiceTag = decodeURIComponent(routerParams.tag || '')
  const hrId = routerParams.hr_id
  const jobId = parseInt(paramId || '', 10)
  const fixedbottomPopupRef = useFixedBottomPupupRef()
  const refuelPackagePupupRef = useRefuelPackagePopupRef()
  const reportWhenStartChat = routerParams.reportWhenStartChat
    ? JSON.parse(decodeURI(routerParams.reportWhenStartChat))
    : null
  const isActive = Number(routerParams.isActive) ? 1 : 0
  const cardSource = routerParams?.cardSource || ''
  // const guidePopupRef = useRef<any>(null)
  const showToast = useToast()
  const showModal = useShowModal({ mode: 'then' })
  const showLoginPopup = useShowLoginPopup()
  const initChat = useInitChatByTargetId()
  const { close, openSharePopup } = useFixedBottomPopup()
  const { hideLoadingStatus } = useShowLoadingStatus()
  //const [open, closeGuide] = useShowGuidePopup()
  const [showQualityPositionPopup] = useQualityPositionPopup()
  const [showRefuelPackagePopup] = useRefuelPackagePopup()
  const { checkImAndShowPop } = useResumeStickyPopup()

  const [positionData, setPositionData] = useState<IJob & { has_chat: boolean }>()
  const [companyData, setCompanyData] = useState<ICompany>()
  const [hrData, setHrData] = useState<IHrInfo>()

  const [applyLoading, setApplyLoading] = useState(false)
  const [isValid, setIsValid] = useState<boolean>()
  const [skipTip, setSkipTip] = useState<boolean>(false)

  const [list, setList] = useState<IJobWithIndex[]>([])
  const [page, setPage] = useState<number>(1)
  const [loadStatus, setLoadStatus] = useState<LoadStatusType>('more')

  const city = useCurrentCity()
  const isLogined = useIsLogin()
  const userInfo = useCurrentUserInfo()
  const resumeId = useResumeId()
  const effectiveActivity = activityStatus()

  const [isClickChat, setIsClickChat] = useState(false)
  const [isClickApply, setIsClickApply] = useState(false)
  const chatConfirmPopupRef = useRef<IChatConfirmPopupRef>(null)
  const [canShowConfirm, setCanShowConfirm] = useState(false)
  const [tipsVisible, setTipsVisible] = useState(false)
  const { needShow, setCurrentTips } = useOnce(chatInitiativeTips, true)
  const haveChat = useGetHaveChat()
  const { checkAndShowSpringModal } = useSpringWarPopup()
  const [greetingPopupStatus, setGreetingPopupStatus] = useState(GreetingPopupStatusEnum.HIDE)
  const [greetingWords, setGreetingWords] = useState<IGreetingMapItem[]>(emptyArray)
  let profileId = ''
  if (isLogined) {
    profileId = getStorageSync(PROFILE)?.id
  }
  const { showSpringGetAward } = useSpringStatus()

  // 是否已收藏
  const isFavorited = userInfo?.favorite_ids?.includes(jobId) ?? false
  const profileTop = userInfo?.profileTop || 0
  const profileTopADExpose = userInfo?.profileTopADExpose || 0
  const isApply = positionData?.has_apply || isClickApply
  const deliverBtnText = isApply ? '已投递' : '投递简历'
  const showBadge = showSpringGetAward && !isApply
  const { isPreJob, isJobUrl, isJobZoneUrl } = getJobDetailPath()
  const [isShowResumeStickyPopup, setIsShowResumeStickyPopup] = useState(false)
  const [navBarType, setNavBarType] = useState<InavBarType>({})
  const { needShow: isStopBack, setCurrentTips: setStopBackTips } = useOnce(stopJobDetailBackTips)


  useEffect(() => {
    if (jdInviteCode) {
      sendDataRangersEventWithUrl('CooperatewithHeadhuntersMiniprogramsExpose')
    }
  }, [])

  useEffect(() => {
    routerParams?.scene && setNavBarType({ type: 'sharePage' })
  }, [])

  const getDecodeRouterParams = () => {
    return {
      keyword: decodeURIComponent(routerParams.keyword || ''),
      search_city: decodeURIComponent(routerParams.search_city || ''),
      expected_position: decodeURIComponent(routerParams.expected_position || ''),
      prepage_name: decodeURIComponent(routerParams.page_name || ''),
      expected_city: decodeURIComponent(routerParams.expected_city || ''),
      jd_type: decodeURIComponent(routerParams.jd_type || ''),
      exp_channel: decodeURIComponent(routerParams.exp_channel || ''),
      expName: decodeURIComponent(routerParams.expName || ''),
      choiceTag: decodeURIComponent(routerParams.tag || ''),
    }
  }
  useEffect(() => {
    if (isClickApply || isClickChat) {
      setGreetingPopupStatus(GreetingPopupStatusEnum.HIDE)
    }
  }, [isClickApply, isClickChat])

  useEffect(() => {
    dataRangers.getVar('canConfirmOnOnlyChat', false, setCanShowConfirm)
  }, [])

  usePageScroll(() => {
    if (
      [GreetingPopupStatusEnum.DEFAULT, GreetingPopupStatusEnum.OPEN].includes(greetingPopupStatus)
    ) {
      setGreetingPopupStatus(GreetingPopupStatusEnum.SHORT)
    }
  })

  const pointConnect = (btnText: string, connection_id: string) => {
    if (!positionData?.has_chat && !isClickChat) {
      sendDataRangersEventWithUrl('Connection', {
        connection_id,
        connection_type: btnText,
        page_type: '职位详情',
        expose_id: routerParams.expose_id,
        cv_id: profileId,
        jd_id: positionData?.id,
        hr_id: positionData?.hr?.id,
        exp_channel: getDecodeRouterParams().exp_channel,
        ab_name: getDecodeRouterParams().expName,
        exp_source: 'C小程序',
        page_no: routerParams.page_no,
        position_no: routerParams.position_no,
        jd_type: virtualType(Number(routerParams.isVirtual)),
        jd_status: getJobType(positionData?.is_priority, positionData?.topStatus),
        is_refresh: positionData?.refreshStatus ? '是' : '否',
        sales_done: routerParams?.salesDone || '',
      })
    }
  }

  useDidShow(() => {
    if (!jobId) {
      showToast({
        content: '找不到该职位',
        onClose: () => void switchTab({ url: '/weapp/pages/job/index' }),
      })
    }
    getDetailJob(jobId, hrId)

    if (isLogined && !haveChat && needShow) {
      getHaveChatStatus()
    }
  })

  useEffect(() => {
    setTipsVisible(!haveChat && needShow)
  }, [haveChat, needShow])

  useEffect(() => {
    if (profileTopADExpose && !profileTop) {
      sendDataRangersEventWithUrl('EventExpose', {
        event_name: '简历置顶服务',
        type: 'banner',
      })
    }
  }, [])

  const getDetailJob = (id, hrId) => {
    detailJobApi(id, hrId)
      .then((result: any) => {
        if (result === null) {
          return
        }
        trackJobDetail(result, { ...routerParams, ...getDecodeRouterParams() }, profileId)

        setIsValid(result.status === 1 || result.status_name === '上线')
        setPositionData(result)
        setCompanyData({ ...result.company, attractionTag: result?.attractionTag || '' })

        if (result?.has_chat || isClickChat) {
        } else if (isLogined) {
          setGreetingPopupStatus(GreetingPopupStatusEnum.DEFAULT)
          fetchGreetingWordsApi(jobId).then(setGreetingWords)
        }

        if (result.hr) {
          setHrData({
            ...result.hr,
            companyName: R.pathOr(null, ['company', 'name'], result),
            replyTag: result?.replyTag,
            activeTag: result?.activeTag,
          })
        }
      })
      .catch(e => {
        console.log(e)
        showToast({ content: '加载职位信息出错' })
        redirectTo({ url: '/weapp/general/error/index' })
      })
  }

  // 是否发起沟通过
  const getHaveChatStatus = () => {
    fetchQueryHaveChat()
      .then(res => {
        dispatchSetHaveChat(res)
        if (!res) {
          setTipsVisible(true)
          sendDataRangersEventWithUrl('TipsExpose', { tips_name: '主动发起tips' })
        }
      })
      .catch(res => void showToast({ content: res.message }))
  }

  // 职位模板加载完毕
  const afterTemplateLoaded = () => {
    hideLoadingStatus()
  }

  // 点击公司，此处防止陷入 navigateBack hell
  const goCompany = (id: number, is_open: number) => {
    const lastPage = getCurrentPages().slice(-2, -1)
    if (lastPage[0]?.config.navigationBarTitleText === '公司主页') {
      navigateBack()
    } else {
      if (is_open === 1) {
        navigateTo({ url: `/weapp/job/company-index/index?id=${id}` })
      } else {
        showToast({ content: '抱歉!该公司已隐藏信息,无法查看详情' })
      }
    }
  }

  const checkResume = async (isClickChatOnly?: boolean) => {
    // 进入时已确定无简历的用户，提示创建
    if (!resumeId) {
      sendDataRangersEventWithUrl('ActivPopupExpose')
      showModal({
        content: '请先创建一份简历',
        confirmText: effectiveActivity ? '创建简历领红包' : '立即创建',
      }).then(result => {
        sendDataRangersEventWithUrl('CreateResumeClick')
        if (result) {
          sendDataRangersEventWithUrl('ActivPopupClick', { is_activ_raffle: 1 })
          navigateTo({ url: `/weapp/resume/create-resume/index?jobId=${jobId}` })
        } else {
          sendDataRangersEventWithUrl('ActivPopupClick', { is_activ_raffle: 0 })
        }
      })
      return false
    }

    // 调用 API 检测简历完整情况
    const checkResult = await checkResumeApi(resumeId)
    const { required, optional } = checkResult || {}

    // 必填项缺失，须跳转补全，否则沟通不能继续
    if (!R.where({ basic: Boolean, education: Boolean }, required)) {
      const tips: string[] = []
      required.basic || tips.push('【基本信息】')
      required.education || tips.push('【教育信息】')

      const requiredModalResult = await showModal({
        content: `您的${tips.join('')}不完善，请完善信息后再沟通`,
        confirmText: '立即完善',
      })

      if (!requiredModalResult || !(await completeResume(jobId))) {
        return false
      }
    }

    // 可选项缺失，可以跳转补全，也可以继续沟通
    const isOptionalChecked = R.where({ job: Boolean, project: Boolean, intent: Boolean }, optional)
    if (!isOptionalChecked) {
      const tips: string[] = []
      optional.intent || tips.push('【求职意向】')
      optional.job || tips.push('【工作经历】')
      optional.project || tips.push('【项目经历】')

      // 判断是否勾选“不再提示”，未勾选时弹窗，询问是否补全
      if (!skipTip) {
        const optionalModalResult = await showModal({
          className: 'job-detail__modal',
          content: `您的${tips.join('')}不完善，完整的简历会获得更多面试机会哦~`,
          confirmText: isClickChatOnly ? '继续沟通' : '继续投递',
          cancelText: '立即完善',
          showClear: true,
          children: (
            <Radio
              onChange={selected => {
                setStorageSync(JOB_CHAT_RESUME_NOMORE_TIPS, { selected, phone: userInfo?.phone })
                setSkipTip(selected)
              }}
              selected={skipTip}
              className="job-detail__tip"
            >
              不再提示
            </Radio>
          ),
        })

        // 点右上角叉号（0），或者点前去完善（false）但是取消了（! await)，则 return
        if (
          optionalModalResult === 0 ||
          (optionalModalResult === false && !(await completeResume(jobId)))
        ) {
          return false
        }
      }
    }

    return true
  }

  //点击进招聘者主页
  const goHrInfo = id => {
    navigateTo({ url: `/weapp/job/hr-job/index?id=${id}` })
  }

  // 点击收藏按钮
  const handleFavorite = () => {
    if (!isLogined) {
      showLoginPopup()
      return
    }

    if (!isFavorited) {
      favoriteJobApi(jobId)
        .then(() => {
          dispatchAddUserFavorite('jd', jobId)
          showToast({ content: '收藏成功' })
        })
        .catch(err => void showToast({ content: err.errorMessage || '收藏失败' }))
    } else {
      deleteFavoriteApi(jobId)
        .then(() => {
          dispatchDeleteUserFavorite('jd', jobId)
          showToast({ content: '已取消收藏' })
        })
        .catch(err => void showToast({ content: err.errorMessage || '取消收藏失败' }))
    }
  }

  // 点击分享按钮
  const handleShared = () => {
    // if (!isLogined) {
    //   showLoginPopup()
    //   return
    // }

    openSharePopup({
      key: 'share_job',
      showClear: false,
      className: 'custom_fixed_bottom',
      overlayClickClose: true,
      children: (
        <ShareCard
          onCancel={close}
          generatorPhotosApi={generatorJobCardsApi}
          id={jobId.toString()}
          shareApi={shareJobApi}
        />
      ),
    })
  }

  const linkageHandChat = buttonName => {
    const isChat = buttonName == '立即沟通' || buttonName == '投递简历'
    const isDeliverBtn = buttonName == deliverBtnText
    const triggerName = isChat ? 'chat-button-start-' : isDeliverBtn ? 'chat-card-button-' : ''
    eventCenter.trigger(triggerName + paramId)
  }

  // 点击投递按钮
  const handChat = (e: boolean, button_name?: string, exchangeMobile?: boolean) => {
    const { has_shield, shield_id } = positionData?.shield_company || {}
    if (has_shield) {
      fixedbottomPopupRef.current.open({
        key: 'followwx',
        className: 'ShieldingCompany',
        children: (
          <SubscriptionPopupCard
            title="您已屏蔽此公司"
            primaryButtonText="解除并沟通"
            tipText={`您已屏蔽此公司【${companyData?.name}】如果要与他沟通，需要解除对该公司的屏蔽`}
            onPrimaryButtonClick={() => {
              sendDataRangersEventWithUrl('UnblockPopupClick')
              restoreCompanyApi([shield_id])
                .then(fixedbottomPopupRef.current.close())
                .then(handleApply)
                .then(() => getDetailJob(jobId, hrId))
            }}
            subButtonText=""
            className="shieldingCompany"
          />
        ),
      })
    } else {
      handleApply(e, button_name, exchangeMobile)
    }
  }

  const handleApply = async (
    isClickChatOnly: boolean,
    button_name?: string,
    exchangeMobile?: boolean
  ) => {
    // 已投递时点击无效，未登录时弹出登录弹窗
    if (!isLogined) {
      !isLogined && showLoginPopup()
      return
    }
    const params = {
      from_user_id: userInfo!.id,
      to_user_id: hrData?.id,
      jd_id: jobId,
      is_preferred: positionData?.is_priority,
      is_top: positionData?.is_top ? 1 : 0,
      ...getDecodeRouterParams(),
      button_name,
    }
    if (positionData?.has_chat || isClickChat) {
      //继续沟通
      sendDataRangersEventWithUrl('ContinueChat', {
        ...params,
        ...reportWhenStartChat,
        button_name: '继续沟通',
      })
    } else {
      //立即沟通
      clearTips()

      linkageHandChat(button_name)

      sendDataRangersEventWithUrl('StartChat', {
        ...params,
        ...reportWhenStartChat,
      })
    }

    if (!(await checkResume(isClickChatOnly))) {
      return
    }

    let confirmedIsClickChatOnly = isClickChatOnly

    if (!isClickChatOnly) {
      // 点击投递时不弹窗
    } else if (positionData?.has_chat || isClickChat || positionData?.has_apply || isClickApply) {
      // 已开聊 or 已投递的不弹
    } else if (!canShowConfirm && !getLastConfirmType()) {
      // 不在实验组且从未选择过的不弹
    } else if (!canShowConfirm && getLastConfirmType() && new Date() < new Date(2022, 11, 16)) {
      // 实验结束后，曾经选择过的用户可以维持选项到12月16日
      confirmedIsClickChatOnly = getLastConfirmType() === 'chatOnly'
    } else {
      const result = await chatConfirmPopupRef?.current?.showConfirm({
        to_user_id: hrData?.id,
        jd_id: positionData?.id,
      })
      confirmedIsClickChatOnly = result === 'chatOnly'
    }

    setApplyLoading(true)

    try {
      await ensureIMConnect()
      const { isRepeat, delta, repeatJobId } = checkIsRepeat(hrData?.id || -1)
      // 存在同职位的聊天，此时直接返回，否则切换职位
      if (isRepeat) {
        if (repeatJobId !== jobId) {
          await initChatApi({ jdId: jobId, targetUserId: hrData?.id, exchangeMobile })
        }
        navigateBack({ delta })

        return
      }

      const isSchool = isSchoolVersion()
      const { targetId, chatId } = await initChatApi({
        jdId: jobId,
        targetUserId: hrData?.id,
        sendProfile: !confirmedIsClickChatOnly,
        exchangeMobile,
      })
      await initChat(targetId, !(positionData?.has_chat || isClickChat))
      if (!confirmedIsClickChatOnly) {
        sendDataRangersEventWithUrl('DeliverClick', {
          ...params,
          mp_version: isSchool ? '校园版' : '社招版',
        })
      }

      checkImAndShowPop().then(res => setIsShowResumeStickyPopup(res))

      pointConnect(button_name || '', chatId)

      const showQualityPosition = async () => {
        if (shouldShowQualityPositionPopup('similar')) {
          const jobList = await listQualityPositionListApi(positionData?.id)
          if (jobList.length > 0) {
            shouldJumpToIm = false
            dispatchSetHaveChat(1)
            showToast({
              content: isClickChatOnly ? '沟通成功' : '投递成功',
              duration: 500,
              onClose: () => {
                showQualityPositionPopup({
                  type: 'similar',
                  currentJobId: positionData?.id ?? 0,
                  jobList,
                })
              },
            })
          }
        }
      }

      // 判断是否弹出了春战提示弹窗
      let isShowPop = false
      if (!confirmedIsClickChatOnly) {
        isShowPop = (await checkAndShowSpringModal()) || false
      }

      let shouldJumpToIm = true
      if (!positionData?.has_apply) {
        if (isActive) {
          if (!confirmedIsClickChatOnly) {
            try {
              const res = await saveCheerApi()
              if (res) {
                shouldJumpToIm = false
                showRefuelPackagePopup({ level: res })
              } else {
                await showQualityPosition()
              }
            } catch {
              await showQualityPosition()
            }
          }
        } else {
          await showQualityPosition()
        }
      }

      if (isShowPop) {
        shouldJumpToIm = false
      }
      if (shouldJumpToIm) {
        navigateTo({
          url:
            '/weapp/message/chat/index?targetId=' +
            encodeURIComponent(targetId) +
            '&isActive=' +
            isActive,
        })
      }

      setIsClickApply(!confirmedIsClickChatOnly)
      setIsClickChat(true)
      setApplyLoading(false)

      // npsFn()
    } catch (err) {
      reportLog('core', 'im').error('IM沟通建立失败 [handleApply]:', err)

      showToast({ content: err.errorMessage || '沟通建立失败，请重试' })
      setApplyLoading(false)
    }
  }

  // 不再完善提醒
  useEffect(() => {
    const value = getStorageSync(JOB_CHAT_RESUME_NOMORE_TIPS)
    if (value && value.phone === userInfo?.phone) {
      setSkipTip(value.selected)
    }
  }, [userInfo])

  // 请求追加相似职位列表
  const appendJobList = () => {
    if (!jobId || loadStatus === 'loading' || loadStatus === 'noMore') {
      return
    }

    setLoadStatus('loading')
    fetchtRecommendPosition(jobId, 5).then(data => {
      setList(data.slice(0, 5))
      setLoadStatus('noMore')
    })
    // listSimilarJobsApi(jobId, { city_id: city.id, page, pageSize: 5 }).then(pageData => {
    //   const listData = pageData.list

    //   setList(
    //     [...list, ...listData].map((item, i) => ({
    //       ...item,
    //       page_no: pageData.current,
    //       position_no: (i % 10) + 1,
    //     }))
    //   )
    //   setPage(pageData.current + 1)
    //   setLoadStatus(pageData.current * APP_DEF_PAGE_SIZE >= pageData.total ? 'noMore' : 'more')
    // })
  }

  // 进入页面后初次加载相似职位
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(appendJobList, [])

  // 触底追加相似职位
  // useReachBottom(appendJobList)

  // NPS 打分评价功能
  // @ts-ignore
  // const Npsmeter = () => <npsmeter id="npsmeter"></npsmeter>

  const clearTips = () => {
    setCurrentTips()
    setTipsVisible(false)
  }

  const goDraw = () => {
    if (isLogined) {
      sendDataRangersEventWithUrl('EventPopupClick', {
        event_name: '医药人升职季',
        type: '职位详情页面banner',
      })
      jumpToWebviewPage(bestEmployerByToken(`${HR_BASE_HOST}/springWar/luckyDraw/c-mini`))
    } else {
      showLoginPopup()
    }
  }

  const greetingHandler = async (greetingItem: any) => {
    let isSuccess = true
    try {
      if (!isLogined) {
        showLoginPopup()
        return false
      }

      if (!(await checkResume(true))) {
        return false
      }

      const params = {
        from_user_id: userInfo!.id,
        to_user_id: hrData?.id,
        jd_id: jobId,
        is_preferred: positionData?.is_priority,
        is_top: positionData?.is_top ? 1 : 0,
        ...getDecodeRouterParams(),
        button_name: '外置招呼语',
      }
      sendDataRangersEventWithUrl('StartChat', { ...params, ...reportWhenStartChat })

      setApplyLoading(true)
      const { targetId } = await initChatApi({
        jdId: jobId,
        targetUserId: hrData?.id,
        sendProfile: false,
        greetIndex: greetingItem.index,
      })
      await initChat(targetId, !(positionData?.has_chat || isClickChat))
      navigateTo({
        url:
          '/weapp/message/chat/index?targetId=' +
          encodeURIComponent(targetId) +
          '&isActive=' +
          isActive,
      })
      setIsClickChat(true)
    } catch {
      isSuccess = false
      showToast({ content: '发起沟通失败，请稍后重试' })
    } finally {
      setApplyLoading(false)
    }

    return isSuccess
  }

  const onJumpSticky = () => {
    sendDataRangersEventWithUrl('EventPopupClick', {
      event_name: '简历置顶服务',
      type: 'banner',
    })

    onJumpStickyFn()
  }

  const navbarBack = () => {
    if (
      !getStorageSync(stopJobDetailBackTips) &&
      ((isJobUrl && routerParams.type === JobType.RECOMMAND) || isJobZoneUrl) &&
      !isShowResumeStickyPopup &&
      list.length > 0 &&
      !cardSource
    ) {
      setStopBackTips()
      showToast({ content: '为你展示底部相似的职位' })
      // 首页以及金刚区进入的详情 再没有弹相似职位弹窗的前提下 左上角返回按钮首次截停 页面自动滚动到相似职位推荐模块
      pageScrollTo({
        selector: '.recommend-jobList',
        offsetTop: -78,
      } as any)
      return false
    }
    navBarType?.type == 'sharePage'
      ? reLaunch({ url: `/weapp/pages/job/index` })
      : navigateBack({ delta: 1 })
  }

  return (
    <>
      <Navbar title="职位详情" {...navBarType} onBack={navbarBack} />
      <MainLayout
        defaultLoading
        navBarTitle="职位详情"
        className="job-detail"
        onClick={() => {
          if (greetingPopupStatus === GreetingPopupStatusEnum.OPEN) {
            setGreetingPopupStatus(GreetingPopupStatusEnum.SHORT)
          }
        }}
      >
        <View className="job-detail__scrollview">
          <View className="job-detail__card">
            {positionData && <Position data={positionData} choiceTag={choiceTag} />}
            {hrData && (
              <HrInfo
                data={hrData}
                jd={positionData}
                onClick={goHrInfo}
                onHandChat={() => void handChat(true, '获取联系方式', true)}
              />
            )}
            {/* {hrData && <Line style={{ height: '1px' }} />} */}
          </View>
          {/* {userInfo?.dragonAwardTab ? (
            <Swiper
              className="job-detail-index-swiper"
              style={{ height: '70px' }}
              indicatorDots
              indicatorColor="#fff"
              indicatorActiveColor="#4773FF"
              autoplay
              circular
            >
              <SwiperItem>
                <Image
                  className="job-detail-index-swiper__image"
                  onClick={goDraw}
                  src={`${STATIC_MP_IMAGE_HOST}activity-date.png`}
                  mode="scaleToFill"
                />
              </SwiperItem>
            </Swiper>
          ) : null} */}
          {/* {profileTopADExpose && !profileTop ? (
            <Swiper
              className="job-detail-index-swiper"
              style={{ height: '70px' }}
              indicatorDots
              indicatorColor="#fff"
              indicatorActiveColor="#4773FF"
              autoplay
              circular
            >
              <SwiperItem>
                <Image
                  className="job-detail-index-swiper__image"
                  src="https://oss.yimaitongdao.com/mp/resumeSticky/resume-sticky-banner-mp.png"
                  mode="scaleToFill"
                  onClick={onJumpSticky}
                />
              </SwiperItem>
            </Swiper>
          ) : null} */}
          <View className="job-detail__banner">
            <SwiperBar type={48} style={{ height: pxTransform(128) }} />
          </View>

          <JobDetailsTemplate jobInfo={positionData} afterLoaded={afterTemplateLoaded} />
          <View className="job-detail__companyCard">
            {companyData && <JobDetailCompany data={companyData} onClick={goCompany} />}
          </View>
          {companyData && companyData.images ? (
            <CompanyPhotos
              data={companyData?.images}
              RowRender={(item: string, i: number) => (
                <Image
                  src={item} //如果有视频，目前不做视频item.type === 'video' ? item.poster : item.url
                  mode="scaleToFill"
                  onClick={() => {
                    previewMedia({
                      sources: (companyData.images as string[]).map(o => ({
                        url: o,
                      })),
                      current: i,
                    })
                  }}
                />
              )}
            />
          ) : null}
          {/* ((isJobUrl && routerParams.type === JobType.RECOMMAND) || isJobZoneUrl)
                  ：首页的推荐卡片(不含热门卡片)和金刚区页卡片进详情才有相似职位列表
            * cardSource：首页和金刚区页卡片下方出现的相似卡片进入的 || 详情页详情页下方的相似职位列表卡片进入详情页的 无相似职位列表
          */}
          {list.length &&
          ((isJobUrl && routerParams.type === JobType.RECOMMAND) || isJobZoneUrl) &&
          !cardSource
            ? [
                <Line key="1" />,
                <RecommendJobList
                  title="相似职位推荐"
                  isDeliverButton={isPreJob}
                  list={list}
                  loadStatus={loadStatus}
                  key="2"
                  setList={setList}
                />,
              ]
            : null}
          <SafetyTips />
        </View>

        {isValid ? (
          <SubmitBar
            // @ts-ignore
            disabled={positionData?.has_apply || isClickApply}
            text={deliverBtnText}
            onBtnClick={() => void handChat(false, deliverBtnText)}
            // className={
            //   isSendResume && !positionData?.is_priority
            //     ? 'job-detail__submitBarTwo'
            //     : 'job-detail__submitBar'
            // }
            className="job-detail__submitBarTwo"
            loginButtonJdInfo={{ id: positionData?.id || 0, hrId: hrData?.id || 0, mode: 'apply' }}
            useLoginButton
            showBadge={showBadge}
          >
            {/* {!isSendResume || (isSendResume && positionData?.is_priority) ? (
              <View className="job-detail__btnsTips">支持直接投递简历</View>
            ) : null} */}
            {!isLogined && (
              <View className="job-detail__btns">
                <Button className="job-detail__btn">
                  <View className="icon iconfont iconzhiweifenxiang" onClick={handleShared} />
                  <View className="company-index__share__text">分享</View>
                </Button>
              </View>
            )}
            {isLogined && (
              <View className="job-detail__btns">
                <LoginButton onClick={handleShared} className="job-detail__btn">
                  <View className="icon iconfont iconzhiweifenxiang" />
                  <View className="company-index__share__text">分享</View>
                </LoginButton>

                <LoginButton onClick={handleFavorite} className="job-detail__btn">
                  <View className={c('at-icon', isFavorited ? 'at-icon-star-2' : 'at-icon-star')} />
                  <View className={c({ 'job-detail--favorited': isFavorited })}>
                    {isFavorited ? '已收藏' : '收藏'}
                  </View>
                </LoginButton>

                <View className="sendBtn">
                  <LoginButton
                    className="hd-button circle job-detail__button-chat-only"
                    disabled={applyLoading}
                    onClick={() => void handChat(true, '立即沟通')}
                    recordJdInfo={{
                      id: positionData?.id || 0,
                      hrId: hrData?.id || 0,
                      mode: 'greet',
                    }}
                  >
                    {positionData?.has_chat || isClickChat ? '继续沟通' : '立即沟通'}
                  </LoginButton>
                </View>
              </View>
            )}
            {/* <View className="job-detail__btns">
              <LoginButton onClick={handleShared} className="job-detail__btn">
                <View className="icon iconfont iconzhiweifenxiang" />
                <View className="company-index__share__text">分享</View>
              </LoginButton>

              <LoginButton onClick={handleFavorite} className="job-detail__btn">
                <View className={c('at-icon', isFavorited ? 'at-icon-star-2' : 'at-icon-star')} />
                <View className={c({ 'job-detail--favorited': isFavorited })}>
                  {isFavorited ? '已收藏' : '收藏'}
                </View>
              </LoginButton>

              <View className="sendBtn">
                <LoginButton
                  className="hd-button circle job-detail__button-chat-only"
                  disabled={applyLoading}
                  onClick={() => void handChat(true, '立即沟通')}
                  recordJdInfo={{
                    id: positionData?.id || 0,
                    hrId: hrData?.id || 0,
                    mode: 'greet',
                  }}
                >
                  {positionData?.has_chat || isClickChat ? '继续沟通' : '立即沟通'}
                </LoginButton>
              </View>
            </View> */}
            {isLogined && (
              <ToastTips
                content="主动投递可获得更多简历曝光哦！"
                className="job-detail__toast-tips"
                visible={tipsVisible && !positionData?.has_chat}
                onClose={clearTips}
              />
            )}
          </SubmitBar>
        ) : (
          <SubmitBar type="disabled" text="停止招聘" className="job-detail__submit--disabled" />
        )}
        <FixedBottomPopup ref={fixedbottomPopupRef} />
        <QualityPositionPopup type="similar" />
        <ChatConfirmPopup ref={chatConfirmPopupRef} />
        <RefuelPackagePopup ref={refuelPackagePupupRef} />
        {tipsVisible && !positionData?.has_chat ? null : (
          <GreetingPopup
            status={greetingPopupStatus}
            profileGreetMap={greetingWords}
            onStatusChange={setGreetingPopupStatus}
            onSend={greetingHandler}
          />
        )}
      </MainLayout>
    </>
  )
}

export default JobDetail
