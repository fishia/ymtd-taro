import { View, Image } from '@tarojs/components'
import { noop } from 'lodash'
import { FC, useCallback } from 'react'

import Button from '@/components/Button'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import errorTipsBg from '../assets/upload-process/upload-error.svg'
import largeTipsBg from '../assets/upload-process/upload-large.svg'

import '../assets/upload-process/ErrorPanel.scss'

export interface IErrorPanelProps {
  error?: string | null
  showOthers?: boolean
  onUpload?(): void
  onJumpError?(): void
}

const ErrorPanel: FC<IErrorPanelProps> = props => {
  const { error, showOthers, onUpload = noop, onJumpError = noop } = props

  const retryHandler = () => {
    reportEvent('重新上传')
    onUpload()
  }

  const othersHandler = () => {
    reportEvent('选择其他创建方式')
  }

  const reportEvent = useCallback((select_way: string) => {
    const pageStack = getCurrentPages() || []
    const currentPage = pageStack[pageStack.length - 1]
    const prePage = pageStack[pageStack.length - 2]

    sendDataRangersEventWithUrl('ReuploadClick', {
      page_name: currentPage?.config?.navigationBarTitleText || '',
      prepage_name: prePage?.config?.navigationBarTitleText || '',
      select_way,
    })
  }, [])

  const tipsBg = error?.startsWith('文件过大') ? largeTipsBg : errorTipsBg

  return (
    <View className="error-panel">
      <Image src={tipsBg} className="error-panel__img" />
      <View className="error-panel__tips">
        <View className="title">{error || '上传失败，请重试'}</View>
        <View className="sub">支持word/pdf/jpg/png格式，文件大小：20M以内</View>
      </View>

      <View className="error-panel__action">
        <Button onClick={retryHandler} className="error-panel__button upload " round>
          重新上传
        </Button>

        {showOthers ? (
          <Button
            openType="launchApp"
            appParameter=""
            onError={onJumpError}
            onClick={othersHandler}
            className="error-panel__button others"
            btnType="border"
            round
          >
            选择其他创建方式
          </Button>
        ) : null}
      </View>
    </View>
  )
}

export default ErrorPanel
