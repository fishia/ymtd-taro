import React from 'react'
import c from 'classnames'
import { View } from '@tarojs/components'

import { IRelationalType } from '@/def/common'
import ThinkInput, { IThinkInputProps } from '../ThinkInput'

import './index.scss'

export interface ISearchBarProps extends IThinkInputProps {
  type?: IRelationalType
  border?: boolean
}

const SearchBar = (props: ISearchBarProps, ref) => {
  const { className, type, children, border = true } = props

  const ThinkInputProps: IThinkInputProps = {
    showBadge: ['company', 'jd'].includes(type as IRelationalType),
    ...props,
  }

  return (
    <View className={c('hd-searchbar', className, { 'hd-searchbar__border': border })}>
      {children}
      <ThinkInput {...ThinkInputProps} ref={ref} />
    </View>
  )
}

export default React.forwardRef(SearchBar)
