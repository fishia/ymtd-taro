import { View } from '@tarojs/components'
import { useRouter, navigateTo, eventCenter } from '@tarojs/taro'
import { useGetState } from 'ahooks'
import c from 'classnames'
import _ from 'lodash'
import R from 'ramda'
import React, { useMemo, useEffect, useState } from 'react'

import { saveCheerApi } from '@/apis/job'
import { initChatApi } from '@/apis/message'
import { useSpringWarPopup } from '@/components/Popup/goSpringWarPopup'
import { OSS_STATIC_HOST } from '@/config'
import { IMedicalRepresentativeJob, IEventExposeParams, virtualType } from '@/def/job'
import {
  useShowLoginPopup,
  useRefuelPackagePopup,
  useResumeStickyPopup,
} from '@/hooks/custom/usePopup'
import useToast from '@/hooks/custom/useToast'
import { useIsLogin } from '@/hooks/custom/useUser'
import { useInitChatByTargetId } from '@/hooks/message'
import { isSchoolVersion } from '@/services/AccountService'
import { ensureIMConnect } from '@/services/IMService'
import { isDataRangersCurrentInABTestGroup, sendDataRangersEventWithUrl } from '@/utils/dataRangers'
import { reportLog } from '@/utils/reportLog'
import { getJobType, renderJobDetailUrlByParams } from '@/utils/utils'

import './index.scss'

interface IReJobCard {
  data: any
  eventExposeParams?: IEventExposeParams
  isDeliverButton?: boolean
  btnText?: string
  isActive?: number
  profileId
  isShowItemOpetate: boolean
  classNames?: string
  isZone?: boolean
  zoneTitle?: string
  onClick?: () => void
  isSpringStyle?: boolean
}

