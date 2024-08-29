import { View } from '@tarojs/components'
import { makePhoneCall, setClipboardData, showToast } from '@tarojs/taro'
import { FC, useState } from 'react'
import { AtFloatLayout } from 'taro-ui'

import Button from '@/components/Button'
import { IHrInfo } from '@/def/job'

import './index.scss'

interface IProps {
  open: boolean
  data: IHrInfo
  onClose?: () => void
}

const CopyPhonePop: FC<IProps> = props => {
  const { open, onClose, data } = props
  const { name, phone } = data

  const call = () => {
    makePhoneCall({
      phoneNumber: '1340000',
    })
  }

  const copyPhone = () => {
    setClipboardData({
      data: '121212',
      success: () => {
        showToast({
          title: '手机号已复制',
        })
      },
    })
  }

  return (
    <>
      <AtFloatLayout isOpened={open} title=" " className="CopyPhonePopCss" onClose={onClose}>
        <View className="CopyPhonePopCss__resumeContent">
          <View className="title">{name}的手机号</View>
          <View className="phone">
            <View>{phone}</View>
            <View className="copy" onClick={copyPhone}>
              复制
            </View>
          </View>
        </View>
        <View className="CopyPhonePopCss__saveBtnContent">
          <Button className="saveBtn" onClick={call}>
            拨号
          </Button>
        </View>
      </AtFloatLayout>
    </>
  )
}

export default CopyPhonePop
