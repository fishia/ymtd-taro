import { View, Image } from '@tarojs/components'
import { navigateTo, switchTab } from '@tarojs/taro'
import { useEffect, useState } from 'react'

import { getAwardRecord } from '@/apis/award'
import { jdAggregateZone } from '@/apis/job'
import { YMTD_OSS_STATIC_HOST } from '@/config'
import { MaiCardType, MaiSourceType } from '@/def/MAI'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import { useAsync } from '@/hooks/sideEffects/useAsync'
import MainLayout from '@/layout/MainLayout'
import { sendDataRangersEventWithUrl, sendHongBaoEvent } from '@/utils/dataRangers'
import { jsonToUrl } from '@/utils/utils'

import { robotAvatar } from '../components/ChatItem'

import '../chat/index.scss'

export enum AwardType {
  '1888xjhb',
  'calendar',
  'cash',
  'book',
  'bps',
  '50topJob',
}
export interface IChatCard {
  type?: MaiCardType
  awardType?: AwardType
}
interface AwardInfo {
  text: string
  url: string
}

const MAIOSS = `${YMTD_OSS_STATIC_HOST}/mp/MAI/`

const AwardList: Record<AwardType, AwardInfo> = {
  [AwardType['1888xjhb']]: { text: '1888元现金红包', url: '1888Cash.png' },
  [AwardType['50topJob']]: { text: '50元简历置顶兑换券', url: 'topJob.png' },
  [AwardType['bps']]: { text: '大健康白皮书', url: 'bps.png' },
  [AwardType['book']]: { text: '定制笔记本', url: 'book.png' },
  [AwardType['calendar']]: { text: '定制台历', url: 'calendar.png' },
  [AwardType['cash']]: { text: '8.8元开门红包', url: 'cash.png' },
}
interface IMAIMessageDisplay {
  imgUrl: string
  title?: string|React.ReactDOM
  onClick?: (key:any) => void
}

// MAI卡片类型（除了领奖单独设置）
const MaiMessageMap:Record<MaiCardType,IMAIMessageDisplay> = {
  [MaiCardType.APPLY_RESUME]: {
    imgUrl: `${MAIOSS}applyResume.png`,
    onClick: () => {
      switchTab({
        url: '/weapp/pages/message/index',
      })
    }
  },
  [MaiCardType.QUALITY_POSITION]: {
    imgUrl: `${MAIOSS}qualityPosition.png`,
    onClick: (tabList:any) => {
      const params = {
        type: 14,
        choiceList: JSON.stringify(tabList),
      }

      sendHongBaoEvent('tipsclick', {
        tips_name: 'MAI聚合卡片',
      })

      navigateTo({
        url: `/weapp/job/job-choiceness/index?${jsonToUrl(params)}`,
      })
    }
  },
  [MaiCardType.AVOCATION_CARD]: {
    imgUrl: `${MAIOSS}qualityPosition.png`,
    onClick: () => {
      switchTab({
        // 加企微
        url: '/weapp/general/infoStation/index',
      })
    }
  },
}

const ChatCard = props => {
  const routerParams = useRouterParam()
  const { type } = routerParams
  const [awardType, setAwardType] = useState<number[]>([])
  const { value: tabList } = useAsync(() => {
    return jdAggregateZone()
  }, [])

  useEffect(() => {
    sendDataRangersEventWithUrl('EventPopupExpose', {
      event_name: '医药人升职季',
      type: 'M.AI',
    })
    getAwardRecord().then(res => {
      let arr = res.filter(item => item.awardType)
      if (arr?.length > 0) {
        setAwardType([arr[0].awardType - 1])
      }
    })
  }, [])

  const onPopEvent = (text = '去回复') => {
    sendDataRangersEventWithUrl('Button_click', {
      button_type: text,
      page_name: 'M.AI_IM页',
      platform: 'mp',
    })
  }

  const MAIMessageItem = MaiMessageMap[type]
  return (
    <MainLayout className="MAIchat">
      <View className="MAIchat__message__content-wrapper">
        {MAIMessageItem ? (
          <View className="chat-message robot">
            <Image className="avatar" src={robotAvatar} />
            <View className="message-content">
              <View>
                <Image
                  className="message-content-card-fullImage"
                  src={MAIMessageItem.imgUrl}
                  onClick={() => {
                    onPopEvent()
                    MAIMessageItem.onClick(tabList)
                  }}
                />
              </View>
            </View>
          </View>
        ) : null}
        {type === MaiSourceType.RECEIVE_AWARD
          ? awardType?.map(item => (
              <View className="chat-message robot" key={item}>
                <Image className="avatar" src={robotAvatar} />
                <View className="message-content">
                  <View className="message-content-card">
                    <View>
                      <View className="message-content-card-title">{AwardList[item]?.text}</View>
                      <Image
                        className="message-content-card-image"
                        src={`${MAIOSS}${AwardList[item]?.url}`}
                      />
                      <View className="message-content-card-text">添加客服，即可领取奖品</View>
                      <Image
                        className="message-content-card-button"
                        src={`${MAIOSS}receiveAward_btn.png`}
                        onClick={() => {
                          onPopEvent('去领取')
                          // 去情报局
                          navigateTo({
                            url: '/weapp/general/infoStation/index',
                          })
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))
          : null}
      </View>
    </MainLayout>
  )
}

export default ChatCard
