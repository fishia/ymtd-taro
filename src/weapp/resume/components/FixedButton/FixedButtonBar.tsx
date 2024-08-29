import React from 'react'
import c from 'classnames'
import { View } from '@tarojs/components'

import { IProps } from '@/def/common'

import './index.scss'

const ButtonFixBar: React.FC<IProps> = ({ className, style, children }) => {
  return (
    <View style={style} className={c('resume-fixed-button-bar resume-fixed-button', className)}>
      {children}
    </View>
  )
}

export default ButtonFixBar
