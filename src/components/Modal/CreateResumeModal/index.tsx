import { View, Button, Text, ITouchEvent, Image } from '@tarojs/components'
import { eventCenter, navigateTo, redirectTo } from '@tarojs/taro'
import c from 'classnames'
import React, { useEffect, useImperativeHandle, useState } from 'react'

import { IProps, ModalMode } from '@/def/common'
import { useHideModal } from '@/hooks/custom/useShowModal'

import './index.scss'

export const modalCreateResumeEventKey = 'create-resume-modal'

export interface ModalState extends IProps {
  isOpened: boolean
}

export const openCreateResumeModal = (url: string) => {
  eventCenter.trigger(modalCreateResumeEventKey, 'open', url)
}

export const closeCreateResumeModal = () => {
  eventCenter.trigger(modalCreateResumeEventKey, 'close')
}

const CreateResumeModal = (props: IProps, ref) => {
  const [visible, setVisible] = useState(false)
  const [url, setResumeUrl] = useState('')
  const { className } = props
  useImperativeHandle(ref, () => ({ open, close }))

  useEffect(() => {
    eventCenter.on(modalCreateResumeEventKey, (type, navigateUrl) => {
      if (type === 'open') {
        open()
        setResumeUrl(navigateUrl)
        return
      }

      close()
    })
  }, [])

  const open = () => {
    setVisible(true)
  }

  const close = () => {
    setVisible(false)
  }

  const goCreateResume = () => {
    navigateTo({ url })
  }
  
  return (
    <View className={c('hd-modal-create-resume', className, { 'hd-modal-create-resume--active': visible })}>
      <View className="hd-modal__overlay" />
      <View className="hd-modal__container">
        <View className="hd-modal__container-title">完成简历创建后</View>
        <View className="hd-modal__container-desc">即可投递意向职位</View>
        <Image mode="heightFix" src="https://oss.yimaitongdao.com/mp/common/create-resume-modal.png"></Image>
        <View className="hd-modal__container-text">
          现在创建可获得<Text>3</Text>倍简历推荐
        </View>
        <Button onClick={goCreateResume}>去创建简历</Button>
      </View>
    </View>
  )
}

export default React.forwardRef(CreateResumeModal)
