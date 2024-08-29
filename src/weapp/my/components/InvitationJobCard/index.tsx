import React from 'react'
import c from 'classnames'
import _ from 'lodash'
import { View } from '@tarojs/components'

import JobCard from '@/components/JobCard'
import { IJobCardProps } from '@/def/active'
import Button from '@/components/Button'

import './index.scss'

export interface IInvitationJobCardProps extends IJobCardProps {
  isShowApplyButton?: boolean
  isApplied?: boolean
  onApplyClick?(): void
}

const InvitationJobCard: React.FC<IInvitationJobCardProps> = props => {
  const {
    onApplyClick = _.noop,
    isShowApplyButton = false,
    isApplied = false,
    className,
    style,
    ...restProps
  } = props

  return (
    <View className={c('my-invitation__job-card', className)} style={style}>
      <JobCard {...restProps} />
      {isShowApplyButton ? (
        <Button
          onClick={onApplyClick}
          disabled={isApplied}
          className="my-invitation__job-card__apply"
        >
          {isApplied ? '已接受邀请' : '接受邀请'}
        </Button>
      ) : null}
    </View>
  )
}

export default InvitationJobCard
