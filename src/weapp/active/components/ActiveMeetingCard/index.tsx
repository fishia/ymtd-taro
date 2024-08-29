import { Image, View } from '@tarojs/components'
import { navigateTo, showToast } from '@tarojs/taro'
import c from 'classnames'
import { useContext, useMemo } from 'react'

import { subscribeActiveApi } from '@/apis/active-page'
import { IMeetingInfo, ActiveButtonType, IActiveEventParams } from '@/def/active'
import { IProps } from '@/def/common'
import { useShowLoginPopup } from '@/hooks/custom/usePopup'
import { useIsLogin } from '@/hooks/custom/useUser'
import { formatDate } from '@/services/DateService'
import { sendHongBaoEvent } from '@/utils/dataRangers'
import { jsonToUrl } from '@/utils/utils'

import ActiveEventParamsContext from '../../context'

import './index.scss'

export interface ActiveButton {
  backgroundColor?: string
  text: string
  eventName?: string
  onClick?: (params: IMeetingInfo, callback?: (orderStatus?: boolean) => void) => void
}
const ActiveStatusMap: Record<ActiveButtonType, Nullable<ActiveButton>> = {
  [ActiveButtonType.NotStarted]: {
    backgroundColor: '#4773FF',
    text: '预约报名',
    eventName: 'EventBookingClick',
    onClick: async (params: IMeetingInfo, callback?: (orderStatus?: boolean) => void) => {
      try {
        const orderStatus = await subscribeActiveApi(params.id)
        showToast({ icon: 'none', title: orderStatus ? '预约成功' : '预约失败' })
        if (callback) callback(orderStatus)
      } catch (err) {
        showToast({ icon: 'none', title: err.errorMessage || '预约失败，请重试' })
        if (callback) callback(false)
      }
    },
  },
  [ActiveButtonType.SignUp]: {
    backgroundColor: '#009688',
    text: '已预约',
  },
  [ActiveButtonType.InProgress]: {
    backgroundColor: '#0EB6D4',
    text: '进入会场',
    eventName: 'EventEnterClick',
    onClick: (params: IMeetingInfo, callback?: () => void) => {
      const { id, companyIdList = [] } = params
      navigateTo({
        url: `/weapp/active/preachMeetingDetail/index?${jsonToUrl({
          id,
          companyId: companyIdList[0],
        })}`,
      })
    },
  },
  [ActiveButtonType.IsEnd]: {
    backgroundColor: '#35BDF7',
    text: '观看回放',
    eventName: 'ReplayClick',
    onClick: (params: IMeetingInfo, callback?: () => void) => {
      const { id, companyIdList = [] } = params
      navigateTo({
        url: `/weapp/active/preachMeetingDetail/index?${jsonToUrl({
          id,
          companyId: companyIdList[0],
        })}`,
      })
    },
  },
}

export interface IActiveMeetingCard extends IProps {
  data: IMeetingInfo
  onClick?: (id: number | string) => void
  onSignUp?: () => void
  route?: string
  showButton?: boolean
  params?: object
}

const prefixCls = 'active-meeting-card'
const ActiveMeetingCard: React.FC<IActiveMeetingCard> = props => {
  const { data, className, onClick, onSignUp, route, showButton = false, params } = props
  const { event_name, event_rank } = useContext<IActiveEventParams>(ActiveEventParamsContext)
  const {
    id,
    image,
    title,
    startDate,
    endDate,
    status = ActiveButtonType.NotStarted,
    companyIdList = [],
  } = data
  const isLogined = useIsLogin()
  const showLoginPopup = useShowLoginPopup()

  // 验证是否已登录
  const checkLogin = async () => {
    if (isLogined) {
      return Promise.resolve()
    } else {
      showLoginPopup()
      return Promise.reject()
    }
  }

  const handelClick = () => {
    checkLogin().then(() => {
      if (onClick) onClick(id)
      if (route) {
        sendHongBaoEvent('EventDetailsPageView', {
          event_name,
          event_rank,
				})
        const newParams = {
          id,
          companyId: companyIdList?.[0],
        }
        if ('params' in props) {
          Object.assign(newParams, { ...params })
        }
        navigateTo({
          url: `${route}?${jsonToUrl(newParams)}`,
        })
      }
    })
  }
  const outOfDate = useMemo(() => {
    if (endDate) {
      return +new Date() > +new Date(endDate.replace(/-/g, '/'))
    }
    return false
  }, [endDate])

  return (
    <View className={`${prefixCls} ${className}`} onClick={handelClick}>
      <Image className={`${prefixCls}__img`} src={image} mode="scaleToFill" lazyLoad />
      {status === ActiveButtonType.NotStarted ? (
        <View className={`${prefixCls}__badge`}>
          <View className={`${prefixCls}__tiptext`}>可预约</View>
        </View>
      ) : null}
      <View className={`${prefixCls}__topContent`}>
        <View className={`${prefixCls}__title`}>{title}</View>
        {showButton && ActiveStatusMap[status] ? (
          <View
            className={`${prefixCls}__button`}
            style={{ backgroundColor: ActiveStatusMap[status]?.backgroundColor }}
            onClick={e => {
              e.stopPropagation()
              checkLogin().then(() => {
                if (ActiveStatusMap[status]?.onClick) {
                  if (status === ActiveButtonType.NotStarted) {
                    ActiveStatusMap[status]?.onClick(data, (is_success: boolean) => {
                      if (is_success && onSignUp) onSignUp()
                      if (ActiveStatusMap[status]?.eventName)
                        sendHongBaoEvent(ActiveStatusMap[status]?.eventName, {
                          event_name,
                          event_rank,
                          is_success,
                        })
                    })
                  } else {
                    ActiveStatusMap[status]?.onClick(data)
                    if (ActiveStatusMap[status]?.eventName)
                      sendHongBaoEvent(ActiveStatusMap[status]?.eventName, {
                        event_name,
                        event_rank,
                      })
                  }
                }
              })
            }}
          >
            {ActiveStatusMap[status]?.text}
          </View>
        ) : null}
      </View>
      <View className={c(`${prefixCls}__date`, { [`${prefixCls}__date--disabled`]: outOfDate })}>
        招聘日期：{formatDate(startDate, 'MM月DD日 HH:mm')}-{formatDate(endDate, 'MM月DD日 HH:mm')}
      </View>
    </View>
  )
}

export default ActiveMeetingCard
