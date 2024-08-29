import { Image, Text, View } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import { useContext } from 'react'

import JobCard from '@/components/JobCard'
import { IActiveEventParams, IJobCardProps } from '@/def/active'
import { useShowLoginPopup } from '@/hooks/custom/usePopup'
import { useIsLogin } from '@/hooks/custom/useUser'
import { sendHongBaoEvent } from '@/utils/dataRangers'

import delivered from '../../assets/delivered.svg'
import delivery from '../../assets/delivery.svg'
import ActiveEventParamsContext from '../../context'

import './index.scss'

const prefixCls = 'active-jobCard'
const ActiveJobCard: React.FC<IJobCardProps> = props => {
  const { data, onClick } = props
  const isLogined = useIsLogin()
  const showLoginPopup = useShowLoginPopup()
  const { event_name, event_rank } = useContext<IActiveEventParams>(ActiveEventParamsContext)
  // 验证是否已登录
  const checkLogin = async () => {
    if (isLogined) {
      return Promise.resolve()
    } else {
      showLoginPopup({
        onConfirm: () => {
          if (onClick) onClick(data?.id)
        },
      })
      return Promise.reject()
    }
  }

  const handleClick = () => {
    checkLogin().then(() => {
      //sendHongBaoEvent('SendResumeClick', { jd_id: data?.id, event_name, event_rank })
      if (onClick) onClick(data?.id, data?.tag)
    })
  }
  return (
    <View className={`${prefixCls}`}>
      <JobCard {...props} onClick={handleClick} />
      <View className={`${prefixCls}__deliveryStatus`}>
        <Image className={`${prefixCls}__img`} src={data.has_apply ? delivered : delivery} />
      </View>
    </View>
  )
}

export default ActiveJobCard
