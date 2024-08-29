import { View } from '@tarojs/components'
import { eventCenter, getStorageSync, setStorageSync } from '@tarojs/taro'
import c from 'classnames'
import { forwardRef, useImperativeHandle, useState } from 'react'

import Button from '@/components/Button'
import { CHAT_CONFIRM_POPUP_CHOOSE_STORAGE_KEY } from '@/config'
import { IProps } from '@/def/common'
import useModalState from '@/hooks/custom/useModalState'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import './index.scss'

type confirmResult = 'chatAndSend' | 'chatOnly'

export function getLastConfirmType(): confirmResult | undefined {
  return getStorageSync(CHAT_CONFIRM_POPUP_CHOOSE_STORAGE_KEY)
}

export interface IChatConfirmPopupProps extends IProps {}

export interface IChatConfirmPopupRef {
  showConfirm(reportData?: object): Promise<confirmResult>
}

const chatConfirmPopupEventKey = 'chat_confirm_popup'

const ChatConfirmPopup = forwardRef<IChatConfirmPopupRef, IChatConfirmPopupProps>((props, ref) => {
  const { className, style } = props

  const { active, alive, setModal } = useModalState(300)
  const [value, setValue] = useState<confirmResult>('chatAndSend')

  useImperativeHandle<any, IChatConfirmPopupRef>(ref, () => ({
    async showConfirm(reportData?: object) {
      const lastChoice = getLastConfirmType()
      if (lastChoice) {
        return Promise.resolve(lastChoice)
      }

      return new Promise(resolve => {
        setModal(true)
        eventCenter.once(chatConfirmPopupEventKey, result => {
          sendDataRangersEventWithUrl('GreetSendSelect', {
            is_cv_send: result === 'chatAndSend' ? '是' : '否',
            ...reportData,
          })
          resolve(result)
        })
      })
    },
  }))

  const confirmHandler = () => {
    eventCenter.trigger(chatConfirmPopupEventKey, value)
    setStorageSync(CHAT_CONFIRM_POPUP_CHOOSE_STORAGE_KEY, value)
    setModal(false)
  }

  if (!alive) {
    return null
  }

  return (
    <View className={c('chat-confirm-popup-mask', active ? 'active' : '')} catchMove>
      <View className={c('chat-confirm-popup', className, active ? 'active' : '')} style={style}>
        <View
          onClick={() => void setValue('chatAndSend')}
          className={c('chat-confirm-popup__item', value === 'chatAndSend' ? 'active' : '')}
        >
          打招呼同时发送简历
        </View>
        <View
          onClick={() => void setValue('chatOnly')}
          className={c('chat-confirm-popup__item', value === 'chatOnly' ? 'active' : '')}
        >
          仅打招呼，不发送简历
        </View>
        <View className="chat-confirm-popup__action">
          <Button
            className="chat-confirm-popup__button"
            btnType="primary"
            onClick={confirmHandler}
            round
          >
            确定
          </Button>
        </View>
      </View>
    </View>
  )
})

export default ChatConfirmPopup
