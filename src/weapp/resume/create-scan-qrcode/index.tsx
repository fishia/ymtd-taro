import React from 'react'
import { eventCenter, navigateBack, showToast } from '@tarojs/taro'
import { Camera, CoverView } from '@tarojs/components'

import { COMPLETE_RESUME_EVENT_KEY, CREATE_RESUME_SCAN_QECODE } from '@/config'
import { fetchQRCodeLoginApi } from '@/apis/resume'
import { checkQRCode } from '@/services/StringService'
import MainLayout from '@/layout/MainLayout'

import './index.scss'

const CreateScanQRCode: React.FC = () => {
  const scanCodeHandle = async result => {
    const qrcode = result.detail.result
    const sign = checkQRCode(qrcode)

    if (!sign) {
      showToast({ icon: 'none', title: '未知的二维码' })
      return
    }

    fetchQRCodeLoginApi(sign)
      .then(() => {
        eventCenter.trigger(COMPLETE_RESUME_EVENT_KEY, false)
        navigateBack()
      })
      .catch(err => void showToast({ icon: 'none', title: err.errorMessage || '解析二维码时出错' }))
  }

  // 部分手机（已知有华为 mate9）小程序的 camera 似乎不支持同层渲染，需要使用 cover-view 才能覆盖显示
  // 而 cover-view 的兼容性较差，它不支持单边 border 设置，且给它设置的伪元素在真机调试中很容易不显示
  // 因此，此处使用 8 个 cover-view 来显示边框四角的装饰框
  return (
    <MainLayout className="resume-scan">
      <Camera
        className="resume-scan__camera"
        onScanCode={scanCodeHandle}
        mode="scanCode"
        devicePosition="back"
        flash="off"
      ></Camera>

      <CoverView className="resume-scan__tips">在电脑浏览器中输入网址</CoverView>
      <CoverView className="resume-scan__tips">{CREATE_RESUME_SCAN_QECODE}</CoverView>
      <CoverView className="resume-scan__square">
        <CoverView className="resume-scan__square__line"></CoverView>

        <CoverView className="resume-scan__square__angle vertical top left"></CoverView>
        <CoverView className="resume-scan__square__angle vertical top right"></CoverView>
        <CoverView className="resume-scan__square__angle vertical bottom left"></CoverView>
        <CoverView className="resume-scan__square__angle vertical bottom right"></CoverView>

        <CoverView className="resume-scan__square__angle horizontal top left"></CoverView>
        <CoverView className="resume-scan__square__angle horizontal top right"></CoverView>
        <CoverView className="resume-scan__square__angle horizontal bottom left"></CoverView>
        <CoverView className="resume-scan__square__angle horizontal bottom right"></CoverView>
      </CoverView>
      <CoverView className="resume-scan__tips">将二维码放入方框中即可自动扫描</CoverView>
    </MainLayout>
  )
}

export default CreateScanQRCode
