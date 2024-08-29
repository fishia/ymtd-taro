import { View, Image } from '@tarojs/components'
import { eventCenter } from '@tarojs/taro'
import c from 'classnames'
import _ from 'lodash'
import React, { useState } from 'react'

import { batchApplyPositionApi } from '@/apis/job'
import { useSpringWarPopup } from '@/components/Popup/goSpringWarPopup'
import { OSS_STATIC_HOST } from '@/config'
import { IProps } from '@/def/common'
import { IJob, IEventExposeParams } from '@/def/job'
import { defaultUserInfo } from '@/def/user'
import useToast from '@/hooks/custom/useToast'
import { useCurrentUserInfo } from '@/hooks/custom/useUser'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import ReJobCard from './components/ReJobCard/index'

import './index.scss'

export interface IRecommedJobCardBlockProps extends IProps {
  data: IJob
  eventExposeParams: IEventExposeParams
  recommedJobCardData: IJob[]
  isDeliverButton: boolean
  btnText: string
  isActive?: number
  profileId
  onCloseRecommedJobCard(): void
  className?: string
  zoneTitle?: string
}

const RecommedJobCardBlock: React.FC<IRecommedJobCardBlockProps> = props => {
  const {
    data,
    eventExposeParams,
    recommedJobCardData,
    isDeliverButton = false,
    btnText,
    isActive,
    profileId,
    onCloseRecommedJobCard = _.noop,
    className,
    zoneTitle = '',
  } = props

  const showToast = useToast()
  const userInfo = useCurrentUserInfo() || defaultUserInfo
  const rootCls = 'recommed-job-card-block'
  const closeIconUrl = OSS_STATIC_HOST + '/mp/sponsorImg/closeIcon.png'
  const [isShowItemOpetate, setIsShowItemOpetate] = useState(false)
  const { checkAndShowSpringModal } = useSpringWarPopup()

  const isZone = className == 'zones-index__card'

  const publicChatClick = checkAward => {
    const jobs = recommedJobCardData.map(job => {
      eventCenter.trigger('chat-button-start-' + job.id)
      return {
        jdId: job.id,
        targetUserId: job.hr?.id ?? -1,
      }
    })
    // checkAndShowSpringModal()
    batchApplyPositionApi(jobs, true)
      .then(() => {
        setIsShowItemOpetate(true)
        if (checkAward) {
          checkAndShowSpringModal()
        }
      })
      .catch(() => void showToast({ content: '投递失败' }))

    jobs.forEach(job => {
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
          to_user_id: job.targetUserId ?? -1,
          jd_id: job.jdId,
          page_name: '职位推荐页',
        }
      }
      sendDataRangersEventWithUrl('DeliverClick', rangersEventParams)
    })
  }

  const isSpringStyle = userInfo.stage === 1 && !userInfo.isDraw
  console.log(isSpringStyle)

  return (
    <>
      <View
        className={c(`${rootCls}`, className, {
          'spring-war-style': isSpringStyle,
        })}
      >
        <View className={`${rootCls}__top`}>
          <View className={`${rootCls}__name`}>
            <View className={`${rootCls}__jobName`}>{data.name}</View>
            的相似职位
          </View>
          <Image
            className={`${rootCls}__closeIcon`}
            src={closeIconUrl}
            onClick={onCloseRecommedJobCard}
          />
        </View>
        <View className={`${rootCls}__content`}>
          {recommedJobCardData.map((item, index) => (
            <View key={index}>
              <ReJobCard
                data={item}
                eventExposeParams={eventExposeParams}
                isShowItemOpetate={isShowItemOpetate}
                isDeliverButton={isDeliverButton}
                btnText={btnText}
                isActive={isActive}
                profileId={profileId}
                isSpringStyle={isSpringStyle}
                isZone={isZone}
                zoneTitle={zoneTitle}
                onClick={() => setIsShowItemOpetate(true)}
              />
            </View>
          ))}
        </View>
        {!isShowItemOpetate &&
          (isSpringStyle ? (
            <Image
              src="https://oss.yimaitongdao.com/mp/activity/dragonSpringWar/1888-button.png"
              onClick={() => publicChatClick(true)}
              className={`${rootCls}__operate-spring-button`}
            ></Image>
          ) : (
            <View className={`${rootCls}__operate`} onClick={publicChatClick}>
              一键投递
            </View>
          ))}
      </View>
    </>
  )
}

export default RecommedJobCardBlock
