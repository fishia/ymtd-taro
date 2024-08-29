import { Image, View } from '@tarojs/components'
import { noop } from 'lodash'
import { FC, useEffect, useState } from 'react'

import Button from '@/components/Button'

import processOKPanelTipsBg from '../assets/upload-process/upload-ok.svg'
import processPanelTipsBg from '../assets/upload-process/upload-process.svg'

import '../assets/upload-process/ProcessPanel.scss'

export interface IProcessPanelProps {
  isFinished?: boolean
  onClickOK?(): void
}

const ProcessPanel: FC<IProcessPanelProps> = props => {
  const { onClickOK = noop, isFinished = false } = props

  const [processPercent, setProcessPercent] = useState(0)

  useEffect(() => {
    if (isFinished) {
      setProcessPercent(100)
      return
    }

    const setProcessFnGen = (value: number) => () => {
      if (!isFinished) {
        setProcessPercent(value)
      }
    }

    const timer1 = setTimeout(setProcessFnGen(15), 550)
    const timer2 = setTimeout(setProcessFnGen(35), 950)
    const timer3 = setTimeout(setProcessFnGen(45), 1250)
    const timer4 = setTimeout(setProcessFnGen(65), 1700)
    const timer5 = setTimeout(setProcessFnGen(80), 2300)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
    }
  }, [isFinished])

  return (
    <View className="process-panel">
      <Image
        src={isFinished ? processOKPanelTipsBg : processPanelTipsBg}
        className="process-panel__img"
      />
      <View className="process-panel__tips">
        <View className="process-panel__tips__row">{isFinished ? '解析成功' : '正在上传'}</View>
      </View>

      <View className="process-panel__process-bar">
        <View style={{ width: String(processPercent) + '%' }} className="inner"></View>
      </View>

      {isFinished ? (
        <View className="process-panel__action">
          <Button onClick={onClickOK} className="process-panel__button" round>
            返回医脉同道
          </Button>
        </View>
      ) : null}
    </View>
  )
}

export default ProcessPanel
