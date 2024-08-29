import React from 'react'
import c from 'classnames'
import _ from 'lodash'
import R from 'ramda'
import { View } from '@tarojs/components'

import { IProps } from '@/def/common'

import './index.scss'

export interface ISwitchProps extends IProps {
  title: string
  value?: boolean
  onChange?(val: boolean): any
  confirm?(val: boolean): boolean | Promise<boolean>
}

const Switch: React.FC<ISwitchProps> = props => {
  const { className, style, title, confirm = R.T, value = false, onChange = _.noop } = props

  const changeHandler = async () => {
    if (await confirm(value)) {
      onChange(!value)
    }
  }

  return (
    <View style={style} className={c('form__switch-weapp', className)}>
      <View className="form__switch-weapp__title">{title}</View>
      <View
        onClick={changeHandler}
        className={c('form__switch-weapp__switcher', {
          'form__switch-weapp__switcher--checked': value,
        })}
      ></View>
    </View>
  )
}

export default Switch
