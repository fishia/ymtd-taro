import { useEffect } from 'react'
import c from 'classnames'
import { FC, getStorageSync, setStorageSync } from '@tarojs/taro'
import { View } from '@tarojs/components'

import { IM_GREETING_WORDS_TIPS_SHOW } from '@/config'
import { IProps } from '@/def/common'
import useModalState from '@/hooks/custom/useModalState'

import './GreetingWordTips.scss'

export interface IGreetingWordTipsProps extends IProps {}

const GreetingWordTips: FC<IGreetingWordTipsProps> = props => {
  const { className, style } = props

  const { active, alive, setModal } = useModalState(150)

  useEffect(() => {
    if (getStorageSync(IM_GREETING_WORDS_TIPS_SHOW)) {
      return
    }

    setStorageSync(IM_GREETING_WORDS_TIPS_SHOW, true)
    setModal(true)

    const timer = setTimeout(() => void setModal(false), 3000)

    return () => void clearTimeout(timer)
  }, [setModal])

  if (!alive) {
    return null
  }

  return (
    <View
      className={c('greeting-word-tips', className, active ? 'show' : '', className)}
      style={style}
    >
      <View className="greeting-word-tips__body">点击该招呼语即可启用</View>
      <View className="greeting-word-tips__arrow"></View>
    </View>
  )
}

export default GreetingWordTips
