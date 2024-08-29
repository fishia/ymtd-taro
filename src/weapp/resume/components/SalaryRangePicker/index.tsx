import React, { useCallback, useEffect, useState } from 'react'
import c from 'classnames'
import { findIndex, noop, range } from 'lodash'
import { View, Image, Picker as RawPicker } from '@tarojs/components'

import { IProps } from '@/def/common'
import { IFormComponentProps } from '../Form'

import arrowIcon from '@/assets/imgs/cell-arrow.png'
import './index.scss'

export interface ISalaryRangePickerProps extends IFormComponentProps<number[]>, IProps {
  placeholder?: string
  onFocus?(e: any): any
  defaultSelect?: number[]
}

const startRangeArray = [...range(1, 30, 1), ...range(30, 50, 5), ...range(50, 200 + 10, 10)]
const endRangeArray = [...range(2, 30, 1), ...range(30, 50, 5), ...range(50, 210 + 10, 10)]

const truncEndRange = start => endRangeArray.filter(t => t >= start)

const SalaryRangePicker: React.FC<ISalaryRangePickerProps> = props => {
  const {
    className,
    style,
    title,
    value,
    placeholder,
    onChange = noop,
    onFocus = noop,
    defaultSelect,
    error,
  } = props

  const valueStart = value?.[0]
  const valueEnd = value?.[1]
  const defaultStart = defaultSelect?.[0]
  const defaultEnd = defaultSelect?.[1]

  const [startIndex, setStartIndex] = useState(-1)
  const [endIndex, setEndIndex] = useState(-1)

  const [endRange, setEndRange] = useState(() => endRangeArray)

  const calcAndSetIndex = useCallback(() => {
    if ((valueStart && valueEnd) || (defaultStart && defaultEnd)) {
      setStartIndex(findIndex(startRangeArray, s => s === (valueStart || defaultStart)))

      const newEndRange = truncEndRange(valueStart || defaultStart)
      setEndRange(newEndRange)
      setEndIndex(findIndex(newEndRange, s => s === (valueEnd || defaultEnd)))
    }
  }, [defaultEnd, defaultStart, valueEnd, valueStart])

  useEffect(() => {
    calcAndSetIndex()
  }, [calcAndSetIndex])

  const columnChangeHandler = e => {
    const { column: columnIndex, value: valueIndex } = e.detail

    if (columnIndex <= 0) {
      const startValue = startRangeArray[valueIndex]
      const newEndRange = truncEndRange(startValue)
      setStartIndex(valueIndex)
      setEndRange(newEndRange)
    } else {
    }
  }

  const changeHandler = e => {
    const [newStartIndex = -1, newEndIndex = -1] = e.detail.value
    onChange([startRangeArray[newStartIndex], endRange[newEndIndex]])
  }

  const clickHandler = () => {
    onFocus()
  }

  const cancelHandler = () => {
    calcAndSetIndex()
  }

  const displayText = valueStart && valueEnd ? `${valueStart}-${valueEnd}k` : ''

  return (
    <RawPicker
      className="form__salary-range-picker__wrap"
      mode="multiSelector"
      onChange={changeHandler}
      onColumnChange={columnChangeHandler}
      value={[startIndex, endIndex]}
      range={[startRangeArray, endRange]}
      onClick={clickHandler}
      onCancel={cancelHandler}
    >
      <View
        onClick={clickHandler}
        className={c(
          'form__salary-range-picker',
          className,
          error ? 'form__salary-range-picker--error' : ''
        )}
        style={style}
        hoverClass="hover"
      >
        <View className="form__salary-range-picker__title">{title}</View>
        <View className="form__salary-range-picker__content">
          <View
            className={c(
              'form__salary-range-picker__text',
              !displayText ? 'form__salary-range-picker__placeholder' : ''
            )}
          >
            {displayText || placeholder}
          </View>
          <Image className="form__salary-range-picker__arrow" src={arrowIcon} mode="aspectFill" />
        </View>
      </View>
    </RawPicker>
  )
}

export default SalaryRangePicker
