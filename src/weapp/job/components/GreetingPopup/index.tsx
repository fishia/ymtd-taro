import { Image, View } from '@tarojs/components'
import c from 'classnames'
import { noop } from 'lodash'
import { useRef } from 'react'

import ScrollView from '@/components/ScrollView'
import { IProps } from '@/def/common'
import { IGreetingMapItem } from '@/def/job'

import openIcon from './open.svg'
import sendIcon from './send.svg'

import './index.scss'

const shortDisplayText = '一键发送'
const longDisplayText = '一键发送招呼语, 更快收到招聘者的回复哦'
const defaultOnSend = () => Promise.resolve(false)

export enum GreetingPopupStatusEnum {
  DEFAULT = 'long',
  SHORT = 'short',
  OPEN = 'open',
  HIDE = 'hide',
}

export interface IGreetingPopup extends IProps {
  status: GreetingPopupStatusEnum
  profileGreetMap: IGreetingMapItem[]
  onSend?(sendItem: IGreetingMapItem): Promise<boolean>
  onStatusChange?(newStatus: GreetingPopupStatusEnum): void
  moreBottomOffset?: boolean
}

export default function GreetingPopup(props: IGreetingPopup) {
  const {
    status,
    profileGreetMap,
    onSend = defaultOnSend,
    onStatusChange = noop,
    moreBottomOffset = false,
    className,
    style,
  } = props

  const pendingRef = useRef(false)

  const wrapClickHandler = (e: any) => {
    e.preventDefault()
    e.stopPropagation()

    onStatusChange(GreetingPopupStatusEnum.OPEN)
  }

  const itemClickHandler = async (item: IGreetingMapItem) => {
    if (pendingRef.current) {
      return
    }

    pendingRef.current = true
    const success = await onSend(item)
    if (success) {
      onStatusChange(GreetingPopupStatusEnum.HIDE)
    }
    pendingRef.current = false
  }

  if ((profileGreetMap || []).length <= 0 || status === GreetingPopupStatusEnum.HIDE) {
    return null
  }

  return (
    <View
      className={c('greeting-popup', className, moreBottomOffset ? 'more-bottom-offset' : '')}
      style={style}
    >
      <View onClick={wrapClickHandler} className={c('greeting-popup__wrapper', status)}>
        {status !== GreetingPopupStatusEnum.OPEN ? (
          <>
            {status === GreetingPopupStatusEnum.DEFAULT
              ? longDisplayText
              : status === GreetingPopupStatusEnum.SHORT
              ? shortDisplayText
              : null}

            <Image src={openIcon} className="greeting-popup__icon" />
          </>
        ) : (
          <View className="greeting-popup__open">
            <View className="greeting-popup__title">发送以下招呼，能更快收到招聘者的回复</View>
            <ScrollView className="greeting-popup__scroll" showScrollbar={false} scrollY>
              <View>
                {profileGreetMap.map(item => (
                  <View
                    className="greeting-popup__item"
                    hoverClass="hover"
                    onClick={() => void itemClickHandler(item)}
                    key={item.index}
                  >
                    <View className="greeting-popup__item-text">{item.content}</View>
                    <Image className="greeting-popup__item-send" src={sendIcon} />
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  )
}
