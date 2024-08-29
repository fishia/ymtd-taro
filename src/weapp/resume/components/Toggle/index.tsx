import { View } from '@tarojs/components'
import c from 'classnames'
import { noop } from 'lodash'
import React, { useCallback } from 'react'

import { IFormOption, IProps } from '@/def/common'

import { IFormComponentProps } from '../Form'

import './index.scss'

export interface IInputProps extends IFormComponentProps<string>, IProps {
  range: IFormOption[]
  emitValueType?: 'number' | 'string' | 'auto'
}

const Toggle: React.FC<IInputProps> = props => {
  const {
    title,
    range = [],
    value,
    emitValueType = 'auto',
    onChange = noop,
    className,
    style,
  } = props

  const emitValueFn = useCallback(
    emitValue => {
      if (emitValueType === 'number') {
        return Number(emitValue)
      } else if (emitValueType === 'string') {
        return String(emitValue)
      }

      return isNaN(Number(emitValue)) ? String(emitValue) : Number(emitValue)
    },
    [emitValueType]
  )

  return (
    <View className={c('form__toggle', className)} style={style}>
      <View className="form__toggle__title">{title}</View>

      <View className="form__toggle__switch">
        {range.map(item => (
          <View
            onClick={() => void onChange(emitValueFn(item.value))}
            className={c(
              'form__toggle__switch-item',
              String(item.value) === String(value) ? 'selected' : ''
            )}
            key={item.value}
          >
            {item.label}
          </View>
        ))}
      </View>
    </View>
  )
}

export default Toggle
