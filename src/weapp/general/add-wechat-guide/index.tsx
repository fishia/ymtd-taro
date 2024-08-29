import { Input, View } from '@tarojs/components'
import { getMenuButtonBoundingClientRect, navigateBack, showToast } from '@tarojs/taro'
import { useEffect, useState } from 'react'

import { saveWechatApi } from '@/apis/message'
import { isSchoolVersion } from '@/services/AccountService'
import { checkWechat } from '@/services/ValidateService'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import './index.scss'

const pageHeadTop = getMenuButtonBoundingClientRect().bottom + 'px'

const AddWechatGuide = () => {
  const [wechat, setWechat] = useState('')

  useEffect(() => {
    sendDataRangersEventWithUrl('EventPopupExpose', {
      event_name: '还没填写微信号',
      type: '弹窗',
    })
  }, [])

  const onSubmit = () => {
    sendDataRangersEventWithUrl('EventPopupClick', {
      event_name: '还没填写微信号',
      type: '弹窗',
    })
    if (!wechat) {
      showToast({ title: `请先输入你的微信号`, icon: 'none' })
      return
    }
    if (checkWechat(wechat)) {
      saveWechatApi(wechat).then(() => {
        showToast({ title: `微信号保存成功` })
        sendDataRangersEventWithUrl('SaveWechat', {
          way_name: '还没填写微信号',
          user_role: isSchoolVersion() ? '学生' : '职场人',
        })
        navigateBack()
      })
    } else {
      showToast({ title: `微信号不支持中文汉字`, icon: 'none' })
    }
  }

  return (
    <View className="add-wechat-guide" style={{ padding: `${pageHeadTop} 56rpx 0 56rpx` }}>
      <View className="add-wechat-guide__jump" onClick={() => navigateBack()}>
        跳过
      </View>
      <View className="add-wechat-guide__title">还没填写微信号？</View>
      <View className="add-wechat-guide__desc">填写后容易获得招聘者的青睐</View>
      <View className="add-wechat-guide__tips">80%的求职者已填写微信号</View>
      <Input
        maxlength={20}
        onInput={e => setWechat(e.detail.value.trim())}
        placeholder="请输入你的微信号"
        className="add-wechat-guide__input"
      />
      <View className="add-wechat-guide__button" onClick={onSubmit}>
        确定
      </View>
    </View>
  )
}

export default AddWechatGuide
