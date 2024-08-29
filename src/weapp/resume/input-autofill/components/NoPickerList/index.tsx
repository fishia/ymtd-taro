import React from 'react'
import c from 'classnames'
import { View, Text } from '@tarojs/components'
import { IProps } from '@/def/common'
import Empty from '@/components/Empty'

import unhappyImg from '@/assets/imgs/unhappy.svg'

import './index.scss'

export interface NoPickerListProps extends IProps {
  tipsText?: string
}

const NoPickerList: React.FC<NoPickerListProps> = props => {
  const { className, style, tipsText = '条目' } = props

  return (
    <View className={c(className, 'picker-no-list')} style={style}>
      <View className="picker-no-list__empty">
        <Empty
          picUrl={unhappyImg}
          text={
            <View>
              <View>暂无相应{tipsText}名称</View>
              <View>
                点击右侧<Text className="picker-no-list__strong">确定</Text>填写该{tipsText}
              </View>
            </View>
          }
        />
      </View>
    </View>
  )
}

export default NoPickerList
