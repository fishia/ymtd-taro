import { noop } from 'lodash'
import React, { useRef } from 'react'

import { IFormError } from '@/def/client'

import Form from './Form'
import FormItem from './Item'

export interface IFormComponentProps<TFormField = any> {
  value?: TFormField
  title: string
  text?: string
  required?: boolean
  onChange?(p: TFormField): any
  onFocus?(e: any): any
  minLength?: number
  error?: boolean
}

export type TErrorValue = {
  isError: boolean
  value?: string
}

export interface IFormRef<T> {
  data: T
  getData(): T
  errorObj: Record<keyof T, TErrorValue>
  setField(field: keyof T, newVal: T[keyof T]): any
  setFieldError(field: keyof T, isError: boolean, value?: string): void
  validateByResponse(err: IFormError<T>): void
  validateAndToastByResponse(err: IFormError<T>): void
  validate(): boolean
  validateAndToast(): Promise<boolean>
  clearAllError(): void
}

export type IValidationProps<T> = (val: T[keyof T], title: string) => Error | null

export type IValidationFn<T> = (val: T[keyof T]) => Error | null

export function useFormRef<T>(val: any = null): React.RefObject<IFormRef<T>> {
  const noopFn = noop as any

  return useRef<IFormRef<T>>({
    data: val,
    getData: noopFn,
    errorObj: {} as any,
    setField: noopFn,
    setFieldError: noopFn,
    validateByResponse: noopFn,
    validateAndToastByResponse: noopFn,
    validate: noopFn,
    validateAndToast: noopFn,
    clearAllError: noopFn,
  })
}

export default Form

export { Form, FormItem }
