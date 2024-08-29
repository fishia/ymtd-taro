import { View, Input as RawInput } from '@tarojs/components'
import { InputProps as RawInputProps } from '@tarojs/components/types/Input'
import c from 'classnames'
import { identity } from 'lodash'
import React from 'react'

import { IProps } from '@/def/common'

import { IFormComponentProps } from '../Form'

import './index.scss'

export interface IInputProps
  extends IFormComponentProps<string>,
    Omit<RawInputProps, 'onFocus'>,
    Omit<IProps, 'ref'> {
  cnCharTwoLength?: boolean
  minLength?: number
}

const Input: React.FC<IInputProps> = props => {
  const {
    title,
    error = false,
    cnCharTwoLength = false,
    onChange = identity,
    maxlength,
    className,
    style,
    ...restProps
  } = props

  const inputHandler = e => {
    const inputValue: string = e.detail.value

    if (!maxlength || maxlength <= -1) {
      return onChange(inputValue)
    }

    if (!cnCharTwoLength) {
      return onChange(inputValue.substring(0, maxlength))
    }

    let length = 0
    for (let i = 0; i < inputValue.length; ++i) {
      length += inputValue[i].charCodeAt(0) <= 122 ? 1 : 2

      if (length > maxlength) {
        return onChange(inputValue.substring(0, i))
      }
    }

    return onChange(inputValue)
  }

  return (
    <View className={c('form__input', className, error ? 'form__input--error' : '')} style={style}>
      <View className="form__input__title">{title}</View>
      <RawInput
        className="form__input__input"
        placeholderClass="form__input__input-placeholder"
        onInput={inputHandler}
        {...restProps}
      />
    </View>
  )
}

export default Input
