import React from 'react'
import _ from 'lodash'
import c from 'classnames'
import { View } from '@tarojs/components'

import { IProps } from '@/def/common'

import './index.scss'

export interface IChooseBtnProps extends IProps {
  disabled?: boolean
  selected?: boolean
  onClick?(): void
}

const ChooseBtn: React.FC<IChooseBtnProps> = props => {
  const { onClick = _.noop, selected = false, disabled = false, className, style, children } = props

  const handleClick = e => {
    e.stopPropagation()
    if (!disabled) {
      onClick()
    }
  }

  return (
    <View
      onClick={handleClick}
      className={c('city-button', { 'city-button--active': selected }, className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default ChooseBtn
