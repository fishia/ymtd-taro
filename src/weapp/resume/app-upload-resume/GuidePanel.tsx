import { Image, Swiper, SwiperItem, View } from '@tarojs/components'
import { noop } from 'lodash'
import { FC } from 'react'

import Button from '@/components/Button'

import step1Bg from '../assets/upload-process/step1.png'
import step2Bg from '../assets/upload-process/step2.png'
import step3Bg from '../assets/upload-process/step3.png'

import './GuidePanel.scss'
import './font.css'

export interface IGuidePanelProps {
  onUpload?(): void
}

const GuidePanel: FC<IGuidePanelProps> = props => {
  const { onUpload = noop } = props

  return (
    <View className="guide-panel">
      <Swiper
        className="guide-panel__step-container"
        indicatorActiveColor="#4256DC"
        indicatorColor="#E2E4EE"
        indicatorDots
      >
        <SwiperItem className="guide-panel__step-panel">
          <View className="guide-panel__step-badge">STEP1</View>
          <View className="guide-panel__step-title">选择微信文件目录</View>
          <Image className="guide-panel__step-bg" src={step1Bg} />
        </SwiperItem>
        <SwiperItem className="guide-panel__step-panel">
          <View className="guide-panel__step-badge">STEP2</View>
          <View className="guide-panel__step-title">选择文件</View>
          <Image className="guide-panel__step-bg" src={step2Bg} />
        </SwiperItem>
        <SwiperItem className="guide-panel__step-panel">
          <View className="guide-panel__step-badge">STEP3</View>
          <View className="guide-panel__step-title">上传成功</View>
          <Image className="guide-panel__step-bg" src={step3Bg} />
        </SwiperItem>
      </Swiper>

      <View className="guide-panel__action">
        <Button onClick={onUpload} className="guide-panel__button" round>
          上传微信简历
        </Button>
      </View>
    </View>
  )
}

export default GuidePanel
