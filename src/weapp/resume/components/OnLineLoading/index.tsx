import { View, Image, ITouchEvent } from '@tarojs/components'
import { noop } from 'lodash'
import { FC, useEffect, useState } from 'react'
import { AtProgress } from 'taro-ui'

import failSrc from '@/assets/imgs/MAI/failSrc.png'
import loadingSrc from '@/assets/imgs/MAI/loadingSrc.png'
import Button from '@/components/Button'

import './index.scss'

interface IProps {
  type: 'loading' | 'fail' | 'success'
  percent?: number
  onClick?: (e: ITouchEvent) => void
}

const OnLineLoading: FC<IProps> = props => {
  const { type, onClick = noop, percent = 0 } = props

  return (
    <View className="OnLineLoadingCss">
      {type === 'loading' ? (
        <>
          <Image src={loadingSrc} className="img" />
          <View className="text">简历解析中，请耐心等待</View>
          <AtProgress percent={percent} className="progress" isHidePercent color="#4256DC" />
        </>
      ) : (
        <>
          <Image src={failSrc} className="img" />
          <View className="text failText">简历解析失败，请再试一次</View>
          <Button className="refrashBtn" onClick={onClick}>
            再试一次
          </Button>
        </>
      )}
    </View>
  )
}

export default OnLineLoading
