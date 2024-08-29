import { Text, View } from '@tarojs/components'
import c from 'classnames'
import { T } from 'ramda'
import React from 'react'

import { IOptionItem, IProps } from '@/def/common'

import { ISearchOptions } from '../..'

import './index.scss'

export interface CondFilterProps extends IProps {
  condList: IOptionItem[]
  title: string
  condName: string
  subTitle?: string
  multiLevel?: boolean
  tempFilter: Partial<ISearchOptions>
  onClick: (condName: string, cond: IOptionItem) => void
}
const CondFilter: React.FC<CondFilterProps> = props => {
  const {
    condList = [],
    title,
    subTitle,
    multiLevel = false,
    condName,
    tempFilter,
    className,
    onClick = T,
  } = props
  return (
    <View className={className}>
      <View className="job-search__filter__block-title">
        {title}
        {subTitle && <Text className="job-search__filter__block-subtitle">{subTitle}</Text>}
      </View>

      <View className="job-search__filter__block-content">
        {multiLevel
          ? condList.map(childCond => {
              let CondFilterProps: CondFilterProps = {
                condName,
                condList: childCond?.options || [],
                title: childCond.name||'',
                tempFilter,
                multiLevel: false,
                onClick,
              }
              return (
                <View key={childCond.value} className="job-search__filter__sub-cond">
                  <CondFilter {...CondFilterProps} />
                </View>
              )
            })
          : condList.map(cond => (
              <View
                onClick={() => void onClick(condName, cond)}
                key={cond.value}
                className={c(
                  'job-search__filter__item',
                  tempFilter[condName]?.includes(cond) ? 'active' : ''
                )}
              >
                {cond.label}
              </View>
            ))}
      </View>
    </View>
  )
}

export default CondFilter
