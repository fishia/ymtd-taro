import { View, Image } from '@tarojs/components'
import c from 'classnames'
import { noop } from 'lodash'
import React from 'react'

import arrowIcon from '@/assets/imgs/cell-arrow.png'
import { IProps } from '@/def/common'

import NewBadge from '../../assets/new.png'
import { IFormComponentProps } from '../Form'
import useInputLongtext, { IUseInputLongtextOption } from './useInputLongtext'

import './index.scss'

export interface ITextareaProps
  extends IFormComponentProps<string>,
    IUseInputLongtextOption,
    IProps {
  placeholder?: string
  onFocus?(e: any): any
  minLength?: number
  showNew?: boolean
}

const Textarea: React.FC<ITextareaProps> = props => {
  const {
    className,
    style,
    title,
    pageNavTitle = title,
    value,
    placeholder,
    onChange = noop,
    onFocus = noop,
    error,
    showNew = false,
  } = props

  const inputLongtext = useInputLongtext()

  const clickHandler = () => {
    onFocus()
    inputLongtext(onChange, { ...props, pageNavTitle, defaultText: value })
  }

  return (
    <View
      onClick={clickHandler}
      className={c('form__textarea', className, error ? 'form__textarea--error' : '')}
      style={style}
      hoverClass="hover"
    >
      <View className="form__textarea__title">
        {title}
        {showNew && <Image src={NewBadge} className="form__textarea__title--image" />}
      </View>
      <View className="form__textarea__content">
        <View className={c('form__textarea__text', !value ? 'form__textarea__placeholder' : '')}>
          {value || placeholder}
        </View>
        <Image className="form__textarea__arrow" src={arrowIcon} mode="aspectFill" />
      </View>
    </View>
  )
}

export default Textarea
