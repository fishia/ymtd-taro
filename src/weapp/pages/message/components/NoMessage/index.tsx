import { Image, View } from '@tarojs/components'
import c from 'classnames'
import { noop } from 'lodash'
import React, { useEffect, useState } from 'react'
import { eventCenter } from '@tarojs/taro'

import Button from '@/components/Button'
import Empty from '@/components/Empty'
import LoginButton from '@/components/LoginButton'
import { STATIC_MP_IMAGE_HOST } from '@/config'
import { IProps } from '@/def/common'
import { useIsLogin } from '@/hooks/custom/useUser'
import { isShowLoginGuide, sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import './index.scss'

export interface NoMessageProps extends IProps {
  onButtonClick?(): void
  isLoading?: boolean
}

const NoMessage: React.FC<NoMessageProps> = props => {
  const { className, style, isLoading = false, onButtonClick = noop } = props
  const [isShowResumeStickyAd, setIsShowResumeStickyAd] = useState<boolean>(false)
  const isLogined = useIsLogin()

  const sendRangersData = {
    type: "查看HR消息",
    page_name: "消息页"
  }

  useEffect(() => {
    eventCenter.on('isShowResumeStickyAdKey',
      (status: boolean) => {
        console.log('status', status)
        setIsShowResumeStickyAd(status)
      }
    )

    return () => {
      eventCenter.off('isShowResumeStickyAdKey')
    }
  }, [])

  if (!isLogined && isShowLoginGuide()) {
    sendDataRangersEventWithUrl("register_and_login_Expose", {event_name: "注册登录引导", ...sendRangersData})
    return (
      <View className={c(className, 'message-no-message', { 'message-no-message-center': !isLogined && !isShowResumeStickyAd })} style={style}>
        <View className="message-no-message__no__login__tips">看看哪些招聘方给你发了消息</View>
        <Image
          className="message-no-message__no__login__tips__image"
          src="https://oss.yimaitongdao.com/mp/common/message_login_tips.png"
        ></Image>
        <LoginButton
          className="message-no-message__no__login__tips__image__button"
          sendRangersData={{button_name: "登录查看", ...sendRangersData}}
          confirmText="请先完成登录并创建简历后方可查看消息"
        >
          登录查看
        </LoginButton>
      </View>
    )
  }

  return (
    <View className={c(className, 'message-no-message', {'message-no-message-center': !isLogined})} style={style}>
      <View className="message-no-message__empty">
        <Empty
          picUrl={STATIC_MP_IMAGE_HOST + 'no-message.png'}
          text={isLoading ? '加载消息中...' : '暂无消息，您可以查看职位发起沟通'}
        />
        {isLoading ? null : (
          <Button className="message-no-message__button" onClick={onButtonClick}>
            查看职位
          </Button>
        )}
      </View>
    </View>
  )
}

export default NoMessage
