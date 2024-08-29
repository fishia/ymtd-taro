import React from 'react'
import { View } from '@tarojs/components'
import { ICurrentKeyword } from '@/def/resume'
import SelectedItem from '../SelectedButton'
import './index.scss'

export interface ISelectedListProps {
  list: ICurrentKeyword[]
  limit?: number
  onDelete: (singleItem: ICurrentKeyword) => void
}

const SelectedList: React.FC<ISelectedListProps> = props => {
  const { list = [], limit = 5, onDelete } = props;
  return <View className="selected__multi-bar">
    <View className="selected__multi-bar__tip">
      已选 {list.length}/{limit}
    </View>
    <View className="selected__multi-bar__list">
      {
        list.map((item, i) => <SelectedItem {...{ item, onDelete }} key={i} />)
      }
    </View>
  </View>
}

export default SelectedList;
