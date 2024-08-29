import { View, Input, Image, Text, Button } from '@tarojs/components'
import {
  hideToast,
  navigateTo,
  setClipboardData,
  setNavigationBarTitle,
  showToast,
} from '@tarojs/taro'
import { useUpdateEffect } from 'ahooks'
import React, { useState, useMemo, useCallback, useEffect } from 'react'

import { fetchAddComQrCode, getAwardRecord, phoneBillWriteOff } from '@/apis/award'
import Badge from '@/assets/imgs/springWar/bagde.png'
import { onJumpStickyFn } from '@/components/Popup/resumeStickyPopup'
import { HR_BASE_HOST, STATIC_MP_IMAGE_HOST } from '@/config'
import { AwardType, cardResult } from '@/def/award'
import { defaultUserInfo } from '@/def/user'
import { bestEmployerByToken } from '@/hooks/custom/usePopupData'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import useShowModal, { useHideModal } from '@/hooks/custom/useShowModal'
import { useCurrentUserInfo } from '@/hooks/custom/useUser'
import MainLayout from '@/layout/MainLayout'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'
import { jumpToWebviewPage } from '@/utils/utils'
import SaveAward from '@/weapp/pages/job/components/SaveAward'

import './index.scss'

const statusMap = {
  0: '去领取',
  1: '去使用',
  2: '使用中',
  3: '已使用',
  4: '已失效',
  5: '去提现',
}
const avatarGroup = 'https://oss.yimaitongdao.com/mp/activity/dragonSpringWar/avatarGroup.png'

const Award: React.FC = () => {
  const routerParams = useRouterParam()
  const showModal = useShowModal({ mode: 'thenCatch' })
  const [detail, setDetail] = useState<cardResult[]>([])
  const userInfo = useCurrentUserInfo() || defaultUserInfo
  const [code, setCode] = useState(0)
  const isActive = Number(routerParams.isActive) ? 1 : 0

  const getAward = () => {
    getAwardRecord()
      .then(res => {
        if (res.length > 0) {
          // const mockRes = [
          //   {
          //     ...res[0],
          //     awardType: 0,
          //   },
          // ]
          setDetail(res)
        }
      })
      .catch(err => {
        if (err.code === 2) {
          setCode(err.code)
        }
      })
  }

  const clickImg = () => {
    if (code) {
      return
    }
    jumpToWebviewPage(bestEmployerByToken(`${HR_BASE_HOST}/springWar/luckyDraw/c-mini`))
  }

  useEffect(() => {
    getAward()
  }, [])

  useEffect(() => {
    if (code) {
      setNavigationBarTitle({
        title: '活动已结束',
      })
    } else if (isActive) {
      setNavigationBarTitle({
        title: '中奖记录',
      })
    }

    sendDataRangersEventWithUrl('EventPopupExpose', {
      event_name: '中奖记录',
      type: '医药人升职季',
    })
  }, [code])

  const onUse = (item: cardResult) => {
    const { status, awardType, worth } = item

    // 失效return
    if (status === 2 || status === 3 || status === 4) {
      return
    }

    if (status === 0) {
      sendDataRangersEventWithUrl('EventPopupClick', {
        event_name: '中奖记录',
        type: '医药人升职季',
        button_name: '去领取',
      })
    }

    const showWechatModal = () => {
      showModal({
        content: <SaveAward isGetAward />,
        className: 'global-empty-modal',
        title: '',
        cancelText: '',
        confirmText: '',
        closeOnClickOverlay: false,
      }).catch(err => {})
    }

    // 回复金额
    if (awardType === 0) {
      if (Number(worth) < 10) {
        showToast({
          title: '奖励金累积到10元即可提现',
          icon: 'none',
        })
      } else {
        showWechatModal()
      }
      return
    }

    if (status === 0 && !userInfo.isAddWecom) {
      showWechatModal()
      return
    }

    if (status === 0 && (awardType === 2 || awardType === 3 || awardType === 4)) {
      showWechatModal()
      return
    }

    if (awardType === 6 && userInfo.isAddWecom) {
      onJumpStickyFn()
      return
    }
    if (awardType === 5 && userInfo.isAddWecom) {
      navigateTo({
        url: item.bpsUrl,
      })
    }
  }

  const renderCard = (item: cardResult) => {
    const { title, awardName, worth, dueTime, currentPrice, oldPrice, source, awardType, status } =
      item || {}
    let disableCls = status === 3 || status === 4 ? 'disable-card' : ''

    // 50元
    if (awardType === 6) {
      return (
        <View className={`award__card ${disableCls}`} key={awardType}>
          <View className="award__card-badge">{title}</View>
          <View className="award__card-title">
            <View className="award__card-title-left">
              <View className="font28">
                ￥<Text className="font48">{worth}</Text>
              </View>
              <View className="font32">
                {awardName}
                {dueTime && <Text className="font20 grey">（有效期至：{dueTime}）</Text>}
              </View>
            </View>
            <View className="award__card-title-right">
              <View>
                券后￥<Text className="font48 springColor">{currentPrice}</Text>
              </View>
              <View className="lineThrough">￥{oldPrice}</View>
            </View>
          </View>
          <View className="award__card-line"></View>
          <View className="award__card-bottom">
            <View className="grey">来源：{source}</View>
            <Button onClick={() => onUse(item)}>{statusMap[status]}</Button>
          </View>
        </View>
      )
    }

    if (awardType === 0) {
      disableCls = Number(worth) < 10 ? 'disable-card' : disableCls

      return (
        <View className={`award__card ${disableCls}`} key={awardType}>
          <View className="award__card-badge">{title}</View>
          <View className="award__card-title">
            <View className="award__card-title-left">
              <View className="font28 worth">
                ￥<Text className="font48">{worth || 0}</Text>
                <View className="total-icon">已累积</View>
              </View>
              <View className="font32 avatar-group">
                <Image src={avatarGroup} />
                <Text className="font20 grey">等1000+人已领取成功</Text>
              </View>
            </View>
          </View>
          <View className="award__card-line"></View>
          <View className="award__card-bottom">
            <View className="grey">来源：{source}</View>
            <Button onClick={() => onUse(item)}>{statusMap[status]}</Button>
          </View>
        </View>
      )
    }

    return (
      <View className={`award__card ${disableCls}`} key={awardType}>
        <View className="award__card-badge">{title}</View>
        <View className="award__card-title">
          <View className="award__card-title-left">
            <View className="font28">
              <Text className="font48">{awardName}</Text>
            </View>
            <View className="font32">
              <Text className="font20 grey">领取有效期至：{dueTime}</Text>
            </View>
          </View>
        </View>
        <View className="award__card-line"></View>
        <View className="award__card-bottom">
          <View className="grey">来源：{source}</View>
          <Button onClick={() => onUse(item)}>{statusMap[status]}</Button>
        </View>
      </View>
    )
  }

  return (
    <MainLayout className="award">
      {detail.length ? (
        detail.map(item => {
          return renderCard(item)
        })
      ) : (
        <View className="award-empty">
          <Image
            className="award-empty-icon"
            src="https://oss.yimaitongdao.com/mp/activity/dragonSpringWar/warning.png"
          ></Image>
          <View>
            <View className="font28">您还未参与抽奖哦</View>
            <View className="font32 bold">点击活动页转盘中的“开始”按钮</View>
            <View className="font32 bold">即可抽奖</View>
          </View>
          <View>
            <Button className="award-empty-button" onClick={clickImg}>
              去抽奖
            </Button>
          </View>
        </View>
      )}
    </MainLayout>
  )
}

export default Award
