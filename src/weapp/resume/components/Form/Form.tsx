import { IFormRef, IValidationFn, TErrorValue } from '.'
import { createSelectorQuery } from '@tarojs/taro'
import _ from 'lodash'
import R from 'ramda'
import React, { useImperativeHandle, useEffect, useRef, useState } from 'react'

import { IProps } from '@/def/common'
import useAlertBeforeUnload from '@/hooks/custom/useAlertBeforeUnload'
import useToast from '@/hooks/custom/useToast'

import FormContext from './context'

export interface IFormProps<T> extends IProps {
  data: T
  saveAlert?: boolean
}

async function getFormItemOrder() {
  return new Promise<string[]>(
    resolve =>
      void createSelectorQuery()
        .selectAll('.resume-form-item__wrap')
        .fields(
          { properties: ['hover-class'] },
          res => void resolve(res.map(item => item.hoverClass))
        )
        .exec()
  )
}

function handleInitFormData<T>(data: T): T {
  const formData = { ...data } as any
  if (formData.startDate || formData.endDate) {
    Object.assign(formData, { duringDate: [formData.startDate, formData.endDate] })
  }

  if (formData.expectSalaryFrom || formData.expectSalaryTo) {
    Object.assign(formData, { expectSalary: [formData.expectSalaryFrom, formData.expectSalaryTo] })
  }

  return formData
}

function Form<T extends object>(props: IFormProps<T>, ref: any): ReturnType<React.FC> {
  const { data, children, saveAlert = false } = props
  const showToast = useToast()

  const [formValue, setFormValue] = useState<T>(() => handleInitFormData(data))
  const [updated, setUpdated] = useState(false)

  const { enableAlertBeforeUnload } = useAlertBeforeUnload()
  const [errorObj, setErrorObj] = useState<Record<keyof T, TErrorValue>>(
    _.mapValues<T, TErrorValue>(data, () => ({ isError: false }))
  )

  const formDataRef = useRef<T>(data)
  const validationsRef = useRef<Record<keyof T, IValidationFn<T>>>({} as any)

  useEffect(() => {
    setFormValue(R.clone(handleInitFormData(data)))
    formDataRef.current = { ...handleInitFormData(data) }
  }, [data])

  useImperativeHandle<IFormRef<T>, IFormRef<T>>(ref, () => ({
    // 当前表单数据
    data: formDataRef.current,
    getData: () => {
      const formData = { ...formDataRef.current }

      const duringDate = (formDataRef.current as any)?.duringDate
      if (duringDate) {
        Object.assign(formData, {
          startDate: duringDate[0],
          endDate: duringDate[1],
        })
        ;(formData as any).duringDate = undefined
      }

      const expectSalary = (formDataRef.current as any)?.expectSalary
      if (expectSalary) {
        Object.assign(formData, {
          expectSalaryFrom: expectSalary[0],
          expectSalaryTo: expectSalary[1],
        })
        ;(formData as any).expectSalary = undefined
      }

      return formData
    },
    // 当前表单错误信息对象
    errorObj,
    // 设置表单某一项的值
    setField: (field, newVal) => {
      formDataRef.current[field] = newVal
      setFormValue({ ...formDataRef.current, [field]: newVal })
    },
    // 设置表单某一项的错误状态
    setFieldError: (field, isError, value) => {
      setErrorObj({ ...errorObj, [field]: { isError, value } })
    },
    // 使用错误对象自动设置表单错误状态并提示
    validateByResponse: (err: any) => {
      setFormValue({ ...formDataRef.current })
      _.forEach(err.data || err.message, (msg = [], field) => {
        let resultField = field
        if (resultField === 'expectSalaryFrom' || resultField === 'expectSalaryTo') {
          resultField = 'expectSalary'
        }
        if (resultField === 'startDate' || resultField === 'endDate') {
          resultField = 'duringDate'
        }

        setErrorObj({ ...errorObj, [resultField]: { isError: true, value: msg[0] || '' } })
      })
    },
    validateAndToastByResponse: (err: any) => {
      setFormValue({ ...formDataRef.current })
      const toastMsg = _.once(text => showToast({ content: text }))
      if (!err.data) {
        toastMsg(err.message)

        return
      }

      _.forEach(err.data, (msg = [], field) => {
        if (msg && msg.length > 0) {
          toastMsg(msg[0])
        }
        let resultField = field
        if (resultField === 'expectSalaryFrom' || resultField === 'expectSalaryTo') {
          resultField = 'expectSalary'
        }
        if (resultField === 'startDate' || resultField === 'endDate') {
          resultField = 'duringDate'
        }

        setErrorObj({ ...errorObj, [resultField]: { isError: true, value: msg[0] || '' } })
      })
    },
    // 验证表单，返回错误项数组或者 null
    validate: () => {
      setFormValue({ ...formDataRef.current })
      const errors: Error[] = []
      _.forEach(validationsRef.current, (validation, field) => {
        if (validation) {
          const result = validation(formDataRef.current[field])

          if (result !== null) {
            errors.push(result)
            setErrorObj(t => ({ ...t, [field]: { isError: true, value: result.message } }))
          }
        }
      })

      return errors.length === 0
    },
    // 验证表单并弹出 Toast 提示，返回 true/false
    validateAndToast: async () => {
      setFormValue({ ...formDataRef.current })

      const errors: Record<string, Error> = {}
      let hasError = false

      _.forEach(validationsRef.current, (validation, field) => {
        if (validation) {
          const result = validation(formDataRef.current[field])
          if (result !== null) {
            hasError = true
            errors[field] = result
            setErrorObj(t => ({ ...t, [field]: { isError: true, value: result.message } }))
          }
        }
      })

      if (!hasError) {
        return true
      }

      const order = await getFormItemOrder()

      for (const errorField of order) {
        if (errors[errorField]) {
          showToast({ content: errors[errorField].message || '' })
          break
        }
      }

      return false
    },
    // 清空所有错误项目
    clearAllError: () => {
      setErrorObj({} as any)
    },
  }))

  const onFieldChange = (field: keyof T, newVal: T[keyof T]) => {
    !updated && setUpdated(true)
    saveAlert && enableAlertBeforeUnload('现在退出，您编辑的信息将不会保存，是否继续？')
    formDataRef.current[field] = newVal
    setFormValue({ ...formDataRef.current })
  }

  const onSetFieldError = (field: keyof T, isError: boolean, value?: string) => {
    if (errorObj[field].isError !== isError || errorObj[field].value !== value) {
      setErrorObj({ ...errorObj, [field]: { isError, value } })
    }
  }

  return (
    <FormContext.Provider
      value={{
        data: formValue,
        updated,
        errorObj,
        validationsRef: validationsRef.current,
        onFieldChange,
        setFieldError: onSetFieldError,
      }}
    >
      {children}
    </FormContext.Provider>
  )
}

export default React.forwardRef(Form)
