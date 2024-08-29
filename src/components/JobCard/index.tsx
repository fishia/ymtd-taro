import { View, Image, Button } from '@tarojs/components'
import {
  createIntersectionObserver,
  createSelectorQuery,
  getCurrentInstance,
  getStorageSync,
  navigateTo,
  useRouter,
  eventCenter,
} from '@tarojs/taro'
import { useGetState } from 'ahooks'
import c from 'classnames'
import _ from 'lodash'
import R from 'ramda'
import React, { useMemo, useEffect, useState } from 'react'

import { saveCheerApi } from '@/apis/job'
import { initChatApi } from '@/apis/message'
import { fetchQueryChatHRCountTodayApi } from '@/apis/user'
import colors from '@/assets/colors'
import HeadhuntingSvg from '@/assets/imgs/headhunting.svg'
import TopSvg from '@/assets/imgs/top.svg'
import UrgentJobSvg from '@/assets/imgs/urgentJob.svg'
import { PROFILE } from '@/config'
//import JobCardAdsPopup from '@/components/Popup/jobCardAdsPopup'
import { IJobCardProps } from '@/def/active'
import { IMedicalRepresentativeJob, JobTemplateType, virtualType } from '@/def/job'
import useOnce, { chatInitiativeTips } from '@/hooks/custom/useOnce'
import {
  useRefuelPackagePopup,
  useResumeStickyPopup,
  useShowLoginPopup,
} from '@/hooks/custom/usePopup'
import useToast from '@/hooks/custom/useToast'
import { useIsLogin } from '@/hooks/custom/useUser'
import { useInitChatByTargetId } from '@/hooks/message'
import { getNewLoginIntent, isSchoolVersion } from '@/services/AccountService'
import { ensureIMConnect } from '@/services/IMService'
import { isValidString, textHighLight } from '@/services/StringService'
import {
  isDataRangersCurrentInABTestGroup,
  sendDataRangersEventWithUrl,
  isShowLoginGuide,
} from '@/utils/dataRangers'
import { reportLog } from '@/utils/reportLog'
import { combineStaticUrl } from '@/utils/utils'
import JobAreaBlock from '@/weapp/pages/job/components/JobAreaBlock'
import JobRecommedBlock from '@/weapp/pages/job/components/JobRecommedBlock'
import RecommedJobCardBlock from '@/weapp/pages/job/components/RecommedJobCardBlock'

import LoginButton from '../LoginButton'
import { useSpringWarPopup } from '../Popup/goSpringWarPopup'
import ResumeStickyAd from '../ResumeStickyAd'
import Tag from '../Tag'

import './index.scss'

const getAddress = v => {
  return R.prop('city', v) || R.prop('province', v)
}

const emptyArray: any[] = []

