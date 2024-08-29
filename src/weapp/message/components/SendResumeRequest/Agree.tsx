import { MessageDirection } from '@rongcloud/imlib-v4'
import { Text, View } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import React from 'react'

import NotificationMessage, { INotificationMessageProps } from '../NotificationMessage'

const AgreeSendResume: React.FC<INotificationMessageProps> = props => {
  const { messageDirection, jd_name } = props

  const isSendByHr = messageDirection === MessageDirection.RECEIVE

  return (
    <>
      {isSendByHr ? (
        <NotificationMessage
          {...props}
          className="message-item__exchange-resume__argee-tip"
          content={{ message: '对方已同意接收简历' }}
        />
      ) : null}
      <NotificationMessage
        {...props}
        content={{
          message: (
            <View>
              我已投递职位-{jd_name}，请查看
              <Text
                style={{ color: '#436EF3' }}
                onClick={() => {
                  navigateTo({
                    url: '/weapp/resume/index/index',
                  })
                }}
              >
                简历详情
              </Text>
            </View>
          ),
          strong: true,
        }}
      />
    </>
  )
}

export default AgreeSendResume
