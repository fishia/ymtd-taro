import { Image, View } from '@tarojs/components'
import c from 'classnames'
import _ from 'lodash'
import React, { CSSProperties } from 'react'

import './index.scss'

export interface IRequestCardMessageProps {
  tipText: string | React.ReactNode
  primaryButtonText: string
  primaryButtonHighlight?: boolean
  hasSubButton?: boolean
  showBadge?: boolean
  badgeUrl?: string
  subButtonText?: string
  badgeStyle?:CSSProperties
  strongType?: 'sub' | 'primary'
  onPrimaryButtonClick?(): void
  onSubButtonClick?(): void
}

const RequestCardMessage: React.FC<IRequestCardMessageProps> = props => {
  const {
    primaryButtonText,
    subButtonText,
    strongType: strongText,
    onPrimaryButtonClick = _.noop,
    onSubButtonClick = _.noop,
    tipText,
    hasSubButton = true,
    showBadge = false,
    primaryButtonHighlight = true,
    badgeUrl = 'redPacketBadge.png',
    badgeStyle = {}
  } = props

  return (
    <View className="message-item__request">
      <View className="message-item__request__body">
        <View className="message-item__request__content">{tipText}</View>
        <View
          className="message-item__request__action"
          style={showBadge ? { paddingTop: '45rpx' } : {}}
        >
          {hasSubButton ? (
            <View
              onClick={onSubButtonClick}
              className={c('message-item__request__button sub', {
                border: strongText === 'sub',
                disabled: strongText && strongText !== 'sub',
              })}
            >
              {subButtonText}
            </View>
          ) : null}
          <View
            onClick={onPrimaryButtonClick}
            className={c(
              'message-item__request__button primary',
              primaryButtonHighlight ? 'hl' : '',
              { border: strongText === 'primary', disabled: strongText && strongText !== 'primary' }
            )}
          >
            {primaryButtonText}
            {showBadge && (
              <Image
                src={`https://kr-ymtd.oss-cn-beijing.aliyuncs.com/mp/MAI/${badgeUrl}`}
                className="badge"
                style={badgeStyle}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

export default RequestCardMessage
