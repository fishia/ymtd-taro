import React, { useEffect, useState } from 'react'
import c from 'classnames'
import _ from 'lodash'
import dayjs from 'dayjs'
import { ITouchEvent, Picker as AtPicker, View, Image } from '@tarojs/components'

import { IProps } from '@/def/common'
import { IFormComponentProps } from '../Form'

import arrowIcon from '@/assets/imgs/cell-arrow.png'
import './index.scss'

type IPickerItem = {
  key: string | number
  label: string | number
}

export interface DatePickerProps extends Omit<IFormComponentProps<string>, 'title'>, IProps {
  placeholder?: string
  start?: string
  end?: string
  upToNow?: boolean
  upToNowText?: string
  disabled?: boolean
  onClick?(e: ITouchEvent): void
  title?: string
  defaultSelect?: string
}

function createRange(start: number, end: number): IPickerItem[] {
  return _.range(end, start - 1, -1).map(t => ({
    key: t,
    label: String(t),
  }))
}

const defaultStart = dayjs().subtract(60, 'years').format('YYYY-MM-DD')
const defaultEnd = dayjs().add(10, 'years').format('YYYY-MM-DD')

const DatePicker: React.FC<DatePickerProps> = props => {
  const {
    style,
    className,
    title,
    value: rawValue,
    placeholder = '',
    onChange = _.noop,
    onFocus = _.noop,
    onClick = _.noop,
    start = defaultStart,
    end = defaultEnd,
    upToNow = false,
    upToNowText = '至今',
    disabled = false,
    error = false,
    defaultSelect = '',
    children,
  } = props

  const value = rawValue || ''

  const [displayText, setDisplayText] = useState<string>('')

  const [monthRange, setMonthRange] = useState<IPickerItem[]>([])

  const [yearIndex, setYearIndex] = useState<number>(-1)
  const [monthIndex, setMonthIndex] = useState<number>(-1)

  const startDate = dayjs(start)
  const endDate = upToNow ? dayjs() : dayjs(end)

  const startYear = startDate.year()
  const endYear = endDate.year()
  const startMonth = startDate.month() + 1
  const endMonth = endDate.month() + 1

  const yearRange = createRange(startYear, endYear)
  if (upToNow) {
    yearRange.unshift({ key: -1, label: upToNowText })
  }

  const findIndexOrDefault = (array, cond) => Math.max(_.findIndex(array, cond), 0)

  useEffect(
    () => {
      if (value.startsWith('0000')) {
        setYearIndex(0)
        setMonthRange([])
        setMonthIndex(-1)
        setDisplayText(upToNowText)
      } else {
        const valueDate = dayjs(value || undefined)
        const monthStart = valueDate.year() <= startYear ? startMonth : 1
        const monthEnd = valueDate.year() >= endYear ? endMonth : 12

        const newYearIndex = _.findIndex(yearRange, t => t.key === valueDate.year())
        setYearIndex(findIndexOrDefault(yearRange, t => t.key === valueDate.year()))

        const newMonthRange = newYearIndex <= 0 && upToNow ? [] : createRange(monthStart, monthEnd)
        setMonthRange(newMonthRange)
        setMonthIndex(findIndexOrDefault(newMonthRange, t => t.key === valueDate.month() + 1))

        if (value) {
          onChange(valueDate.format('YYYY-MM-DD'))
          setDisplayText(valueDate.format('YYYY-MM'))
        } else {
          setDisplayText('')
        }
      }
    },
    // eslint-disable-next-line
    [value]
  )

  useEffect(
    () => {
      if (value.startsWith('0000')) {
        setYearIndex(0)
        setMonthRange([])
        setMonthIndex(-1)
        return
      }

      const valueDate = dayjs(value || undefined)
      const monthStart = valueDate.year() <= startYear ? startMonth : 1
      const monthEnd = valueDate.year() >= endYear ? endMonth : 12

      const newYearIndex = _.findIndex(yearRange, t => t.key === valueDate.year())

      const defaultSelectDate = dayjs(defaultSelect || undefined)

      const targetYear = !value && defaultSelect ? defaultSelectDate.year() : valueDate.year()
      setYearIndex(
        Math.max(
          _.findIndex(yearRange, t => t.key === targetYear),
          0
        )
      )

      if (!value && defaultSelect) {
        const newMonthRange = defaultSelect?.startsWith('0000') ? [] : createRange(1, 12)
        setMonthRange(newMonthRange)
        setMonthIndex(
          defaultSelect?.startsWith('0000')
            ? 0
            : _.findIndex(newMonthRange, t => t.key === defaultSelectDate.month() + 1)
        )
      } else {
        const newMonthRange = newYearIndex <= 0 && upToNow ? [] : createRange(monthStart, monthEnd)
        setMonthRange(newMonthRange)
        setMonthIndex(_.findIndex(newMonthRange, t => t.key === valueDate.month() + 1))
      }
    },
    // eslint-disable-next-line
    [start, end, defaultSelect]
  )

  const columnChangeHandler = e => {
    const { column: columnIndex, value: valueIndex } = e.detail

    if (columnIndex !== 0) {
      return
    }

    const yearValue = yearRange[valueIndex].key
    if (yearValue === -1) {
      setYearIndex(valueIndex)
      setMonthRange([])
      return
    }

    const monthStart = yearValue <= startYear ? startMonth : 1
    const monthEnd = yearValue >= endYear ? endMonth : 12

    const newMonthRange = createRange(monthStart, monthEnd)

    setYearIndex(valueIndex)
    setMonthRange(newMonthRange)
    setMonthIndex(idx => Math.max(idx, 0))
  }

  const changeHandler = e => {
    const [yearIdx = -1, monthIdx = -1] = e.detail.value
    if (yearIdx === -1 || monthIdx === -1) {
      onChange(undefined)
      setDisplayText('')
      return
    }
    if (yearIdx === 0 && upToNow) {
      onChange('0000-00-00')
      setDisplayText(upToNowText)
      return
    }

    const year = yearRange[yearIdx].key
    const month = String(monthRange[monthIdx].key).padStart(2, '0')
    setMonthIndex(monthIdx)
    onChange(year + '-' + month + '-01')
    setDisplayText(year + '-' + month)
  }

  const clickHandler = e => {
    onClick(e)
    if (!disabled) {
      onFocus()
    }
  }

  const cancelHandler = () => {
    if (value.startsWith('0000')) {
      setYearIndex(0)
      setMonthRange([])
      setMonthIndex(-1)
    } else {
      const valueDate = dayjs(value || undefined)
      const monthStart = valueDate.year() <= startYear ? startMonth : 1
      const monthEnd = valueDate.year() >= endYear ? endMonth : 12

      const newYearIndex = _.findIndex(yearRange, t => t.key === valueDate.year())

      const defaultSelectDate = dayjs(defaultSelect || undefined)

      const targetYear = !value && defaultSelect ? defaultSelectDate.year() : valueDate.year()
      setYearIndex(
        Math.max(
          _.findIndex(yearRange, t => t.key === targetYear),
          0
        )
      )

      if (!value && defaultSelect) {
        const newMonthRange = defaultSelect?.startsWith('0000') ? [] : createRange(1, 12)
        setMonthRange(newMonthRange)
        setMonthIndex(
          defaultSelect?.startsWith('0000')
            ? 0
            : _.findIndex(newMonthRange, t => t.key === defaultSelectDate.month() + 1)
        )
      } else {
        const newMonthRange = newYearIndex <= 0 && upToNow ? [] : createRange(monthStart, monthEnd)
        setMonthRange(newMonthRange)
        setMonthIndex(_.findIndex(newMonthRange, t => t.key === valueDate.month() + 1))
      }
    }
  }

  return (
    <AtPicker
      className="form__date-picker__wrap"
      mode="multiSelector"
      onChange={changeHandler}
      onColumnChange={columnChangeHandler}
      value={[yearIndex, monthIndex]}
      range={[yearRange, monthRange]}
      disabled={disabled}
      rangeKey="label"
      onClick={clickHandler}
      onCancel={cancelHandler}
    >
      {children ? (
        children
      ) : (
        <View
          className={c('form__date-picker', className, error ? 'form__date-picker--error' : '')}
          hoverClass="hover"
          style={style}
        >
          <View className="form__date-picker__title">{title}</View>
          <View className="form__date-picker__content">
            <View
              className={c(
                'form__date-picker__text',
                !displayText ? 'form__date-picker__placeholder' : ''
              )}
            >
              {displayText || placeholder}
            </View>
            <Image className="form__date-picker__arrow" src={arrowIcon} mode="aspectFill" />
          </View>
        </View>
      )}
    </AtPicker>
  )
}

export default DatePicker
