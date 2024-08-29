import { View } from '@tarojs/components'
import { pxTransform } from '@tarojs/taro'
import c from 'classnames'
import _ from 'lodash'
import React, { useContext, useMemo } from 'react'

import { IFormOption, IProps } from '@/def/common'
import {
  IResumeBasicInfo,
  IEducationExp,
  IJobExp,
  IProjectExp,
  IResumeIntentInfo,
} from '@/def/resume'

import './index.scss'

export type ResumeDataContextType =
  | IResumeBasicInfo
  | IEducationExp
  | IJobExp
  | IProjectExp
  | IResumeIntentInfo

export interface IResumeDataProps<T extends ResumeDataContextType> {
  data: T
  onFieldClick?(p: T): void
}

export interface IResumeFieldProps<T extends ResumeDataContextType> extends IProps {
  field: keyof T
  label: string
  hintPrefix?: string
  separator?: boolean
  beforeSeparator?: boolean
  noHint?: boolean
  render?(p: T[keyof T] | null): string | React.ReactNode
  style?: React.CSSProperties
  inline?: boolean
  maxWidth?: number
  option?: IFormOption[] | true
  array?: boolean
}

function createResumeData<T extends ResumeDataContextType>(defaultValue: T | null = null) {
  const ResumeDataContext = React.createContext<T | null>(defaultValue)

  function ResumeData(props: IResumeDataProps<T> & IProps) {
    const { data, onFieldClick = _.noop } = props

    return (
      <ResumeDataContext.Provider value={{ ...data, onFieldClick }}>
        {props.children}
      </ResumeDataContext.Provider>
    )
  }

  function ResumeField(props: IResumeFieldProps<T>) {
    const {
      style,
      className,
      field,
      label,
      separator = false,
      beforeSeparator = false,
      noHint = false,
      hintPrefix = '请补全',
      render = _.identity,
      inline = false,
      maxWidth = 550,
      option,
      array,
      children,
    } = props
    const context = useContext<(T & { onFieldClick?(p: T): void }) | null>(ResumeDataContext)

    const klassName = c('resume-field', className, {
      'resume-field--separator': separator,
      'resume-field--separator-before': beforeSeparator,
      'resume-field--inline': inline,
    })

    const value = context?.[field] ?? null

    return useMemo(() => {
      const EmptyItem = () =>
        noHint ? null : (
          <View
            className={klassName + ' resume-field--hint'}
            style={style}
            onClick={context?.onFieldClick ?? _.noop}
          >
            {hintPrefix + label}
          </View>
        )

      const isEmpty =
        value === undefined ||
        value === null ||
        String(value) === '' ||
        (option === true && String(value) === '0') ||
        (array && (value as Array<any>).length <= 0)

      if (isEmpty) {
        return <EmptyItem />
      }

      if (Array.isArray(option) && option.length > 0) {
        const currentOptionItem = _.find(option, t => t.value == (value as any))
        if (!currentOptionItem) {
          return <EmptyItem />
        }

        return (
          <View className={klassName} style={{ ...style, maxWidth: pxTransform(maxWidth) }}>
            {currentOptionItem.label}
          </View>
        )
      }

      return (
        <View className={klassName} style={{ ...style, maxWidth: pxTransform(maxWidth) }}>
          {render(value)}
          {children}
        </View>
      )
    }, [
      value,
      option,
      array,
      klassName,
      style,
      maxWidth,
      render,
      noHint,
      context?.onFieldClick,
      hintPrefix,
      label,
    ])
  }

  return { ResumeData, ResumeField }
}

export default createResumeData
