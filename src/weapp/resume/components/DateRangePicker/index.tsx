import React, { useEffect, useState } from 'react'
import c from 'classnames'
import _ from 'lodash'
import dayjs from 'dayjs'
import { View } from '@tarojs/components'

import DatePicker, { DatePickerProps } from '../DatePicker'

import './index.scss'

export interface DateRangePickerProps extends Omit<DatePickerProps, 'placeholder' | 'value'> {
  placeholderStart?: string
  placeholderEnd?: string
  startDefaultSelect?: string
  endDefaultSelect?: string
  defaultValue?: string[]
  value?: string[]
}

const defaultStart = dayjs().subtract(60, 'years').format('YYYY-MM-DD')
const defaultEnd = dayjs().add(10, 'years').format('YYYY-MM-DD')

const DateRangePicker: React.FC<DateRangePickerProps> = props => {
  const {
    style,
    className,
    placeholderStart = '请选择',
    placeholderEnd = '请选择',
    onChange = _.noop,
    onFocus = _.noop,
    start = defaultStart,
    end = defaultEnd,
    startDefaultSelect,
    endDefaultSelect,
    error,
    value,
    title,
  } = props

  const [startDate, setStartDate] = useState<string>()

  const startValue = value?.[0]
  const endValue = value?.[1]

  useEffect(() => {
    if (startValue) {
      setStartDate(dayjs(startValue).format('YYYY-MM-01'))
    }
  }, [startValue])

  const changeHandler = (v: string, index: number) => {
    if (index === 0) {
      setStartDate(v)
      onChange([v, value?.[1]])
    } else {
      onChange([value?.[0], v])
    }
  }

  const startDisplayText = startValue ? dayjs(startValue).format('YYYY-MM') : ''
  const endDisplayText = endValue
    ? endValue.startsWith('0000')
      ? '至今'
      : dayjs(endValue).format('YYYY-MM')
    : ''

  return (
    <View
      className={c(
        'form__date-range-picker',
        className,
        error ? 'form__date-range-picker--error' : ''
      )}
      style={style}
      hoverClass="hover"
    >
      <View className="form__date-range-picker__title">{title}</View>
      <View className="form__date-range-picker__content">
        <DatePicker
          value={value && value[0]}
          onChange={v => changeHandler(v, 0)}
          onClick={onFocus}
          placeholder={placeholderStart}
          start={start}
          end={end}
          defaultSelect={startDefaultSelect}
          className="form__date-range-picker__picker"
        >
          <View
            className={c('form__date-range-picker__text', startDisplayText ? '' : 'placeholder')}
          >
            {startDisplayText || placeholderStart}
          </View>
        </DatePicker>

        <View className="form__date-range-picker__separator"></View>
        <DatePicker
          value={value && value[1]}
          placeholder={placeholderEnd}
          onClick={onFocus}
          disabled={!startDate}
          start={startDate}
          onChange={v => changeHandler(v, 1)}
          className="form__date-range-picker__picker"
          defaultSelect={endDefaultSelect}
          upToNow
        >
          <View className={c('form__date-range-picker__text', endDisplayText ? '' : 'placeholder')}>
            {endDisplayText || placeholderEnd}
          </View>
        </DatePicker>
      </View>
    </View>
  )
}

export default DateRangePicker
