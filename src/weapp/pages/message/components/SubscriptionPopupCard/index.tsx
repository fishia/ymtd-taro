import React from 'react'
import c from 'classnames'
import _ from 'lodash'
import { View, Image } from '@tarojs/components'

import { ISubscriptionCardProps } from '@/weapp/pages/my/components/subscriptionCard'
import './index.scss'

export interface ISubscriptionPopupCardProps extends ISubscriptionCardProps {
  picUrl?: string
  children?: string | React.ReactNode
}

const SubscriptionPopupCard: React.FC<ISubscriptionPopupCardProps> = props => {
  const {
    title = '新消息提醒',
    primaryButtonText = '去开启',
    subButtonText,
    onPrimaryButtonClick = _.noop,
    onSubButtonClick = _.noop,
    tipText = '需关注微信公众号才能开启发送新消息提醒，请您手动开启',
    className,
    picUrl,
    children
  } = props

  return (
    <View className={c("subscription_popup__card", className)}>
      <View className="subscription_popup__card__body">
        <View className="subscription_popup__card__title">{title}</View>
        <View className="subscription_popup__card__content">{tipText}</View>
        {picUrl && <Image className="subscription_popup__card__image" src={picUrl} mode="scaleToFill" />}
        {
          children ? children : null
        }
        <View className="subscription_popup__card__action">
          {subButtonText ? (
            <View onClick={onSubButtonClick} className="subscription_popup__card__button sub">
              {subButtonText}
            </View>
          ) : null}
          <View
            onClick={onPrimaryButtonClick}
            className={c(
              'subscription_popup__card__button primary'
            )}
          >
            {primaryButtonText}
          </View>
        </View>
      </View>
    </View>
  )
}

export default SubscriptionPopupCard
