import React, { useEffect, useState } from 'react'
import c from 'classnames'
import _ from 'lodash'
import { View, Image } from '@tarojs/components'

import { IJobCategory, IProps } from '@/def/common'
import useSelectJobCategory from '@/hooks/custom/useSelectJobCategory'
import { IFormComponentProps } from '../Form'

import arrowIcon from '@/assets/imgs/cell-arrow.png'
import './index.scss'

export interface IJobCategoryPickerProps extends IFormComponentProps<string>, IProps {
  name?: string
  placeholder?: string
  onChangeCategory?(val: IJobCategory): void
}

const defaultValue = ''
const defaultName = ''

const JobCategoryPicker: React.FC<IJobCategoryPickerProps> = props => {
  const {
    title,
    value = defaultValue,
    name = defaultName,
    error = false,
    placeholder = '请选择',
    onChange = _.noop,
    onFocus = _.noop,
    onChangeCategory = _.noop,
    className,
    style,
  } = props

  const selectJobCategory = useSelectJobCategory()

  const [jobCategory, setJobCategory] = useState<string>(defaultValue)
  const [jobCategoryName, setJobCategoryName] = useState<string>(defaultName)

  useEffect(() => void setJobCategory(value), [value])
  useEffect(() => void setJobCategoryName(name), [name])

  const hasJobCategory = jobCategory.length > 0
  const displayName = jobCategoryName || '(未知)'

  const pickerClickHandler = () => {
    onFocus()
    selectJobCategory<IJobCategory>(
      newJobCategory => {
        setJobCategory(newJobCategory.value)
        setJobCategoryName(newJobCategory.label)

        onChange(newJobCategory.value)
        onChangeCategory(newJobCategory)
      },
      {
        required: true,
        selectionValues: jobCategory ? [jobCategory] : undefined,
      }
    )
  }

  return (
    <View
      className={c(
        'form__job-category-picker',
        className,
        error ? 'form__job-category-picker--error' : ''
      )}
      style={style}
      onClick={pickerClickHandler}
      hoverClass="hover"
    >
      <View className="form__job-category-picker__title">{title}</View>
      <View className="form__job-category-picker__content">
        <View
          className={c(
            'form__job-category-picker__text',
            !hasJobCategory ? 'form__job-category-picker__placeholder' : ''
          )}
        >
          {hasJobCategory ? displayName : placeholder}
        </View>
        <Image className="form__job-category-picker__arrow" src={arrowIcon} mode="aspectFill" />
      </View>
    </View>
  )
}

export default JobCategoryPicker
