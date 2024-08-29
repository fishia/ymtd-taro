import { View, Image } from '@tarojs/components'
import { FC } from 'react'
import c from 'classnames'
import './index.scss'
import Avatar from '../Avatar'
import { IJob } from '../../hr/layout/data'
import logoGrey from '@/assets/imgs/logoGrey.svg'
import jobIcon from '@/assets/imgs/job.svg'
import vIcon from '@/assets/imgs/v.svg'

export interface IJobCard extends IJob {
  className?: string
}
const JobCard: FC<IJobCard> = props => {
  const prefixCls = 'landing-jobcard'

  const { className, tags, logo, name, time, school, salary, job } = props
  return (
    <View className={c(prefixCls, className)}>
      <View className={`${prefixCls}__content`}>
        <View className={`${prefixCls}__name`}>{name}</View>
        <Avatar
          imgSrc={logo}
          className={`${prefixCls}__avatar`}
          icon={<Image className={`${prefixCls}__avatarIcon`} src={vIcon} />}
        />
        <View className={`${prefixCls}__info`}>
          <View className={`${prefixCls}__info-item ${prefixCls}__info-after`}>{time}</View>
          <View className={`${prefixCls}__info-item ${prefixCls}__info-after`}>{school}</View>
          <View className={`${prefixCls}__info-item`}>{salary}</View>
        </View>

        <View className={`${prefixCls}__job`}>
          <Image src={jobIcon} className={`${prefixCls}__icon`} />
          <View className={`${prefixCls}__text`}>{job}</View>
        </View>
        <View className={`${prefixCls}__tags`}>
          {tags.map((it, idx) => (
            <View className={`${prefixCls}__tags-item`} key={idx}>
              {it}
            </View>
          ))}
        </View>
      </View>
      <Image src={logoGrey} className={`${prefixCls}__bk`} />
    </View>
  )
}

export default JobCard
