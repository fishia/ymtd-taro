import { OSS_STATIC_HOST } from '@/config'
import dayjs from 'dayjs'

const PublicIconUrl = OSS_STATIC_HOST + '/mp/sponsorImg/publicIcon.png'
const checkIconUrl = OSS_STATIC_HOST + '/mp/sponsorImg/checkIcon.png'
const collectIconUrl = OSS_STATIC_HOST + '/mp/sponsorImg/collectIcon.png'

export enum IteractionEnum {
  /** 收藏 */
  collect,
  /** 看过 */
  check,
  /** 新职位 */
  public,
}

// 消息前置互动三行item数据
export interface IIteractionItem {
  iteractionKey: number
  company_name: string | null
  count?: number
  iteractionTime?: string | null
}

export const nowTime = dayjs(new Date().getTime()).format('HH:mm')

export const deafultIteractionData = [{
  iteractionKey: 2, 
  company_name: "",
  count: 0,
  iteractionTime: nowTime
},{
  iteractionKey: 1, 
  company_name: "",
  count: 0,
  iteractionTime: nowTime
},{
  iteractionKey: 0, 
  company_name: "",
  count: 0,
  iteractionTime: nowTime
}]

export const getInteractionItemContent = (iteractionKey: number) => {
  const avatarImg = {
    [IteractionEnum.public]: PublicIconUrl,
    [IteractionEnum.check]: checkIconUrl,
    [IteractionEnum.collect]: collectIconUrl,
  }[iteractionKey]
  
  const noCompanyNameTip = {
    [IteractionEnum.public]: '暂无企业发布新职位',
    [IteractionEnum.check]: '暂无企业查看你',
    [IteractionEnum.collect]: '暂无企业收藏了你',
  }[iteractionKey]

  const noDataTip = {
    [IteractionEnum.public]: '今日暂无新发布的职位',
    [IteractionEnum.check]: '建议优化简历提升吸引力',
    [IteractionEnum.collect]: '主动出击可以更快求职',
  }[iteractionKey]

  const talentTag = {
    [IteractionEnum.public]: '发布了新职位',
    [IteractionEnum.check]: '查看了你',
    [IteractionEnum.collect]: '收藏了你',
  }[iteractionKey]

  const contentTip = {
    [IteractionEnum.public]: '个新职位被发布上线',
    [IteractionEnum.check]: '位招聘者查看了你的简历',
    [IteractionEnum.collect]: '位招聘者对你感兴趣',
  }[iteractionKey]

  return {
    avatarImg,
    noCompanyNameTip,
    noDataTip,
    talentTag,
    contentTip,
  }
}