const JobCard: React.FC<IJobCardProps> = props => {
  const router = useRouter()
  const isLogined = useIsLogin()
  const {
    className,
    style,
    // disabled = false,
    pageName,
    data,
    recommedJobCardData = [],
    simple = false,
    showChatBtn = false,
    onClick,
    keyword = '',
    //JobCardAdsPopupProps,
    active = false,
    showTop = true,
    relativeToClassName = 'job-index__scrollview',
    eventExposeParams = {},
    btnText = '投简历',
    isActive = 0,
    appendLoginTips = false,
    openObserverMode = true,
    showPopup = false,
    footerTips,
    isDeliverButton = false,
    isShowResumeSticky = false,
    isShowJobAreaBlock = false,
    isShowJobRecommedBlock = false,
    isShowRecommedJobCardBlock = false,
    showSohoPopup = false,
    onClickIsShowRecommedJobCard = _.noop,
    onCloseRecommedJobCard = _.noop,
    onClickDetailRecommendBtn = _.noop,
    zoneTitle = '',
    isShowRecommendListGuide = false,
  } = props

  const {
    hr,
    id,
    name,
    salary,
    salary_month,
    work_time_name,
    education_name,
    benefits,
    is_top,
    status,
    status_name,
    function_type_name,
    is_priority = 0,
    isHeadhuntingJd,
    recallSource,
    salary_type,
    behaviorTag,
    activityTagUrl,
    hasChatCurrentJd,
    company,
    attractionTag,
    activityTag,
    salesDone,
    tag,
  } = data

  const addresses = data.addresses || emptyArray

  const [hasReport, setHasReport] = useState(false)
  const [applyLoading, setApplyLoading] = useState(false)
  const [latestHasChatCurrentJd, setLatestHasChatCurrentJd] = useState(hasChatCurrentJd)
  const initChat = useInitChatByTargetId()
  const showToast = useToast()
  const showLoginPopup = useShowLoginPopup()
  const { checkImAndShowPop } = useResumeStickyPopup()
  const [showRefuelPackagePopup] = useRefuelPackagePopup()
  const { setCurrentTips } = useOnce(chatInitiativeTips, true)
  const isSchool = isSchoolVersion()
  const isLoginedState = useIsLogin()
  const localIntent = getNewLoginIntent()
  const { checkAndShowSpringModal } = useSpringWarPopup()
  const sendRangersData = {
    type: isDeliverButton ? '投简历按钮' : btnText + '按钮',
    page_name: pageName,
    button_name: isDeliverButton ? '投简历' : btnText,
  }

  let profileId = ''
  if (isLoginedState) {
    profileId = getStorageSync(PROFILE)?.id || ''
  }

  const displaySalary = useMemo(() => {
    const job = data as IMedicalRepresentativeJob
    const salaryText = salary || salary_month || ''
    const salaryTimes =
      !salaryText || !job.salary_type || salaryText === '面议' ? '' : ' · ' + job.salary_type
    return salaryText + salaryTimes
  }, [data, salary, salary_month])

  const benefitText = useMemo(() => {
    const job = data as IMedicalRepresentativeJob
    const result: string[] = []
    switch (data.template_type) {
      case JobTemplateType.MEDICAL_REPRESENTATIVE:
        const marketCategory = R.head(job.market_category || [])
        marketCategory && result.push(marketCategory)

        const jdLevel = R.take(2, job.jd_level || [])
        jdLevel.forEach(item => void result.push(item))

        const highlight = R.take(4 - jdLevel.length, job.jd_highlights || [])
        highlight.forEach(item => void result.push(item))
        return result.join('、')
      case JobTemplateType.COMMON_TEMPLATE: //展示职位亮点
        ;(job.highlights || []).forEach(item => void result.push(item))
        return result.join('、')
    }
  }, [data])

  const tags = useMemo(() => {
    const job = data as IMedicalRepresentativeJob
    const result: string[] = []
    // const location = R.compose(R.head, R.filter(isValidString), R.map(getAddress))(addresses)
    switch (data.template_type) {
      case JobTemplateType.MEDICAL_REPRESENTATIVE:
        // result.push(location as string)
        const productNames = R.take(2, job?.product_name?.split(/,/) || [])
        productNames.forEach(item => void result.push(item))

        R.take(4 - productNames.length, job.product_direction || []).forEach(
          item => void result.push(item)
        )

        return result
      // case JobTemplateType.COMMON_TEMPLATE:
      //   // result.push(location as string)
      //   ;(job.keywords || []).forEach(item => void result.push(item))
      //   return result
      default:
        result.push(work_time_name)
        result.push(education_name)
        ;(job.keywords || []).forEach(item => void result.push(item))
        return result
    }
  }, [data, education_name, work_time_name, benefits])
  // 置顶相关埋点事件传参
  const topJobEventParams = useMemo(() => {
    return {
      jd_id: id,
      work_city: (addresses || []).map(t => t.city).join(','),
      function_type: function_type_name,
      position_no: eventExposeParams?.position_no,
    }
  }, [id, addresses, function_type_name, eventExposeParams])

  //const updateShow = computeRelativeTime(updated_at)

  // simple用于职位记录和职位收藏，这两个页面需用控制职位的状态
  const isValid = status === 1 || status_name === '上线'
  const handleClick = () => {
    if (isShowRecommendListGuide) {
      sendDataRangersEventWithUrl('register_and_login_click', {
        event_name: '注册登录引导',
        type: '登录后更多意向职位推荐',
        page_name: '职位推荐页',
        button_name: '立即登录',
      })

      return
    }

    const callId = isValid ? id : null
    if (recallSource === '2' && is_top) {
      // 置顶位曝光
      sendDataRangersEventWithUrl('TopPositionClick', {
        ...topJobEventParams,
      })
    }
    onClick && onClick(callId)
  }

  // 2023-03-09 婉莹 ABTest 需求，只在首页生效，部分用户直接展示“投简历”按钮
  const [isInGroup, setIsInGroup, getIsInGroup] = useGetState(false)
  useEffect(() => {
    isDataRangersCurrentInABTestGroup('jobCardDeliver').then(setIsInGroup)
  }, [setIsInGroup])

  useEffect(() => {
    if (isShowRecommendListGuide) {
      sendDataRangersEventWithUrl('register_and_login_Expose', {
        event_name: '注册登录引导',
        type: '登录后更多意向职位推荐',
        page_name: '职位推荐页',
      })
    }
  }, [isShowRecommendListGuide])

  useEffect(() => {
    if (openObserverMode) {
      const observer = createIntersectionObserver(getCurrentInstance().page!)
      setTimeout(() => {
        createSelectorQuery()
          .select('.job-card-' + id)
          .node(function (res) {
            if (res) {
              observer.relativeTo(`.${relativeToClassName}`).observe('.job-card-' + id, _res => {
                if (!hasReport) {
                  if (showChatBtn)
                    Object.assign(eventExposeParams, {
                      button_name: hasChatCurrentJd ? '继续沟通' : btnText,
                    })

                  const jdExposeEvent = {
                    ...eventExposeParams,
                    is_preferred: is_priority,
                    is_top,
                  }
                  if (getIsInGroup() && !hasChatCurrentJd) {
                    Object.assign(jdExposeEvent, {
                      button_name: '投简历',
                      event_name: 'AB测试活动',
                    })
                  }

                  if (isLogined) {
                    sendDataRangersEventWithUrl('JDExpose', jdExposeEvent)

                    if (recallSource === '2' && is_top) {
                      // 置顶位曝光
                      sendDataRangersEventWithUrl('TopPositionExpose', {
                        ...topJobEventParams,
                      })
                    }
                  }

                  sendDataRangersEventWithUrl('Job_exp', {
                    expose_id: jdExposeEvent.expose_id,
                    cv_id: profileId,
                    jd_id: id,
                    hr_id: hr?.id,
                    exp_channel: jdExposeEvent.exp_channel,
                    ab_name: jdExposeEvent.expName,
                    exp_source: 'C小程序',
                    page_no: jdExposeEvent.page_no,
                    position_no: jdExposeEvent.position_no,
                    jd_type: virtualType(jdExposeEvent.isVirtual),
                    jd_status: jdExposeEvent?.jd_status,
                    is_refresh: jdExposeEvent?.is_fresh,
                    sales_done: salesDone,
                  })

                  setHasReport(true)
                  observer.disconnect()
                }
              })
            }
          })
          .exec()
      }, 10)

      return () => void observer.disconnect()
    }
  }, [
    eventExposeParams,
    hasReport,
    id,
    is_priority,
    relativeToClassName,
    router?.path,
    isLogined,
    salesDone,
  ])

  useEffect(() => {
    eventCenter.on('chat-card-button-' + id, (_1: any) => {
      setLatestHasChatCurrentJd(1)
    })

    return () => {
      eventCenter.off('chat-card-button-' + id)
    }
  }, [id])

  const renderAddress = () => {
    const location = R.compose(
      R.head,
      R.filter(isValidString),
      R.map(getAddress)
    )(addresses) as string

    return <View className="hd-jobcard__company_address">{location}</View>
  }

  const renderBestEmployerTag = () => {
    if (!activityTagUrl) {
      return null
    }

    return <Tag iconSrc={combineStaticUrl(activityTagUrl)} />
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
          setApplyLoading(true)
          const eventParams = {
            to_user_id: hr?.id,
            jd_id: id,
            prepage_name: eventExposeParams.prepage_name,
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
            setCurrentTips()

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
              checkAndShowSpringModal()
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

              if (btnText !== '继续沟通') {
                sendDataRangersEventWithUrl('Connection', {
                  connection_id: chatId,
                  connection_type: btnText,
                  page_type: '职位列表',
                  expose_id: eventExposeParams.expose_id,
                  cv_id: profileId,
                  jd_id: id,
                  hr_id: hr?.id,
                  exp_channel: eventExposeParams.exp_channel,
                  ab_name: eventExposeParams.expName,
                  exp_source: 'C小程序',
                  page_no: eventExposeParams.page_no,
                  position_no: eventExposeParams.position_no,
                  jd_type: virtualType(eventExposeParams.isVirtual),
                  jd_status: eventExposeParams?.jd_status,
                  is_refresh: eventExposeParams?.is_fresh,
                  sales_done: salesDone,
                })
              }
            })

            onClickIsShowRecommedJobCard(id) //首页以及金刚区职位卡片下方出相似职位卡片

            // 详情页相似职位列表与首页或者金刚区职位卡片下相似卡片状态联动
            if (className == 'recommend-job-list__card') {
              eventCenter.trigger('chat-button-start-' + id)
              onClickDetailRecommendBtn()
            }
          }
        } catch (err) {
          reportLog('core', 'im').error('IM沟通建立失败 [handleApply]:', err)
          showToast({ content: err.errorMessage || '沟通建立失败，请重试' })
        }
        setApplyLoading(false)
      })
      .catch(R.T)
  }

  const getShowButton = () => {
    if (isLogined) return true
    if (!isLogined && isShowLoginGuide()) return true
    return false
  }

  return (
    <>
      {isShowJobAreaBlock && isShowLoginGuide() && <JobAreaBlock />}
      <View
        className={c(
          'hd-jobcard',
          className,
          { 'hd-jobcard--disabled': !isValid },
          `job-card-${id}`
        )}
        style={style}
        onClick={handleClick}
        hoverClass="hd-jobcard--hover"
      >
        <View className="hd-jobcard__basic">
          <View
            className={c(
              'hd-jobcard__title',
              { 'hd-jobcard__title--top': (showTop && is_top) || is_priority },
              {
                'hd-jobcard__title--is_priority':
                  (showTop && is_top && is_priority) ||
                  (((showTop && is_top) || is_priority) && salary_type),
              }
            )}
            dangerouslySetInnerHTML={{ __html: textHighLight(name, keyword) }}
          ></View>
          {is_priority ? <Image className="hd-jobcard__urgent" src={UrgentJobSvg} /> : null}
          {showTop && is_top ? <Image className="hd-jobcard__top" src={TopSvg} /> : null}
          {isHeadhuntingJd && !(showTop && is_top) && !is_priority ? (
            <Image className="hd-jobcard__hunter" src={HeadhuntingSvg} />
          ) : null}
          {isValid ? (
            <View className="hd-jobcard__salary">{displaySalary}</View>
          ) : (
            <View className="hd-jobcard__salary" style={{ color: colors.textColor }}>
              停止招聘
            </View>
          )}
        </View>
        <View className={`hd-jobcard__require ${simple && 'simple'}`}>
          <View className="hd-jobcard__tags">
            {tags.map(
              (item, i) =>
                item && (
                  <View className="job-require__item" key={i}>
                    {item}
                  </View>
                )
            )}
          </View>
          {simple && renderAddress()}
        </View>
        {company?.name ? (
          <View className="hd-jobcard__company">
            <View className="hd-jobcard__company__name">
              {company?.secret_name || company?.name || company?.short_name}
            </View>
            {company?.scale_name && (
              <View className="hd-jobcard__company__name">{company?.scale_name}</View>
            )}
            {attractionTag && (
              <View className="hd-jobcard__company__attractTags">
                {attractionTag.split(',').map((item, i) => (
                  <View className="hd-jobcard__company__attractTag" key={i}>
                    {item}
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : null}
        {!simple && hr?.name && (
          <View className={c('hd-jobcard__wanted', 'hd-jobcard__hr')}>
            <View className="hd-jobcard__icon">
              <Image
                src={combineStaticUrl(hr?.activityPortrait)}
                className="hd-jobcard__headFrame"
                mode="aspectFit"
              />
              <Image
                src={combineStaticUrl(hr?.avatar)}
                mode="aspectFit"
                className="hd-jobcard__icon"
              />
            </View>
            {hr?.name && (
              <View
                className="hd-jobcard__jobhunter"
                dangerouslySetInnerHTML={{
                  __html: textHighLight(
                    `${hr.name}${hr.identity ? ` · ${hr.identity}` : ''}`,
                    keyword
                  ),
                }}
              ></View>
            )}
            {behaviorTag && (
              <View className="hd-jobcard__behaviorTags">
                {behaviorTag.split(',').map((item, i) => (
                  <View
                    key={i}
                    className={c(
                      { 'hd-jobcard__behaviorTags__onlineTag': item.includes('在线') },
                      { 'hd-jobcard__behaviorTags__replyTag': item.includes('回复快') },
                      {
                        'hd-jobcard__behaviorTags__textTag': !(
                          item.includes('在线') || item.includes('回复快')
                        ),
                      }
                    )}
                  >
                    {item}
                  </View>
                ))}
              </View>
            )}
            {renderAddress()}
          </View>
        )}
        {!simple && (
          <View
            className={c('hd-jobcard__tipsWrapper', {
              'flex-space-between': (!benefitText && activityTagUrl) || activityTag || tag,
              'flex-end': !activityTag && !(benefitText || activityTagUrl) && !tag,
            })}
          >
            {tag ? (
              <View className="hd-jobcard__fireTips">
                <View className="icon iconfont iconfire" />
                职位入选【{tag}】
              </View>
            ) : activityTag ? (
              <View className="hd-jobcard__activityTag">{activityTag}</View>
            ) : (
              <>
                {benefitText && <View className="hd-jobcard__lightTitle">亮点</View>}
                {benefitText && (
                  <View className="hd-jobcard__tips">
                    <View className="hd-jobcard__tipsItem">{`“${benefitText}”`}</View>
                  </View>
                )}
                {!benefitText && renderBestEmployerTag()}
              </>
            )}

            {showChatBtn && getShowButton() && (
              <View hoverStopPropagation>
                <LoginButton
                  recordJdInfo={{ id, hrId: hr.id, mode: 'greet' }}
                  hoverStopPropagation
                  confirmText="请先完成登录并创建简历后方可投递该职位"
                  sendRangersData={sendRangersData}
                  className={c('hd-jobcard__btn', {
                    'hd-jobcard__chatBtn': !latestHasChatCurrentJd,
                    'hd-jobcard__continueChatBtn': latestHasChatCurrentJd,
                  })}
                  onClick={onChatClick}
                  //loading={applyLoading}
                >
                  {latestHasChatCurrentJd ? '继续沟通' : isDeliverButton ? '投简历' : btnText}
                </LoginButton>
              </View>
            )}
          </View>
        )}
        {benefitText && renderBestEmployerTag()}
        {footerTips && <View className="hd-jobcard__bottomTips">{footerTips}</View>}
        {isShowRecommendListGuide && (
          <View className="hd-jobcard__maskGuideLogin">
            <View className="hd-jobcard__maskGuideLogin-desc">
              登录查看更多与「{localIntent?.expectPositionName}」匹配的岗位
            </View>
            <LoginButton>立即登录</LoginButton>
          </View>
        )}
      </View>
      {isShowJobRecommedBlock && isShowLoginGuide() && <JobRecommedBlock />}
      {isShowRecommedJobCardBlock && (
        <RecommedJobCardBlock
          className={className}
          data={data}
          eventExposeParams={eventExposeParams}
          isDeliverButton={isDeliverButton}
          btnText={btnText}
          isActive={isActive}
          profileId={profileId}
          recommedJobCardData={recommedJobCardData}
          onCloseRecommedJobCard={onCloseRecommedJobCard}
          zoneTitle={zoneTitle}
        />
      )}
      {active && <View className="acLine"></View>}
      {/* {appendLoginTips ? (
        <LoginTipsCard />
      ) :  */}
      {showSohoPopup ? (
        <Image
          src="https://wx.yimaitongdao.com/geebox/default/shareCard.png"
          className="hd-jobcard__shareCard"
          onClick={() => {
            // todo 简直SOHO蛙
            // sendDataRangersEventWithUrl('GuidedsearchClick', { search_source: '信息流' })
            // navigateTo({
            //   url: '/weapp/job/job-search/index',
            // })
          }}
        />
      ) : null}
      {showPopup ? (
        <Image
          src="https://wx.yimaitongdao.com/geebox/default/shareCard.png"
          className="hd-jobcard__shareCard"
          onClick={() => {
            sendDataRangersEventWithUrl('GuidedsearchClick', { search_source: '信息流' })
            navigateTo({
              url: '/weapp/job/job-search/index',
            })
          }}
        />
      ) : null}
      {isShowResumeSticky ? <ResumeStickyAd className="" /> : null}
    </>
  )
}

export default JobCard
