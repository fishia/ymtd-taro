import Client from '@/apis/client'
import { cardResult } from '@/def/award'

// 活动首页加载接口
export const getAwardRecord = () =>
  Client<cardResult[]>({ url: '/ymtd-capp/dragonSpringWar/awardRecord' })

// 话费核销
export const phoneBillWriteOff = (phone: string) =>
  Client<boolean>({
    url: `/ymtd-capp/app/springWar/phoneBillWriteOff`,
    data: {
      phone,
    },
    method: 'POST',
  })

// 还要抽几次才能获奖
export const fetchDragonSpringWarCanDraw = (chat_id?: number) =>
  Client<{
    isCan: boolean,
    needDeliver: number
    joinCount: number
    isDraw: boolean
  }>({
    url: `/ymtd-capp/dragonSpringWar/canDraw?chatId=${chat_id || ''}`,
    method: 'GET',
  })

// 龙年春战活动详情
export const fetchDragonSpringWarActivityInfo  = () => {
  return Client<{
    joinCount: number,
    redPacketCount: number
  }>({
    url: '/ymtd-capp/dragonSpringWar/activityInfo',
    method: 'GET',
  })
}

// 获取企微信息
export const fetchAddComQrCode  = () => {
  return Client<{
    qrCodeUrl: string,
  }>({
    url: '/ymtd-capp/dragonSpringWar/wework/info',
    method: 'GET',
  })
}

// 获取企微公共接口
export const fetchComQrCode  = (path?:string) => {
  return Client<{
    value: string,
  }>({
    url: `/ymtd-bapp/activity/common/resource/${path}`,
    method: 'GET',
  })
}
