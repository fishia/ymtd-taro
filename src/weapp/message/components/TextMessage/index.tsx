import { MessageDirection } from '@rongcloud/imlib-v4'
import { View } from '@tarojs/components'
import { createSelectorQuery, setClipboardData } from '@tarojs/taro'
import c from 'classnames'
import React, { useRef } from 'react'

import { addCommonlyWordApi } from '@/apis/message'
import { MessageSendFailedReasons, IMessageItem, IVerifyNotice, MessageType } from '@/def/message'
import useToast from '@/hooks/custom/useToast'
import { useCommonlyWords } from '@/hooks/message'
import { messageVerifyFaildTips } from '@/services/IMService'
import { dispatchAddCommonlyWord } from '@/store'

import AvatarMessage from '../AvatarMessage'
import VerifyExchangePhoneTips from '../VerifyExcahngePhoneTips'
import PopupBar, { closeAllPopupBar, ITextMessagePopupBarRef } from './PopupBar'

import './index.scss'

export type ITextMessageContent = {
  content: string
}

export interface ITextMessageProps extends IMessageItem {
  messageType: MessageType.TEXT_MESSAGE
  content: ITextMessageContent
  isReceipt?: boolean
  sendFailedVerityNotice?: IVerifyNotice
}

const TextMessage: React.FC<ITextMessageProps> = props => {
  const { messageUId, content, isReceipt = false, messageDirection, sendFailedVerityNotice } = props

  const showToast = useToast()
  const commonlyWords = useCommonlyWords()

  const showPhoneTips =
    sendFailedVerityNotice &&
    sendFailedVerityNotice.content.type === MessageSendFailedReasons.INCLUDE_CONTACT

  const classWithUid = 'message-item__text-' + messageUId

  const popupBarRef = useRef<ITextMessagePopupBarRef>()

  const longPressHandler = () => {
    closeAllPopupBar()
    createSelectorQuery()
      .select('.' + classWithUid)
      .boundingClientRect()
      .exec(result => {
        const messageCardRect = result[0]
        if ((messageCardRect?.top || 0) < 170) {
          popupBarRef.current?.showPopupBar('bottom')
        } else {
          popupBarRef.current?.showPopupBar('top')
        }
      })
  }

  const popupCopyHandler = () => {
    setClipboardData({ data: content.content || '' })
  }

  const popupAddCommonlyWordHandler = () => {
    if (commonlyWords.length >= 20) {
      showToast({ content: '常用语已达上限' })
      return
    }

    addCommonlyWordApi(content.content)
      .then(res => {
        showToast({ content: '添加成功' })
        dispatchAddCommonlyWord(res)
      })
      .catch(error => {
        console.log('error=', error)
        showToast({ content: error.errorMessage || '添加失败' })
      })
  }

  return (
    <>
      <AvatarMessage
        {...props}
        className={c('message-item__text', classWithUid, { 'show-phone-tips': showPhoneTips })}
      >
        {!sendFailedVerityNotice && messageDirection === MessageDirection.SEND ? (
          <View className="message-item__text__tag">
            {isReceipt ? (
              <View className="message-item__text__receipt read">已读</View>
            ) : (
              <View className="message-item__text__receipt unread">未读</View>
            )}
          </View>
        ) : null}

        <View className="message-item__text__body">
          <View onLongPress={longPressHandler} className="message-item__text__content">
            {sendFailedVerityNotice ? (
              <View className="message-item__text__receipt error">!</View>
            ) : null}
            {content.content}
          </View>

          {sendFailedVerityNotice ? (
            <View className="message-item__text__fail-reason">
              {messageVerifyFaildTips(sendFailedVerityNotice)}
            </View>
          ) : null}

          <PopupBar
            onCopyClick={popupCopyHandler}
            onAddToCommonlyWordClick={popupAddCommonlyWordHandler}
            ref={popupBarRef}
          />
        </View>
      </AvatarMessage>

      {showPhoneTips ? <VerifyExchangePhoneTips {...props} /> : null}
    </>
  )
}

export default TextMessage
