import { View, Image } from '@tarojs/components'
import { FC } from 'react'
import c from 'classnames'
import './index.scss'
import Avatar from '../Avatar'

import logoGrey from '@/assets/imgs/logoGrey.svg'
import { ICompany } from '../../hr/layout/data'

export interface ICompanyCard extends ICompany {
  className?: string
}
const CompanyCard: FC<ICompanyCard> = props => {
  const prefixCls = 'landing-companycard'

  const { className, logo, name, job, salary, tags } = props
  return (
    <View className={c(prefixCls, className)}>
      <View className={`${prefixCls}__content`}>
        <View className={`${prefixCls}__title`}>
          <Avatar imgSrc={logo} className={`${prefixCls}__avatar`} />
          <View className={`${prefixCls}__name`}>{name}</View>
        </View>
        <View className={`${prefixCls}__info`}>
          <View className={`${prefixCls}__job`}>{job}</View>
          <View className={`${prefixCls}__salary`}>{salary}</View>
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

export default CompanyCard