const ReJobCard: React.FC<IReJobCard> = props => {
  const isLogined = useIsLogin()
  const showLoginPopup = useShowLoginPopup()
  const initChat = useInitChatByTargetId()
  const showToast = useToast()
  const isSchool = isSchoolVersion()
  const [showRefuelPackagePopup] = useRefuelPackagePopup()
  const { checkAndShowSpringModal } = useSpringWarPopup()
  const { checkImAndShowPop } = useResumeStickyPopup()
  const {
    data,
    eventExposeParams = {},
    isDeliverButton = false,
    btnText = '投简历',
    isActive = 0,
    profileId,
    isShowItemOpetate = false,
    classNames,
    isZone = false,
    zoneTitle = '',
    onClick = _.noop,
    isSpringStyle = false,
  } = props
  const { hasChatCurrentJd } = data
  const [latestHasChatCurrentJd, setLatestHasChatCurrentJd] = useState(hasChatCurrentJd)

  const rootCls = 'reJobCard'
  const reJobCardBg = isSpringStyle
    ? 'https://oss.yimaitongdao.com/mp/activity/dragonSpringWar/job-item-bg.png'
    : OSS_STATIC_HOST + '/mp/sponsorImg/recommedJobCardBG.png'

  const { hr, id, name, salary, salary_month, work_time_name, education_name, company } = data

  const exposeParams: IEventExposeParams = {
    ...eventExposeParams,
    jd_id: id,
    page_no: data.page_no,
    position_no: data.position_no,
    is_top: data.is_top ? 1 : 0,
    expose_id: data.exposeId,
    expName: data.expName,
    isSeed: data.isSeed,
    isVirtual: data.isVirtual,
    is_priority: data.is_priority,
    jd_status: getJobType(data?.is_priority, data?.topStatus),
    is_fresh: data?.refreshStatus ? '是' : '否',
  }

  const [isInGroup, setIsInGroup, getIsInGroup] = useGetState(false)
  useEffect(() => {
    isDataRangersCurrentInABTestGroup('jobCardDeliver').then(setIsInGroup)
  }, [setIsInGroup])

  useEffect(() => {
    eventCenter.on('chat-button-start-' + id, (_1: any) => {
      setLatestHasChatCurrentJd(true)
      onClick && onClick()
    })

    return () => {
      eventCenter.off('chat-button-start-' + id)
    }
  }, [id])

  const displaySalary = useMemo(() => {
    const job = data as IMedicalRepresentativeJob
    const salaryText = salary || salary_month || ''
    const salaryTimes =
      !salaryText || !job.salary_type || salaryText === '面议' ? '' : ' · ' + job.salary_type
    return salaryText + salaryTimes
  }, [data, salary, salary_month])

  const handleClick = () => {
    navigateTo({
      url: renderJobDetailUrlByParams({
        ...exposeParams,
        cardSource: 'recommendCard',
      }),
    })
  }

  // 验证是否已登录
  const checkLogin = async () => {
    if (isLogined) {
      return Promise.resolve()
    } else {
      showLoginPopup()
      return Promise.reject()
    }
  }

  const onChatClick = e => {
    e.stopPropagation()
    checkLogin()
      .then(async () => {
        try {
          const eventParams = {
            to_user_id: hr?.id,
            jd_id: id,
            prepage_name: exposeParams.prepage_name,
          }
          await ensureIMConnect()
          if (latestHasChatCurrentJd) {
            sendDataRangersEventWithUrl('ContinueChat', eventParams)
            const { targetId, chatId } = await initChatApi({ jdId: id, targetUserId: hr?.id })
            await initChat(targetId, true)
            //继续沟通
            navigateTo({
              url: '/weapp/message/chat/index?targetId=' + encodeURIComponent(targetId),
            })
          } else {
            const greetClickEventParam: any = { ...eventParams }
            if (isInGroup) {
              greetClickEventParam.button_name = '投简历'
              greetClickEventParam.event_name = 'AB测试活动'
            }
            sendDataRangersEventWithUrl('GreetClick', greetClickEventParam)

            initChatApi({
              jdId: id,
              targetUserId: hr?.id,
              sendProfile: isDeliverButton || btnText === '投简历',
              flowSource: isDeliverButton ? 'recommendApply' : undefined,
            }).then(({ chatId }) => {
              if (isInGroup) {
                if (isDeliverButton) {
                  showToast({ content: '投递成功' })
                }
                sendDataRangersEventWithUrl('OneClickDelivery', {
                  button_name: '投简历',
                  event_name: 'AB测试活动',
                })
              }
              // 公司主页职位点击单独埋点
              if (btnText === '投简历') {
                sendDataRangersEventWithUrl('DeliverClick', {
                  page_source: '企业推广位点击',
                })
              }
              if (['投简历', '去投递'].includes(btnText) && isActive) {
                sendDataRangersEventWithUrl('OneClickDelivery', {
                  event_name: isDeliverButton ? 'AB测试活动' : '品牌雇主招聘季',
                  type: isSchool ? '校招' : '社招',
                })

                saveCheerApi()
                  .then(res => {
                    if (res) showRefuelPackagePopup({ level: res })
                    checkImAndShowPop()
                    setLatestHasChatCurrentJd(1)
                  })
                  .catch(() => setLatestHasChatCurrentJd(1))
              } else {
                checkImAndShowPop()
                setLatestHasChatCurrentJd(1)
              }

              checkAndShowSpringModal()

              if (btnText !== '继续沟通') {
                let rangersEventParams: any = {
                  recommend_no: '3',
                  event_name: '推荐职位卡片_相似职位推荐',
                }
                if (isZone) {
                  rangersEventParams = {
                    ...rangersEventParams,
                    icon_name: zoneTitle,
                  }
                } else {
                  rangersEventParams = {
                    ...rangersEventParams,
                    to_user_id: hr?.id,
                    jd_id: id,
                    page_name: '职位推荐页',
                  }
                }
                sendDataRangersEventWithUrl('DeliverClick', rangersEventParams)
                sendDataRangersEventWithUrl('Connection', {
                  connection_id: chatId,
                  connection_type: btnText,
                  page_type: '职位列表',
                  expose_id: exposeParams.expose_id,
                  cv_id: profileId,
                  jd_id: id,
                  hr_id: hr?.id,
                  exp_channel: exposeParams.exp_channel,
                  ab_name: exposeParams.expName,
                  exp_source: 'C小程序',
                  page_no: exposeParams.page_no,
                  position_no: exposeParams.position_no,
                  jd_type: virtualType(exposeParams.isVirtual),
                  jd_status: exposeParams?.jd_status,
                  is_refresh: exposeParams?.is_fresh,
                })
              }
            })
          }
        } catch (err) {
          reportLog('core', 'im').error('IM沟通建立失败 [handleApply]:', err)
          showToast({ content: err.errorMessage || '沟通建立失败，请重试' })
        }
      })
      .catch(R.T)
  }

  return (
    <View>
      <View
        className={c(rootCls, classNames)}
        onClick={handleClick}
        hoverClass="hd-reJobCard--hover"
        style={{
          backgroundImage: `url("${reJobCardBg}")`,
        }}
      >
        <View className={`${rootCls}__name`}>{name}</View>
        <View className={c(`${rootCls}__text`, `${rootCls}__salary`)}>{displaySalary}</View>
        <View className={c(`${rootCls}__text`, `${rootCls}__company`)}>{company.name}</View>
        <View className={`${rootCls}__experience`}>
          {work_time_name + '  |  ' + education_name}
          {/* <View className={c(`${rootCls}__workTime`, `${rootCls}__textStyle`)}>{work_time_name}</View>
          <View className={`${rootCls}__line`} />
          <View className={`${rootCls}__workTime`}>{education_name}</View> */}
        </View>
      </View>

      {isShowItemOpetate && (
        <View
          className={c(
            `${rootCls}__reJobCardOperate`,
            latestHasChatCurrentJd ? `${rootCls}__continueChatBtn` : ''
          )}
          onClick={onChatClick}
        >
          {latestHasChatCurrentJd ? '继续沟通' : isDeliverButton ? '投简历' : btnText}
        </View>
      )}
    </View>
  )
}

export default ReJobCard
