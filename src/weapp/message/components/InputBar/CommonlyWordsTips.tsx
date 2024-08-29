import React, { useEffect } from 'react'
import c from 'classnames'
import { getStorageSync, setStorageSync } from '@tarojs/taro'
import { View } from '@tarojs/components'

import { IM_COMMONLY_WORDS_TIPS_SHOW, IM_GREETING_WORDS_MODAL_SHOW } from '@/config'
import { IProps } from '@/def/common'
import useModalState from '@/hooks/custom/useModalState'

import './CommonlyWordsTips.scss'

export interface ICommonlyWordsTipsProps extends IProps {}

const CommonlyWordsTips: React.FC<ICommonlyWordsTipsProps> = props => {
  const { className, style } = props

  const { active, alive, setModal } = useModalState(150)

  useEffect(() => {
    // 第一次应弹出招呼语的弹窗，而不弹出本 tips
    const hasShowModal = getStorageSync(IM_GREETING_WORDS_MODAL_SHOW)
    if (!hasShowModal) {
      return
    }

    const hasShow = getStorageSync(IM_COMMONLY_WORDS_TIPS_SHOW)
    if (hasShow) {
      return
    }

    setModal(true)

    const timer = setTimeout(() => {
      setStorageSync(IM_COMMONLY_WORDS_TIPS_SHOW, true)
      setModal(false)
    }, 3000)

    return () => void clearTimeout(timer)
  }, [setModal])

  if (!alive) {
    return null
  }

  return (
    <View className={c('commonly-words-tips', active ? 'show' : '', className)} style={style}>
      <View className="commonly-words-tips__body">可自定义常用语，避免重复输入</View>
      <View className="commonly-words-tips__arrow"></View>
    </View>
  )
}

export default CommonlyWordsTips
