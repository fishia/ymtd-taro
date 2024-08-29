import { Image, View } from '@tarojs/components'
import React, { useEffect } from 'react'
import './index.scss'
import { navigateToMiniProgram } from '@tarojs/taro'
import { sendDataRangersEvent } from '@/utils/dataRangers'
import Button from '@/components/Button'
import { fetchLoginToHewaApi } from '@/apis/active-page'
import { HEWA_TOC_APPID } from '@/config'

const HewaActive: React.FC = () => {
  useEffect(() => {
    sendDataRangersEvent('predefine_pageview', {
      event_name: 'C兼职禾蛙顾问'
    })
  }, [])

  const onGotoHewa = () => {
    sendDataRangersEvent('predefine_pageview_Batton', {
      event_name: 'C兼职禾蛙顾问'
    })
    fetchLoginToHewaApi()
      .then((res) => {
        const { miniRoute } = res;

        navigateToMiniProgram({
          appId: HEWA_TOC_APPID,
          path: miniRoute,
          envVersion: 'trial',
          success: () => {
            sendDataRangersEvent('Mini_Program_Jump', {
              event_name: 'C兼职禾蛙顾问'
            })
          }
        })
      })
    
  }

  return (
    <View className="ym-to-hewa">
      <Image src="https://oss.yimaitongdao.com/mp/activity/hewa/hewa.png" mode="widthFix" />
      <View className="footer">
        <Button onClick={onGotoHewa}>
          点击按钮参与活动
        </Button>
      </View>
    </View>
  ) 
}

export default HewaActive
