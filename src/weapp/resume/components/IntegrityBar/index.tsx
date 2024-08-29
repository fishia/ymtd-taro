import React from 'react'
import c from 'classnames'
import { AtProgress } from 'taro-ui'
import { Text, View } from '@tarojs/components'

import { IProps } from '@/def/common'
import styles from '@/assets/colors'

import './index.scss'

export interface IIntegrityBarProps extends IProps {
  integrity: number
}

const IntegrityBar: React.FC<IIntegrityBarProps> = props => {
  const { integrity, style, className } = props

  return (
    <View className={c('integrity-bar', className)} style={style}>
      <Text className="integrity-bar__text">简历完整度：</Text>
      <Text className="integrity-bar__percent">{integrity}%</Text>
      <View className="integrity-bar__progress">
        <AtProgress percent={integrity} strokeWidth={5} color={styles.primaryColor} isHidePercent />
      </View>
    </View>
  )
}

export default IntegrityBar
