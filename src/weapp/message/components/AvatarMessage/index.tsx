import { MessageDirection } from '@rongcloud/imlib-v4'
import { View, Image } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import c from 'classnames'
import React from 'react'

import { IMessageItem } from '@/def/message'
import { combineStaticUrl } from '@/utils/utils'

import './index.scss'

const AvatarMessage: React.FC<IMessageItem> = props => {
  const {
    hr_avatar,
    self_avatar,
    messageDirection,
    children,
    className,
    style,
    jd_id,
    talentPortrait,
    activityHRPortrait,
    activityUserPortrait,
  } = props

  const onShowJdDetail = () => {
    navigateTo({ url: `/weapp/job/job-detail/index?jd_id=${jd_id}` })
  }

  return (
    <View className="message-avatar">
      {messageDirection === MessageDirection.RECEIVE ? (
        <View className="message-avatar__avatar left" onClick={onShowJdDetail}>
          {activityHRPortrait && (
            <Image
              src={combineStaticUrl(activityHRPortrait)}
              className="message-avatar__avatarPendeant"
              mode="aspectFit"
            />
          )}
          <Image
            src={combineStaticUrl(hr_avatar)}
            className="message-avatar__avatar-image"
            mode="aspectFit"
          />
        </View>
      ) : null}

      <View
        className={c(
          'message-avatar__slot',
          className,
          messageDirection === MessageDirection.RECEIVE ? 'hr' : 'self'
        )}
        style={style}
      >
        {children}
      </View>

      {messageDirection === MessageDirection.SEND ? (
        <View className="message-avatar__avatar right">
          {(activityUserPortrait || talentPortrait) && (
            <Image
              src={combineStaticUrl(activityUserPortrait ? activityUserPortrait : talentPortrait)}
              className="message-avatar__pendeant"
              mode="aspectFit"
            />
          )}
          <Image
            src={combineStaticUrl(self_avatar)}
            className="message-avatar__avatar-image"
            mode="aspectFit"
          />
        </View>
      ) : null}
    </View>
  )
}

export default AvatarMessage
