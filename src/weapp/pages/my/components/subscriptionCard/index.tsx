import React, { useState } from 'react'
import c from 'classnames'
import _ from 'lodash'
import { View } from '@tarojs/components'

import './index.scss'

export interface ISubscriptionCardProps {
  title?: string | React.ReactNode
  tipText?: string | React.ReactNode
  primaryButtonText?: string
  primaryButtonSingle?: boolean
  subButtonText?: string
  onPrimaryButtonClick?(): void
  onSubButtonClick?(): void
  className?: string
  showClear?: boolean
}

const SubscriptionCard: React.FC<ISubscriptionCardProps> = props => {
  const [hidden, setHidden] = useState<boolean>(false)
  const {
    title,
    primaryButtonText = '去开启',
    subButtonText,
    onPrimaryButtonClick = _.noop,
    onSubButtonClick = _.noop,
    tipText,
    primaryButtonSingle = false,
    className,
    showClear = false
  } = props

  const onCloseHandler = () => {
    setHidden(true)
    onSubButtonClick && onSubButtonClick()
  }
  return (
    <View className={c("subscription_card", className, { 'dis-n': hidden })}>
      <View className="subscription_card__body">
        <View className="subscription_card__title">{title}</View>
        <View className="subscription_card__content">{tipText}</View>
        <View className="subscription_card__action">
          {subButtonText ? (
            <View onClick={onCloseHandler} className="subscription_card__button sub">
              {subButtonText}
            </View>
          ) : null}
          <View
            onClick={onPrimaryButtonClick}
            className={c(
              'subscription_card__button primary',
              primaryButtonSingle ? 'hl' : ''
            )}
          >
            {primaryButtonText}
          </View>
        </View>
        {showClear && (
          <View
            className="icon close iconfont  iconclose"
            onClick={onCloseHandler}
          />
        )}
      </View>
    </View>
  )
}

export default SubscriptionCard
