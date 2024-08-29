import { View, Text } from '@tarojs/components'
import { navigateBack } from '@tarojs/taro'
import { FC } from 'react'

import { MaiSourceTypeData } from '@/def/MAI'
import { senceData } from '@/hooks/message/maiSocket'

import { ItemProps } from '../ChatItem'

import './index.scss'

const clickContent = {
  color: '#4256DC',
}

export const ChatCard: FC<ItemProps> = props => {
  const { extraContent, content } = props

  return (
    <View className="message-text">
      <View className="message-title">{extraContent?.title}</View>

      {extraContent.scene === senceData.PROFILE ? (
        <>
          {extraContent?.subTitle}
          <View className="message-subContent">{content}</View>
        </>
      ) : (
        <>{content}</>
      )}
    </View>
  )
}

export const TextCard: FC<ItemProps> = props => {
  const { type, content, showEdit, role } = props

  const click = e => {
    navigateBack()
  }

  return (
    <Text className="message-text" user-select>
      {MaiSourceTypeData[type]?.clickContent ? (
        <>
          点这里可
          <Text onClick={click} style={clickContent}>
            {MaiSourceTypeData[type]?.clickContent}
          </Text>
        </>
      ) : (
        <>
          <>{content}</>
          <>{showEdit && role === 'assistant' && <Text className="icon iconfont iconMAIedit" />}</>
        </>
      )}
    </Text>
  )
}
