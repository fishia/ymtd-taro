import { View, Image } from '@tarojs/components'
import { noop } from 'lodash'
import { FC } from 'react'

import Button from '@/components/Button'

import errorTipsBg from '../assets/upload-process/upload-error.svg'
import largeTipsBg from '../assets/upload-process/upload-large.svg'

import '../assets/upload-process/ErrorPanel.scss'

export interface IErrorPanelProps {
  error?: string | null
  showOthers?: boolean
  onRetry?(): void
  onOther?(): void
}

const ErrorPanel: FC<IErrorPanelProps> = props => {
  const { error, showOthers, onRetry = noop, onOther = noop } = props

  const tipsBg = error?.startsWith('文件过大') ? largeTipsBg : errorTipsBg

  return (
    <View className="error-panel">
      <Image src={tipsBg} className="error-panel__img" />
      <View className="error-panel__tips">
        <View className="title">{error || '上传失败，请重试'}</View>
        <View className="sub">支持word/pdf/jpg/png格式，文件大小：20M以内</View>
      </View>

      <View className="error-panel__action">
        <Button onClick={onRetry} className="error-panel__button upload " round>
          重新上传
        </Button>

        {showOthers ? (
          <Button onClick={onOther} className="error-panel__button others" btnType="border" round>
            选择其他创建方式
          </Button>
        ) : null}
      </View>
    </View>
  )
}

export default ErrorPanel
