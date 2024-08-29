import React from 'react'
import c from 'classnames'

import { IProps } from '@/def/common'
import Empty from '@/components/Empty'

import './index.scss'
import emptyImageUrl from './no-invitation.png'

export interface INoInvitationProps extends IProps {}

const NoInvitation: React.FC<INoInvitationProps> = props => {
  const { className, style } = props

  return (
    <Empty
      text="暂无职位邀请"
      className={c('my-invitation__no-invitation', className)}
      picUrl={emptyImageUrl}
      style={style}
    />
  )
}

export default NoInvitation
