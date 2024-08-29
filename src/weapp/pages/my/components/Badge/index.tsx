import React from 'react'
import c from 'classnames'
import { View } from '@tarojs/components'

import { IProps } from '@/def/common'

import './index.scss'

export interface IBadgeProps extends IProps {
  number?: number
}

const Badge: React.FC<IBadgeProps> = props => {
  const { number = 0, className, style } = props

  return (
    <View
      className={c(
        'my-index__badge',
        {
          'my-index__badge--visible': number > 0,
          'my-index__badge--td': number > 9,
          'my-index__badge--hd': number > 99,
        },
        className
      )}
      style={style}
    >
      {number > 99 ? '99+' : number}
    </View>
  )
}

export default Badge
