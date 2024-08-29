import React, { useEffect, useMemo, useState } from 'react'
import c from 'classnames'
import { findIndex, noop, range } from 'lodash'
import { Picker as RawPicker, View, Image } from '@tarojs/components'
import dayjs from 'dayjs'

import { IProps } from '@/def/common'
import { IFormComponentProps } from '../Form'

import arrowIcon from '@/assets/imgs/cell-arrow.png'
import './index.scss'

function createRange(start: number, end: number): number[] {
  return range(end, start - 1, -1)
}

export interface IYearRangePicker extends IFormComponentProps, IProps {
  value?: [string, string]
  startPlaceholder: string
  endPlaceholder: string
  defaultStartYear?: number
  defaultEndYear?: number
  startYear: number
  endYear?: number
  endUpToNow?: boolean
  endUpToNowText?: string
  onClick?(): void
}

const now = dayjs()

const YearRangePicker: React.FC<IYearRangePicker> = props => {
  const {
    value = [null, null],
    startPlaceholder = '请选择开始年份',
    endPlaceholder = '请选择结束年份',
    endUpToNow = false,
    endUpToNowText = '至今',
    startYear = now.year() - 60,
    endYear: propsEndYear = now.year() + 5,
    defaultStartYear,
    defaultEndYear,
    title,
    error,
    onFocus = noop,
    onClick = noop,
    onChange = noop,
    className,
    style,
  } = props

  const endYear = endUpToNow ? now.year() : propsEndYear

  const startValue = value?.[0]
  const endValue = value?.[1]

  const startRange = useMemo(() => createRange(startYear, endYear), [endYear, startYear])
  const endRange = useMemo(() => {
    const er = createRange(startYear, endYear)
    if (endUpToNow) {
      er.unshift(-1)
    }

    return er
  }, [endUpToNow, endYear, startYear])
  const pickerRange = useMemo(() => [startRange, endRange], [endRange, startRange])

  const [startYearIndex, setStartYearIndex] = useState(-1)
  const [endYearIndex, setEndYearIndex] = useState(-1)

  useEffect(() => {
    if (startValue && endValue) {
      const startValueYear = dayjs(startValue).year()
      const endValueYear =
        endUpToNow && endValue.startsWith('0000') ? now.year() : dayjs(endValue).year()

      const startIndex = findIndex(startRange, t => t === startValueYear)
      const endIndex =
        endUpToNow && endValue.startsWith('0000') ? 0 : findIndex(endRange, t => t === endValueYear)

      setStartYearIndex(startIndex)
      setEndYearIndex(endIndex)
    } else {
      setStartYearIndex(defaultStartYear ? findIndex(startRange, t => t === defaultStartYear) : -1)
      setEndYearIndex(defaultEndYear ? findIndex(endRange, t => t === defaultEndYear) : -1)
    }
  }, [defaultEndYear, defaultStartYear, endRange, endUpToNow, endValue, startRange, startValue])

  const startDisplayText = startValue ? startRange[startYearIndex] : null
  const endDisplayText = endValue
    ? endValue.startsWith('0000')
      ? endUpToNowText
      : endRange[endYearIndex]
    : null

  const changeHandler = e => {
    const [startIndex = -1, endIndex = -1] = e.detail.value
    const startResult = startRange[startIndex] + '-01-01'
    const endResult = endUpToNow && endIndex === 0 ? '0000-00-00' : endRange[endIndex] + '-01-01'

    onChange([startResult, endResult])
  }

  const clickHandler = () => {
    onFocus()
    onClick()
  }

  const cancelHandler = () => {
    if (startValue && endValue) {
      const startValueYear = dayjs(startValue).year()
      const endValueYear =
        endUpToNow && endValue.startsWith('0000') ? now.year() : dayjs(endValue).year()

      const startIndex = findIndex(startRange, t => t === startValueYear)
      const endIndex =
        endUpToNow && endValue.startsWith('0000') ? 0 : findIndex(endRange, t => t === endValueYear)

      setStartYearIndex(startIndex)
      setEndYearIndex(endIndex)
    } else {
      setStartYearIndex(defaultStartYear ? findIndex(startRange, t => t === defaultStartYear) : -1)
      setEndYearIndex(defaultEndYear ? findIndex(endRange, t => t === defaultEndYear) : -1)
    }
  }

  const columnChangeHandler = e => {
    const { column: columnIndex, value: valueIndex } = e.detail
    if (columnIndex <= 0) {
      setStartYearIndex(valueIndex)
    } else {
      setEndYearIndex(valueIndex)
    }
  }

  return (
    <RawPicker
      mode="multiSelector"
      onChange={changeHandler}
      onColumnChange={columnChangeHandler}
      value={[startYearIndex, endYearIndex]}
      range={pickerRange}
      onClick={clickHandler}
      onCancel={cancelHandler}
      className="form__year-range-picker__wrapper"
    >
      <View
        className={c(
          'form__year-range-picker',
          className,
          error ? 'form__year-range-picker--error' : ''
        )}
        style={style}
        hoverClass="hover"
      >
        <View className="form__year-range-picker__title">{title}</View>
        <View className="form__year-range-picker__content">
          <View
            className={c('form__year-range-picker__text', startDisplayText ? '' : 'placeholder')}
          >
            {startDisplayText || startPlaceholder}
          </View>
          <View className="form__year-range-picker__separator"></View>
          <View className={c('form__year-range-picker__text', endDisplayText ? '' : 'placeholder')}>
            {endDisplayText || endPlaceholder}
          </View>
          <Image className="form__year-range-picker__arrow" src={arrowIcon} mode="aspectFill" />
        </View>
      </View>
    </RawPicker>
  )
}

export default YearRangePicker
