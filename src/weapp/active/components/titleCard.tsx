import React from 'react'
import { View } from '@tarojs/components'
import { AggregationsProps } from '@/def/active'

import '../index.scss'

interface IProps {
  aggregations?: AggregationsProps
}

const TitleCard: React.FC<IProps> = props => {
  const { aggregations } = props

  return (
    <View className="data-statistic">
      <View className="statistic-cell">
        <View className="statistic-cell-warp">
          <View className="statistic-num">{aggregations?.companies}</View>
          <View className="statistic-summary">参与企业</View>
        </View>
      </View>
      <View className="statistic-cell">
        <View className="statistic-cell-warp">
          <View className="statistic-num">{aggregations?.jds}</View>
          <View className="statistic-summary">招聘职位</View>
        </View>
      </View>
      <View className="statistic-cell">
        <View className="statistic-cell-warp">
          <View className="statistic-num">{aggregations?.hits}</View>
          <View className="statistic-summary">参与人次</View>
        </View>
      </View>
    </View>
  )
}

export default TitleCard
