import React from 'react'
import { View } from '@tarojs/components'
import c from 'classnames'
import { IProps } from '@/def/common'
import { ICurrentKeyword } from '@/def/resume'
import './index.scss'

export interface SelectedItemProps extends IProps {
  showClear?: boolean
  item: ICurrentKeyword
  onDelete: (singleItem: ICurrentKeyword, id: number) => void
}

const SelectedItem: React.FC<SelectedItemProps> = (props) => {
  const { item, onDelete, showClear = true, className } = props
  return <View className={c("selected-button", className)}>
    <View className="selected-button__label">{item.keyword_name}</View>
    {showClear && (
      <View className="selected-button__close at-icon at-icon-close" onClick={() => onDelete(item, item.keyword_id)} />
    )}
  </View>
}

export default SelectedItem;
