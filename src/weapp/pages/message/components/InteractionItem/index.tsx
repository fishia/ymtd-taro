import { View, Text, Image } from '@tarojs/components'
import c from 'classnames'
import _ from 'lodash'
import React, { useMemo } from 'react'

import { IProps } from '@/def/common'

import { IIteractionItem, getInteractionItemContent } from './const'

import './index.scss'

export interface IInteractionItemProps extends IIteractionItem, IProps {
  onClick?(): void
}

const InteractionItem: React.FC<IInteractionItemProps> = props => {
  const { iteractionKey, company_name, count, iteractionTime, className, style, onClick } = props

  const {
    avatarImg = '',
    noCompanyNameTip,
    noDataTip,
    talentTag,
    contentTip,
  } = getInteractionItemContent(iteractionKey)

  const countStr = useMemo(() => {
    if (count && count > 99) {
      return '超过99'
    }
    return `有${count}`
  }, [count])

  if (!count) {
    return null
  }

  return (
    <View
      className={c('message-interaction', className)}
      hoverClass="message-interaction--hover"
      hoverStayTime={300}
      style={style}
      onClick={onClick}
    >
      <View className="message-interaction__head">
        <Image className="message-interaction__avatar" mode="aspectFit" src={avatarImg} />
      </View>
      <View className="message-interaction__body">
        <View className="message-interaction__meta">
          <Text className="message-interaction__name">
            {count ? company_name : noCompanyNameTip}
          </Text>
          <Text className="message-interaction__company">{count ? talentTag : ''}</Text>
          {iteractionTime ? (
            <Text className="message-interaction__date">{iteractionTime}</Text>
          ) : null}
        </View>
        <View className="message-interaction__content">
          {count ? `${countStr}${contentTip}` : noDataTip}
        </View>
      </View>
    </View>
  )
}

export default InteractionItem
