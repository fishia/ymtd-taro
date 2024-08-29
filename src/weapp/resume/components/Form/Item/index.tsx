import { View } from '@tarojs/components'
import R from 'ramda'
import React, { useContext, useEffect } from 'react'

import { IProps } from '@/def/common'

import { IFormComponentProps, IValidationProps } from '..'
import DatePicker from '../../DatePicker'
import DateRangePicker from '../../DateRangePicker'
import JobCategoryPicker from '../../JobCategoryPicker'
import Link from '../../Link'
import LocationPicker from '../../LocationPicker'
import Picker from '../../Picker'
import SalaryRangePicker from '../../SalaryRangePicker'
import YearRangePicker from '../../YearRangePicker'
import FormContext, { IFormContext } from '../context'

export type IFormItemRef = {
  itemRef: any
}

export interface IFormItemProps<TFormData = any> extends IProps {
  field: keyof TFormData
  children: React.FunctionComponentElement<IFormComponentProps<TFormData[keyof TFormData]>>
  required?: boolean
  validation?: IValidationProps<TFormData>
}

function FormItem<TFormData>(props: IFormItemProps<TFormData>): ReturnType<React.FC> {
  const { field, children, required, validation } = props

  const formContext = useContext(FormContext) as IFormContext<TFormData>

  const fieldValue = formContext.data[field]

  const fieldError = formContext.errorObj[field]

  const isRequired = children.props.required || required
  const title = children.props.title

  const minLength = children.props.minLength

  const isSinglePicker =
    children.type === Picker ||
    children.type === LocationPicker ||
    children.type === DatePicker ||
    children.type === JobCategoryPicker
  const isRangePicker =
    children.type === YearRangePicker ||
    children.type === DateRangePicker ||
    children.type === SalaryRangePicker ||
    children.type === DateRangePicker
  const isLink = children.type === Link

  useEffect(
    () => {
      const validateFn = validation ? val => validation(val, title) : R.always(null)
      const requireFn = isRequired
        ? val => {
            const tipsText = isSinglePicker || isRangePicker ? '请选择' : '请填写'
            const err = new Error(tipsText + title)

            if (val === undefined || val === null) {
              return err
            } else if (isLink) {
              return Boolean(val) ? null : err
            } else if (isSinglePicker) {
              return String(val || 0) !== '0' ? null : err
            } else if (isRangePicker) {
              return val[0] && val[1] ? null : err
            } else if (typeof val === 'string') {
              return val.trim() !== '' ? null : err
            }

            return null
          }
        : R.always(null)
      const minLengthFn = minLength
        ? val => {
            const err = new Error(`${title}至少输入${minLength}个字`)
            if (isRequired && (typeof val !== 'string' || val.length < minLength)) {
              return err
            } else if (
              !isRequired &&
              typeof val === 'string' &&
              val.length > 0 &&
              val.length < minLength
            ) {
              return err
            }

            return null
          }
        : R.always(null)

      formContext.validationsRef[field] = val =>
        validateFn(val) || requireFn(val) || minLengthFn(val) || null

      return () => {
        delete formContext.validationsRef[field]
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [field, validation]
  )

  const formItemChangeHandler = (newValue: TFormData[keyof TFormData]) => {
    children.props.onChange && children.props.onChange(newValue)
    formContext.onFieldChange(field, newValue)

    return newValue
  }

  const formItemFocusHandler = () => {
    formContext.setFieldError(field, false)
  }

  return (
    <View className="resume-form-item__wrap" hoverClass={String(field)}>
      {React.cloneElement(children, {
        value: fieldValue,
        onChange: formItemChangeHandler,
        onFocus: formItemFocusHandler,
        error: fieldError.isError,
        required: isRequired,
      })}
    </View>
  )
}

export default FormItem
