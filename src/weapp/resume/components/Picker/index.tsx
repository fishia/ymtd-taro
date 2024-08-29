import React, { useEffect, useState, useCallback } from 'react'
import c from 'classnames'
import { find, findIndex, noop } from 'lodash'
import { Picker as RawPicker, View, Image } from '@tarojs/components'

import { IFormOption, IProps } from '@/def/common'
import { IFormComponentProps } from '../Form'

import arrowIcon from '@/assets/imgs/cell-arrow.png'
import './index.scss'

export interface IPickerProps extends IFormComponentProps<number | string>, IProps {
  range: IFormOption[]
  placeholder?: string
  defaultSelectValue?: number | string
  border?: boolean
  emitValueType?: 'number' | 'string' | 'auto'
}

const Picker: React.FC<IPickerProps> = props => {
  const {
    style,
    className,
    title,
    range,
    value,
    placeholder = '',
    onChange = noop,
    onFocus = noop,
    emitValueType = 'auto',
    error = false,
    defaultSelectValue,
  } = props

  const [pickerValue, setPickerValue] = useState<any>()

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

  const findRangeItemByKey = key => find(range, t => String(t.value) === String(key))
  const findIndexByKey = key => {
    const valueIndex = findIndex(range, t => String(t.value) === String(key))
    if (valueIndex !== -1) {
      return valueIndex
    }

    return Math.max(
      findIndex(range, t => String(t.value) === String(defaultSelectValue || '')),
      0
    )
  }

  useEffect(() => {
    setPickerValue(value)
  }, [value, range])

  const pickerChangeHandler = e => {
    setPickerValue(range[e.detail.value]?.value)
    onChange(emitValueFn(range[e.detail.value]?.value))
  }

  return (
    <RawPicker
      {...props}
      className="form__picker__wrap"
      mode="selector"
      range={range}
      rangeKey="label"
      onChange={pickerChangeHandler}
      onClick={() => {
        onFocus()
      }}
      value={findIndexByKey(pickerValue)}
    >
      <View
        className={c('form__picker', className, error ? 'form__picker--error' : '')}
        style={style}
        hoverClass="hover"
      >
        <View className="form__picker__title">{title}</View>
        <View className="form__picker__content">
          <View
            className={c(
              'form__picker__text',
              !findRangeItemByKey(pickerValue)?.label ? 'form__picker__placeholder' : ''
            )}
          >
            {(findRangeItemByKey(pickerValue)?.label as string) || placeholder}
          </View>
          <Image className="form__picker__arrow" src={arrowIcon} mode="aspectFill" />
        </View>
      </View>
    </RawPicker>
  )
}

export default Picker
