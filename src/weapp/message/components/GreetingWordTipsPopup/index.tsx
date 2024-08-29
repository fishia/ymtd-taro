import { FC, useEffect } from 'react'
import { getStorageSync, navigateTo, setStorageSync } from '@tarojs/taro'
import { Image, View } from '@tarojs/components'
import c from 'classnames'

import { IM_GREETING_WORDS_MODAL_SHOW } from '@/config'
import { IProps } from '@/def/common'
import useModalState from '@/hooks/custom/useModalState'
import Button from '@/components/Button'

import tipsImage from './tips-image.png'
import './index.scss'

export interface IGreetingWordTipsPopupProps extends IProps {}

const GreetingWordTipsPopup: FC<IGreetingWordTipsPopupProps> = props => {
  const { className, style } = props

  const { active, alive, setModal } = useModalState(250)

  useEffect(() => {
    const hasShow = getStorageSync(IM_GREETING_WORDS_MODAL_SHOW)
    if (hasShow) {
      return
    }

    setTimeout(() => {
      setStorageSync(IM_GREETING_WORDS_MODAL_SHOW, true)
      setModal(true)
    }, 50)
  }, [setModal])

  const closeHandler = () => {
    setModal(false)
  }

  const confirmHandler = () => {
    setModal(false)
    navigateTo({ url: '/weapp/message/greeting-word/index' })
  }

  if (!alive) {
    return null
  }

  return (
    <View className={c('greeting-word-tips-popup', className)} style={style}>
      <View className={c('greeting-word-tips-popup__body', active ? 'active' : '')}>
        <View className="greeting-word-tips-popup__title">聊天的招呼语支持自定义了</View>
        <View className="greeting-word-tips-popup__tips">随心设置，更容易提高求职效果</View>

        <View className="greeting-word-tips-popup__content">
          <View className="greeting-word-tips-popup__bubble">
            <View className="greeting-word-tips-popup__bubble-arrow"></View>
            例子：你好，我是医脉同道的医药代表，现在正积极求职医药代表，看到你的招聘需求与我的背景经验等很匹配，可以进一步交流一下吗？
          </View>
          <Image className="greeting-word-tips-popup__image" src={tipsImage} />
        </View>

        <View className="greeting-word-tips-popup__action">
          <Button
            onClick={confirmHandler}
            btnType="primary"
            className="greeting-word-tips-popup__button"
          >
            去设置
          </Button>
        </View>

        <View
          className={c('greeting-word-tips-popup__close at-icon at-icon-close')}
          onClick={closeHandler}
        ></View>
      </View>

      <View
        className={c('greeting-word-tips-popup__mask', active ? 'active' : '')}
        catchMove
      ></View>
    </View>
  )
}

export default GreetingWordTipsPopup
