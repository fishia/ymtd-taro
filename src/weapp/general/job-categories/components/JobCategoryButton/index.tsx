import React from 'react'
import c from 'classnames'
import _ from 'lodash'
import { View } from '@tarojs/components'

import { IProps } from '@/def/common'

import './index.scss'

export interface IJobCategoryButtonProps extends IProps {
  onClick?(): void
  selected?: boolean
}

const JobCategoryButton: React.FC<IJobCategoryButtonProps> = props => {
  const { selected = false, onClick = _.noop, className, style, children } = props

  return (
    <View
      className={c('job-category-button', { 'job-category-button--selected': selected }, className)}
      style={style}
      onClick={onClick}
    >
      {children}
    </View>
  )
}

export default JobCategoryButton
