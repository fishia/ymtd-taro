import { View } from '@tarojs/components'
import { navigateTo, setClipboardData, showToast } from '@tarojs/taro'
import c from 'classnames'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import { fetchChattingWechatNumberApi } from '@/apis/message'
import Button from '@/components/Button'
import { IProps } from '@/def/common'
import useModalState from '@/hooks/custom/useModalState'

import './index.scss'

export interface ICopyWechatPopupProps extends IProps {
  chat_id: number
  name?: string
}
export interface ICopyWechatPopupRef {
  show(): void
}

const CopyWechatPopup = (props: ICopyWechatPopupProps, ref: any) => {
  const { chat_id, name, className, style } = props

  const { active, alive, setModal } = useModalState(250)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [wechatNumber, setWechatNumber] = useState<string>('')

  useEffect(() => {
    if (alive)
      fetchChattingWechatNumberApi(chat_id)
        .then(setWechatNumber)
        .then(() => void setIsLoading(false))
  }, [alive, chat_id])

  useImperativeHandle<any, ICopyWechatPopupRef>(ref, () => ({
    show: openHandler,
  }))

  const openHandler = () => {
    setTimeout(() => setModal(true), 50)
  }

  const closeHandler = () => {
    setModal(false)
  }

  const confirmHandler = () => {
    setClipboardData({
      data: wechatNumber,
      success: () => {
        showToast({
          title: '微信号已复制',
        })
      },
    })

    setModal(false)
  }

  if (!alive) {
    return null
  }

  return (
    <View className={c('copy-wechat-popup', className)} style={style}>
      <View className={c('copy-wechat-popup__body', active ? 'active' : '')}>
        <View className="copy-wechat-popup__tips">{name}的微信号</View>

        <View className="copy-wechat-popup__content">{isLoading ? '加载中' : wechatNumber}</View>

        <View className="copy-wechat-popup__action">
          <Button onClick={confirmHandler} btnType="primary" className="copy-wechat-popup__button">
            复制
          </Button>
        </View>

        <View
          className={c('copy-wechat-popup__close at-icon at-icon-close')}
          onClick={closeHandler}
        ></View>
      </View>

      <View className={c('copy-wechat-popup__mask', active ? 'active' : '')} catchMove></View>
    </View>
  )
}

export default forwardRef<ICopyWechatPopupRef, ICopyWechatPopupProps>(CopyWechatPopup)
