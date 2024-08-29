import React from 'react'
import c from 'classnames'
import _ from 'lodash'
import { AtListItem } from 'taro-ui'

import { IJobCategory, IProps } from '@/def/common'
import useSelectJobCategory from '@/hooks/custom/useSelectJobCategory'

import './index.scss'

export interface ExpectJobProps extends IProps {
  value?: IJobCategory[]
  onChange?(newJobs: IJobCategory[]): void
}

const ExpectJob: React.FC<ExpectJobProps> = props => {
  const { value = [], onChange = _.noop, className, style } = props

  const selectJobCategory = useSelectJobCategory()

  const hasSelected = value.length > 0
  const jobNames = value.map(item => item.label).join('，')

  const pickerClickHandler = () => {
    selectJobCategory<IJobCategory[]>(onChange, {
      mulitMode: true,
      required: true,
      selectionValues: value.map(t => t.value),
    })
  }

  return (
    <AtListItem
      onClick={pickerClickHandler}
      title="期望职位"
      className={c(
        'form__job-categories-picker form__job-categories-picker--required',
        { 'form__job-categories-picker--placeholder': !hasSelected },
        className
      )}
      customStyle={style}
      extraText={hasSelected ? jobNames : '请选择'}
      arrow="right"
    />
  )
}

export default ExpectJob
