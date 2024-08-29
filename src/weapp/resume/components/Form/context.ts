import React from 'react'
import _ from 'lodash'

import { IValidationFn, TErrorValue } from '.'

export interface IFormContext<T> {
  data: T
  updated: boolean
  errorObj: Record<keyof T, TErrorValue>
  onFieldChange(field: keyof T, newVal: T[keyof T]): any
  setFieldError(field: keyof T, isError: boolean, value?: string): void
  validationsRef: Record<keyof T, IValidationFn<T>>
}

const FormContext = React.createContext<IFormContext<any>>({
  data: {},
  updated: false,
  errorObj: {},
  onFieldChange: _.noop,
  setFieldError: _.noop,
  validationsRef: {},
})

export default FormContext
