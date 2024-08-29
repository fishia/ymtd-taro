import React from 'react'
import { View } from '@tarojs/components'
import c from 'classnames'
import { IProps } from '@/def/common'
import './index.scss'

export interface AddIntentButtonProps extends IProps {
  text?: string
  onClick?: () => void
}

const AddIntentButton: React.FC<AddIntentButtonProps> = props => {
  const {
    text = '继续添加求职意向',
    className,
    onClick
  } = props


  return (
    <View className={c('add-intent-button', className)} onClick={onClick}>
      <View className="icon iconfont icontianjia1 add-intent-button__icon" />
      {text}
    </View>
  )
}

export default AddIntentButton
