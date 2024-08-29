import { Image, View } from '@tarojs/components'
import { useEffect, useState } from 'react'

import { fetchAddComQrCode } from '@/apis/award'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'
import { mpIsInIos } from '@/utils/utils'

import './index.scss'

const SaveAward = ({ isGetAward }: { isGetAward?: boolean }) => {
  const [qrCode, setQrCode] = useState('')

  useEffect(() => {
    fetchAddComQrCode()
      .then(res => setQrCode(res.qrCodeUrl))
      .catch()
  }, [])

  useEffect(() => {
    if (isGetAward) {
      sendDataRangersEventWithUrl('EventPopupExpose', {
        event_name: '已中奖弹窗',
        type: '医药人升职季',
      })
      return
    }
    sendDataRangersEventWithUrl('EventPopupExpose', {
      event_name: '创建简历成功',
      type: '医药人升职季',
    })
  }, [])

  const onLongPress = event_name => {
    sendDataRangersEventWithUrl('EventPopupExpose', {
      event_name: '长按后识别添加企微弹窗',
      type: '中奖记录',
    })
  }

  if (isGetAward) {
    return (
      <View className="save-award__modal">
        <View className="save-award__modal-title mb76">奖品未领取</View>
        <Image
          className="save-award__modal-img"
          src={qrCode}
          showMenuByLongpress
          onLongPress={() => onLongPress('已中奖弹窗')}
        ></Image>
        <View className="save-award__modal-sub">长按识别二维码添加小助手，即可领取奖品</View>
      </View>
    )
  }

  const awardText = mpIsInIos() ? '大健康资讯行业白皮书 ' : '50元大红包'

  return (
    <View className="save-award__modal">
      <View className="save-award__modal-title">创建简历成功</View>
      <View className="save-award__modal-sub-title">恭喜获得</View>
      <View className="save-award__modal-sub-title mb32">「 {awardText} 」</View>
      <Image
        className="save-award__modal-img"
        src={qrCode}
        showMenuByLongpress
        onLongPress={() => onLongPress('创建简历成功')}
      ></Image>
      <View className="save-award__modal-sub">长按识别二维码添加小助手，即可领取奖品</View>
    </View>
  )
}

export default SaveAward
