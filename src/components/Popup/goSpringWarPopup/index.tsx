import { Image, Text, View } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'

import { fetchDragonSpringWarActivityInfo, fetchDragonSpringWarCanDraw } from '@/apis/award'
import Button from '@/components/Button'
import { HR_BASE_HOST } from '@/config'
import { defaultUserInfo } from '@/def/user'
import useOnce from '@/hooks/custom/useOnce'
import { bestEmployerByToken } from '@/hooks/custom/usePopupData'
import useShowModal, { useHideModal } from '@/hooks/custom/useShowModal'
import { useCurrentUserInfo } from '@/hooks/custom/useUser'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'
import { jumpToWebviewPage } from '@/utils/utils'

import './index.scss'

export const goSpringPage = () => {
  jumpToWebviewPage(bestEmployerByToken(`${HR_BASE_HOST}/springWar/luckyDraw/c-mini`))
}

export const useSpringWarPopup = () => {
  const showModal = useShowModal()
  const close = useHideModal()
  const userInfo = useCurrentUserInfo() || defaultUserInfo
  const { needShow, setCurrentTips } = useOnce('isshow-get-spring-ward-pop-once')

  const onGoSpringPage = () => {
    sendDataRangersEventWithUrl('EventPopupClick', {
      event_name: '投递成功获得抽奖资格',
      type: '医药人升职季',
      button_name: '去抽奖',
    })
    close()
    goSpringPage()
  }

  const renderGoDraw = () => {
    return (
      <View className="spring-war-popup__go-draw">
        <View className="spring-war-popup__go-draw__button" onClick={onGoSpringPage}></View>
      </View>
    )
  }

  const onClose = () => {
    sendDataRangersEventWithUrl('EventPopupClick', {
      event_name: '投递成功获得抽奖资格',
      type: '医药人升职季',
      button_name: '我知道了',
    })

    close()
  }

  const renderGoSpringWarContent = (needCount: number, count: number) => {
    return (
      <View className="spring-war-popup__underway">
        <View className="spring-war-popup__underway__title">投递成功</View>
        <Image src="https://oss.yimaitongdao.com/mp/activity/dragonSpringWar/question-round.png" />
        <View className="spring-war-popup__underway__body">
          <View>
            <View className="text">今日再投递{needCount}个职位即可参与抽奖</View>
            <View>
              最高<Text className="bold">1888元</Text>现金等你来拿
            </View>
          </View>
          <View className="grey">
            已有<Text className="bold">{count}</Text>个求职者参与抽奖
          </View>
        </View>
        <Button className="button" onClick={() => onClose()}>
          我知道了
        </Button>
      </View>
    )
  }

  const checkAndShowSpringModal = async (chat_id?: number) => {
    if (userInfo.stage !== 1 || !needShow) {
      return Promise.resolve()
    }
    try {
      const res = await fetchDragonSpringWarCanDraw(chat_id)

      if (res.isDraw) {
        return Promise.resolve()
      }

      sendDataRangersEventWithUrl('EventPopupExpose', {
        event_name: '投递成功获得抽奖资格',
        type: '医药人升职季',
      })

      const content = res.isCan
        ? renderGoDraw()
        : renderGoSpringWarContent(res.needDeliver, res.joinCount)

      if (res.isCan) {
        setCurrentTips()
      }

      showModal({
        content,
        className: 'global-empty-modal',
        title: '',
        cancelText: '',
        confirmText: '',
        closeOnClickOverlay: false,
      })

      return Promise.resolve(true)
    } catch (error) {
      console.log(error)
      return Promise.reject(error)
    }
  }

  return { checkAndShowSpringModal }
}
