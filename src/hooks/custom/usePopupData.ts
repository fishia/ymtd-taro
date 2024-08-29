import { getStorageSync, navigateTo } from '@tarojs/taro'

import { PriorityPopState } from '@/components/Popup'
import { qualityPositionPopupEventKey } from '@/components/QualityPositionPopup'
import { APP_TOKEN_FLAG, JOIN_HOST, STATIC_HOST, STATIC_MP_IMAGE_HOST } from '@/config'
import { PopupMode } from '@/def/common'
import { IBanner } from '@/def/job'
import { IResume } from '@/def/resume'
import { activityStatus } from '@/services/DateService'
import { getMarketWindowBgImage } from '@/services/PopupService'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'
import { jumpToUrlByLinkType } from '@/utils/utils'

export const isBestEmployeActivity = link => {
  return (
    (link || '').includes('brandRecruitmentSeason/vote') ||
    (link || '').includes('springWar/luckyDraw')
  )
}

export const bestEmployerByToken = link => {
  const token = getStorageSync(APP_TOKEN_FLAG)
  return link + `/${token}`
}

export interface PriorityListParams {
  resume?: IResume
  showEduPopup?: boolean
  lastEduId?: number
  is_new?: boolean
  wechat?: string
}
//优先级 缺失简历、未订阅、缺失教育经历、缺失工作经历、缺失项目经历、加入社群（广告)
export default async function getPriorityList(
  params?: PriorityListParams
): Promise<PriorityPopState[]> {
  const effectiveActivity = activityStatus()
  const defaultResume = {
    id: undefined,
    profileEdu: [],
    profileJob: [],
    profileProject: [],
  }
  const { id: resumeId, profileEdu } = params?.resume || defaultResume
  
  // @ts-ignore
  let marketWindow: IBanner & { show: boolean } = null
  await getMarketWindowBgImage().then((res: any) => {
    if (res.id) {
      marketWindow = {
        ...res,
        image_url: `${STATIC_HOST}${res.image_url}`,
        show: res.title.includes('交换微信') ? !params?.is_new && params?.wechat : true,
      }
    }
  })
  return [
    {
      priority: 11,
      key: '完善教育经历',
      show: params?.showEduPopup,
      className: 'card__tips',
      maxOpenTimes: 0,
      title: '请完善个人信息',
      description: '你的教育经历尚未完善，填写完整可让招聘者更了解你，助力求职成功',
      confirmText: '完善教育经历',
      route: `/weapp/resume/edit-edu-exp/index?id=${params?.lastEduId}`,
      Unstoppable: true,
      PopupMode: PopupMode.FIXEDBOTTOM_OPEN_TIMES,
    },
    // {
    //   priority: 7,
    //   key: '简历置顶',
    //   show: !profileTop,
    //   bg_image: 'https://oss.yimaitongdao.com/mp/resumeSticky/resume-sticky-pop.png',
    //   route: `/weapp/active/resume-sticky/index`,
    //   maxOpenTimes: 3,
    //   PopupMode: PopupMode.RESUME_SET_TOP_OPEN_TIMES
    // },
    {
      priority: 8,
      key: '首页每日精选职位',
      show: resumeId && profileEdu.length > 0,
      PopupMode: qualityPositionPopupEventKey,
    },
    {
      priority: 9,
      key: '红包抽奖',
      show: effectiveActivity,
      PopupMode: PopupMode.LUCKYDRAW_OPEN_TIMES,
    },
    {
      priority: 10,
      key: marketWindow?.id?.toString() ?? '',
      title: marketWindow?.title || '',
      show: marketWindow ? marketWindow.image_url.length > 0 && marketWindow.show : false,
      bg_image: marketWindow?.image_url,
      maxOpenTimes: 0,
      onConfirm: () => {
        sendDataRangersEventWithUrl('EventPopupClick', {
          event_name: marketWindow?.title,
          type: '首页弹窗',
          button_name: '查看详情',
        })
        if (isBestEmployeActivity(marketWindow.link_url)) {
          jumpToUrlByLinkType({
            ...marketWindow,
            link_url: bestEmployerByToken(marketWindow.link_url),
          })

          return
        }
        jumpToUrlByLinkType(marketWindow)
      },
      PopupMode: PopupMode.FULLSCREEN_OPEN_TIMES,
    },
    // {
    //   priority: 6,
    //   key: '创建简历',
    //   show: false,
    //   bg_image: STATIC_MP_IMAGE_HOST + `${effectiveActivity ? 'redPacketResume' : 'resume'}.png`,
    //   confirmText: effectiveActivity ? '创建简历领红包' : '立即创建',
    //   PopupMode: PopupMode.FIXEDBOTTOM_OPEN_TIMES,
    //   needRecordEvent: effectiveActivity, //需要记录点击事件
    //   onConfirm: () => {
    //     sendResumeEvent('CreateResumeClick')
    //     navigateTo({ url: '/weapp/resume/create-resume/index' })
    //   },
    // },
    // {
    //   priority: 5,
    //   key: '订阅职位',
    //   show: false,
    //   bg_image: STATIC_MP_IMAGE_HOST + 'subscription.png',
    //   confirmText: '立即订阅',
    //   route: '/weapp/my/subscription/index',
    //   PopupMode: PopupMode.FIXEDBOTTOM_OPEN_TIMES,
    // },
    // {
    //   priority: 4,
    //   key: '教育经历缺失',
    //   show: false,
    //   bg_image: STATIC_MP_IMAGE_HOST + 'educations.png',
    //   confirmText: '立即填写',
    //   route: '/weapp/resume/edit-edu-exp/index', //如果要跳转之前的小程序链接，可跳转中转页'/weapp/transition/index?redirectTo=packageA/positionPreference'
    //   PopupMode: PopupMode.FIXEDBOTTOM_OPEN_TIMES,
    // },
    // {
    //   priority: 3,
    //   key: '工作经历缺失',
    //   show: false,
    //   bg_image: STATIC_MP_IMAGE_HOST + 'jobs.png',
    //   confirmText: '立即填写',
    //   route: '/weapp/resume/edit-job-exp/index',
    //   PopupMode: PopupMode.FIXEDBOTTOM_OPEN_TIMES,
    // },
    // {
    //   priority: 2,
    //   key: '项目经历缺失',
    //   show: false,
    //   bg_image: STATIC_MP_IMAGE_HOST + 'projects.png',
    //   confirmText: '立即填写',
    //   route: '/weapp/resume/edit-proj-exp/index',
    //   PopupMode: PopupMode.FIXEDBOTTOM_OPEN_TIMES,
    // },
    // {
    //   priority: 1,
    //   key: '进入社群',
    //   show: false,
    //   bg_image: STATIC_MP_IMAGE_HOST + 'join.png',
    //   confirmText: '立即加群',
    //   route: `/weapp/general/webview/index?url=${encodeURIComponent(JOIN_HOST)}`,
    //   PopupMode: PopupMode.FIXEDBOTTOM_OPEN_TIMES,
    // },
  ] as PriorityPopState[]
}
