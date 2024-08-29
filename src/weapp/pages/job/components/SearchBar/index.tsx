import { View } from '@tarojs/components'
import c from 'classnames'
import _ from 'lodash'
import React from 'react'

import { IJobNavigationProps } from '../JobNavgation'

import './index.scss'

export interface ISearchBarProps extends IJobNavigationProps {
  onClick?(): void
}

const SearchBar: React.FC<ISearchBarProps> = props => {
  const { onClick = _.noop, className, style } = props
  const prefixCls = 'job-index__search-bar'
  return (
    <View className={c(prefixCls, className)} style={style}>
      <View
        className={c(`${prefixCls}__inputWrapper`, {
          [`${prefixCls}__border`]: false,
        })}
      >
        <View
          onClick={onClick}
          className={c(
            { [`${prefixCls}__input`]: false },
            { [`${prefixCls}__gradientInput`]: true }
          )}
        >
          <View className={`${prefixCls}__icon  at-icon iconfont icona-sousuo2`} />
          搜索职位、公司
        </View>
      </View>
    </View>
  )
}

export default SearchBar
