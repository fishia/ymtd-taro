import { View, Image } from '@tarojs/components'
import c from 'classnames'
import { identity, noop } from 'lodash'
import React from 'react'

import arrowIcon from '@/assets/imgs/cell-arrow.png'
import { IProps } from '@/def/common'

import { IFormComponentProps } from '../Form'
import useInputAutofill, { IUseInputAutofillOption } from './useInputAutofill'

import './index.scss'

export interface IInputAutofillProps
  extends IFormComponentProps<string>,
    IUseInputAutofillOption,
    IProps {
  placeholder?: string
  onFocus?(e: any): any
  handleValue?(...val: any[]): any
  maxLength?: number
  minLength?: number
}

const InputAutofill: React.FC<IInputAutofillProps> = props => {
  const {
    className,
    style,
    title,
    value,
    placeholder,
    onChange = noop,
    onFocus = noop,
    handleValue = identity,
    fetcher,
    pageNavTitle = title,
    renderThinkItem,
    tips,
    error,
    maxLength,
    minLength,
    checkSensitive = false,
  } = props

  const inputAutofill = useInputAutofill()

  const clickHandler = () => {
    onFocus()
    inputAutofill((...p) => void onChange(handleValue(...p)), {
      fetcher,
      tips,
      pageNavTitle,
      renderThinkItem,
      checkSensitive,
      maxLength,
      minLength,
    })
  }

  return (
    <View
      onClick={clickHandler}
      className={c('form__input-autofill', className, error ? 'form__input-autofill--error' : '')}
      style={style}
      hoverClass="hover"
    >
      <View className="form__input-autofill__title">{title}</View>
      <View className="form__input-autofill__content">
        <View
          className={c(
            'form__input-autofill__text',
            !value ? 'form__input-autofill__placeholder' : ''
          )}
        >
          {value || placeholder}
        </View>
        <Image className="form__input-autofill__arrow" src={arrowIcon} mode="aspectFill" />
      </View>
    </View>
  )
}

export default InputAutofill
