import { View } from '@tarojs/components'
import { getStorageSync } from '@tarojs/taro'
import c from 'classnames'
import _ from 'lodash'
import React from 'react'

import { APP_TOKEN_FLAG } from '@/config'
import { IProps } from '@/def/common'
import { IntentWorkTypeEnum, IResumeIntentInfo } from '@/def/resume'

import './index.scss'

export interface IntentionInfoBlockProps extends IProps {
  intentList: IResumeIntentInfo[]
  current?: number
  sticky?: boolean
  onClick?(id: number, index: number): void
  onEditClick?(): void
}
const IntentionInfoBlock: React.FC<IntentionInfoBlockProps> = props => {
  const {
    intentList = [],
    sticky = false,
    current = 0,
    onClick = _.noop,
    onEditClick,
    style,
  } = props

  const isLogined = getStorageSync(APP_TOKEN_FLAG)

  return (
    <View className={c('intention-block', { sticky: sticky })} style={style}>
      <View className="intention-block_wrapper">
        <View className="intention-block_expect_positions">
          {intentList.map((item, i) => {
            return (
              <View
                className={c('intention-block_expect_position', {
                  'intention-block_selected': current === i,
                })}
                key={i}
                onClick={() => {
                  //showToast({ content: item.expectPositionName })
                  onClick(item.id, i)
                }}
              >
                {item.expectPositionName}
                {item.cityName &&
                  intentList.filter(o => o.expectPositionName === item.expectPositionName).length >
                    1 && <View className="intention-block_badge">{item.cityName}</View>}
              </View>
            )
          })}
        </View>
        {isLogined && intentList.length < 3 && (
          <View className="intention-block__icon" onClick={onEditClick}>
            +
          </View>
        )}
      </View>
    </View>
  )
}

export default IntentionInfoBlock
