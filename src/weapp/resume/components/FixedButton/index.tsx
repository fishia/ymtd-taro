import { View } from '@tarojs/components'
import c from 'classnames'
import { noop } from 'lodash'
import React from 'react'

import { IButtonProps } from '@/components/Button'

import './index.scss'

export interface IFixedButtonProps extends IButtonProps {
  round?: boolean
  onDisabledClick?(): void
  parentClassName?: string
}

const FixedButton: React.FC<IFixedButtonProps> = props => {
  const {
    round = true,
    onDisabledClick = noop,
    onClick = noop,
    disabled = false,
    className,
    children,
    parentClassName = '',
  } = props

  const clickHandler = () => {
    ;(disabled ? onDisabledClick : onClick)()
  }

  return (
    <View className={c('resume-fixed-button', parentClassName, round ? '' : 'no-round')}>
      <View
        {...props}
        onClick={clickHandler}
        className={c('resume-fixed-button__button', className, { disabled })}
      >
        {children}
      </View>
    </View>
  )
}

export default FixedButton
