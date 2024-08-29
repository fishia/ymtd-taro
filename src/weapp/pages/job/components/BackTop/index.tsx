import React from 'react'
import c from 'classnames'
import _ from 'lodash'
import { View } from '@tarojs/components'

import { IProps } from '@/def/common'
import { useIsLogin } from '@/hooks/custom/useUser'

import './index.scss'

export interface IBackTopProps extends IProps {
  onClick?(): void
  visible?: boolean
}

const BackTop: React.FC<IBackTopProps> = props => {
  const { visible = false, onClick = _.noop, className, style } = props
  const isLogin = useIsLogin()

  return (
    <View
      className={c(
        'job-index__back-top',
        { 'job-index__back-top--visible': visible, 'job-index__back-top--logined': isLogin },
        className
      )}
      style={style}
    >
      <View onClick={onClick} className="icon iconfont iconfanhuidingbu" />
    </View>
  )
}

export default BackTop
