import React from 'react'
import c from 'classnames'
import { noop } from 'lodash'
import { View } from '@tarojs/components'

import { IProps } from '@/def/common'
import { IFormComponentProps } from '../Form'

import './index.scss'

export interface ISwitchProps extends IFormComponentProps<any>, IProps {
  trueValue?: any
  falseValue?: any
}

const Switch: React.FC<ISwitchProps> = props => {
  const { className, style, title, value, trueValue, falseValue, onChange = noop } = props

  const isChecked = String(value) === String(trueValue)

  const toggleHandler = () => {
    onChange(isChecked ? falseValue : trueValue)
  }

  return (
    <View onClick={toggleHandler} className={c('form__switch', className)} style={style}>
      <View className="form__switch__title">{title}</View>

      <View
        className={c('form__switch__switcher', { 'form__switch__switcher--checked': isChecked })}
      ></View>
    </View>
  )
}

export default Switch
