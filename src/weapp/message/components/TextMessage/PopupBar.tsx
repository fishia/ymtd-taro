import { FC, forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import c from 'classnames'
import { noop } from 'lodash'
import { eventCenter } from '@tarojs/taro'
import { View } from '@tarojs/components'

import { IProps } from '@/def/common'
import useModalState from '@/hooks/custom/useModalState'

import './PopupBar.scss'

export const closeAllTextMessagePopupBarEventKey = 'close_all_text_msg_popup'

export interface ITextMessagePopupBarProps extends IProps {
  onCopyClick?(): void
  onAddToCommonlyWordClick?(): void
}

export interface ITextMessagePopupBarRef {
  showPopupBar(position: 'top' | 'bottom'): void
}

export function closeAllPopupBar() {
  eventCenter.trigger(closeAllTextMessagePopupBarEventKey)
}

function TextMessagePopupBar(props: ITextMessagePopupBarProps, ref: any): ReturnType<FC> {
  const { onCopyClick = noop, onAddToCommonlyWordClick = noop, className, style } = props

  const [position, setPosition] = useState<'top' | 'bottom'>('top')
  const { active, alive, setModal } = useModalState(150)

  useEffect(() => {
    const closeFn = () => void setModal(false)
    eventCenter.on(closeAllTextMessagePopupBarEventKey, closeFn)

    return () => void eventCenter.off(closeAllTextMessagePopupBarEventKey, closeFn)
  }, [setModal])

  useImperativeHandle(ref, () => {
    return {
      showPopupBar: (displayPosition: 'top' | 'bottom') => {
        setPosition(displayPosition)
        setModal(true)
      },
    }
  })

  const copyHandler = () => {
    onCopyClick()
    setModal(false)
  }

  const addToCommonlyWordHandler = () => {
    onAddToCommonlyWordClick()
    setModal(false)
  }

  if (!alive) {
    return null
  }

  return (
    <View
      className={c('text-message-popup-bar', active ? 'active' : '', position, className)}
      style={style}
    >
      <View className="text-message-popup-bar__body">
        <View onClick={copyHandler} className="item">
          复制
        </View>
        <View onClick={addToCommonlyWordHandler} className="item">
          添加为常用语
        </View>
      </View>
      <View className={c('text-message-popup-bar__arrow', position)}></View>
    </View>
  )
}

export default forwardRef(TextMessagePopupBar)
