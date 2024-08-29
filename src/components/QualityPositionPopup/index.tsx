import { Image, ScrollView, View } from '@tarojs/components'
import { eventCenter, getStorageSync, setStorageSync, useRouter } from '@tarojs/taro'
import c from 'classnames'
import dayjs from 'dayjs'
import { noop } from 'lodash'
import { FC, useEffect, useState } from 'react'

import { batchApplyPositionApi } from '@/apis/job'
import {
  QUALITY_POSITION_POPUP_LAST_SHOW_TIME_STORAGE_KEY,
  SIMILAR_POSITION_POPUP_LAST_SHOW_TIME_STORAGE_KEY,
  STATIC_MP_IMAGE_HOST,
} from '@/config'
import { IProps } from '@/def/common'
import { IJob } from '@/def/job'
import { defaultUserInfo } from '@/def/user'
import useModalState from '@/hooks/custom/useModalState'
import { useResumeStickyPopup } from '@/hooks/custom/usePopup'
import useToast from '@/hooks/custom/useToast'
import { useCurrentUserInfo } from '@/hooks/custom/useUser'
import { sendDataRangersEvent } from '@/utils/dataRangers'

import Button from '../Button'
import JobCard from '../JobCard'
import { useSpringWarPopup } from '../Popup/goSpringWarPopup'
import closeIcon from './close.svg'

import './index.scss'

export const qualityPositionPopupEventKey = 'quality-position-popup'

export interface IQualityPositionPopupProps extends IProps {
  type: 'daily' | 'similar'
  show?: boolean
  onClose?(): void
}

export interface IQualityPositionPopupOptions {
  type: 'daily' | 'similar'
  show?: boolean
  currentJobId?: number
  jobList: IJob[]
}

const dailyTitleBg = STATIC_MP_IMAGE_HOST + 'quality-position-popup-daily.png'
const similarTitleBg = STATIC_MP_IMAGE_HOST + 'quality-position-popup-similar.png'

export function useQualityPositionPopup() {
  const router = useRouter()

  async function showQualityPositionPopup(options: IQualityPositionPopupOptions): Promise<boolean> {
    const { jobList } = options
    if (jobList?.length <= 0) {
      return false
    }

    const now = new Date().valueOf()
    if (options.type === 'daily') {
      setStorageSync(QUALITY_POSITION_POPUP_LAST_SHOW_TIME_STORAGE_KEY, now)
    } else {
      setStorageSync(SIMILAR_POSITION_POPUP_LAST_SHOW_TIME_STORAGE_KEY, now)
    }

    eventCenter.trigger(router.path + qualityPositionPopupEventKey, {
      show: true,
      ...options,
    })

    sendDataRangersEvent('EventExpose', {
      recommend_no: jobList.length,
      event_name: options.type === 'daily' ? '精选职位推荐' : '相似职位推荐',
    })

    return true
  }

  function hideQualityPositionPopup() {
    eventCenter.trigger(router.path + qualityPositionPopupEventKey, { show: false })
  }

  return [showQualityPositionPopup, hideQualityPositionPopup]
}

export function shouldShowQualityPositionPopup(type: 'daily' | 'similar') {
  const todayStart = dayjs().startOf('day').valueOf()
  const lastShowTime =
    getStorageSync(
      type === 'daily'
        ? QUALITY_POSITION_POPUP_LAST_SHOW_TIME_STORAGE_KEY
        : SIMILAR_POSITION_POPUP_LAST_SHOW_TIME_STORAGE_KEY
    ) || 0

  return todayStart > lastShowTime
}

const QualityPositionPopup: FC<IQualityPositionPopupProps> = props => {
  const { type, show = false, onClose = noop, className, style } = props
  const { checkImAndShowPop } = useResumeStickyPopup()
  const router = useRouter()
  const showToast = useToast()
  const userInfo = useCurrentUserInfo() || defaultUserInfo
  const [jobList, setJobList] = useState<IJob[]>([])
  const { active, alive, setModal } = useModalState(200)
  const { checkAndShowSpringModal } = useSpringWarPopup()
  const isActive = userInfo.stage === 1 && !userInfo.isDraw

  useEffect(() => void setModal(show), [setModal, show])

  useEffect(() => {
    eventCenter.on(
      router.path + qualityPositionPopupEventKey,
      (options: IQualityPositionPopupOptions) => {
        if (options.type !== type) {
          return
        } else if (options.show && options.jobList?.length > 0) {
          setJobList(options.jobList)
          setModal(true)
        } else {
          setModal(false)
        }
      }
    )

    return () => {
      eventCenter.off(router.path + qualityPositionPopupEventKey)
    }
  }, [jobList, router.path, setModal, type])

  const confirmHandler = () => {
    closeHandler()

    const jobs = jobList.map(job => ({ jdId: job.id, targetUserId: job.hr?.id ?? -1 }))
    batchApplyPositionApi(jobs, true)
      .then(() => {
        return checkAndShowSpringModal()
      })
      .then(() => void showToast({ content: '投递完成，继续浏览更多职位吧' }))
      .then(() => {
        checkImAndShowPop()
      })
      .catch(() => void showToast({ content: '投递失败' }))

    jobs.forEach(job => {
      sendDataRangersEvent('DeliverClick', {
        jd_id: job.jdId,
        to_user_id: job.targetUserId ?? -1,
        recommend_no: jobList.length,
        event_name: type === 'daily' ? '精选职位推荐' : '相似职位推荐',
      })
    })
  }

  const closeHandler = () => {
    setModal(false)
    onClose()
  }

  if (!alive) {
    return null
  }
  const springWarClassName = isActive ? 'dragonSpringWar' : ''

  const backgroundImage = isActive
    ? `url("https://oss.yimaitongdao.com/mp/activity/dragonSpringWar/1888-dialog.png")`
    : `url("${STATIC_MP_IMAGE_HOST + 'quality-position-popup-bg.png'}")`

  return (
    <View className={c('quality-position-popup-mask', type, active ? 'active' : '')}>
      <View
        className={c(
          className,
          'quality-position-popup',
          active ? 'active' : '',
          springWarClassName
        )}
        style={style}
      >
        <View
          className="quality-position-popup__body"
          style={{
            backgroundImage,
          }}
        >
          <Image className="quality-position-popup__close" onClick={closeHandler} src={closeIcon} />
          <View className="quality-position-popup__title">
            {type === 'daily' ? (
              <Image
                className="quality-position-popup__title-bg"
                mode="heightFix"
                src={dailyTitleBg}
              />
            ) : (
              <Image
                className="quality-position-popup__title-bg"
                mode="heightFix"
                src={similarTitleBg}
              />
            )}
          </View>
          <ScrollView className="quality-position-popup__scroll" scrollY>
            <View className="quality-position-popup__scroll-inner">
              {jobList.map(job => (
                <JobCard
                  className="quality-position-popup__job-card"
                  key={job.id}
                  data={job}
                  eventExposeParams={{
                    exp_channel: type === 'daily' ? '首页推荐' : '投递后推荐',
                  }}
                />
              ))}
            </View>
          </ScrollView>
        </View>
        <View
          className="quality-position-popup__action"
          style={{
            backgroundImage: `url("${STATIC_MP_IMAGE_HOST + 'quality-position-popup-bottom.png'}")`,
          }}
        >
          <Button
            onClick={confirmHandler}
            className="quality-position-popup__confirm"
            btnType="primary"
          >
            一键投递
          </Button>
        </View>
      </View>
    </View>
  )
}

export default QualityPositionPopup
