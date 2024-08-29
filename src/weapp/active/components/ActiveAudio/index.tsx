import { Image, Video, View } from '@tarojs/components'
import { VideoProps } from '@tarojs/components/types/Video'

import { ActiveButtonType, IMeetingDetail } from '@/def/active'
import { IProps } from '@/def/common'
import { formatDate } from '@/services/DateService'

import NoStart from '../../assets/noStart.svg'

import './index.scss'

export interface IActiveAudio extends IProps {
  videoProps?: VideoProps
  label?: string
  data: IMeetingDetail
}

const prefixCls = 'active-audio'
const ActiveAudio: React.FC<IActiveAudio> = props => {
  const { data, className, videoProps, label = '直播日期' } = props
  const { bannerList = [], title, liveDate, status = ActiveButtonType.NotStarted } = data
  return (
    <View className={`${prefixCls} ${className}`}>
      {status < 2 ? (
        <Image className={`${prefixCls}__img`} src={bannerList[0]} mode="scaleToFill" />
      ) : (
        <Video
          className={`${prefixCls}__videoWrapper`}
          autoplay
          {...videoProps}
          src={bannerList[0]}
        />
      )}
      <View className={`${prefixCls}__description`}>
        <View className={`${prefixCls}__title`}>
          {title}
          {status < 2 ? <Image className={`${prefixCls}__status`} src={NoStart} /> : null}
        </View>
        <View className={`${prefixCls}__date`}>
          {label}：{formatDate(liveDate, 'MM月DD日 HH:mm')}
        </View>
      </View>
    </View>
  )
}

export default ActiveAudio
