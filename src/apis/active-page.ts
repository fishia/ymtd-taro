import Client from '@/apis/client'
import {
  IActiveSearch,
  ILuckyDraw,
  IMeetingCompanyList,
  IMeetingDetail,
  IMeetingInfo,
  IJobCardProps,
  IResumeStickyTop,
  IJsApiPrepay,
  IAdsCompany
} from '@/def/active'
import { IList, IPager } from '@/def/common'
import { IJobSearch, ICampusJudge } from '@/def/job'

// 活动首页加载接口
export const getActiveList = (type: number | string) =>
  Client({ url: '/activities/fairs', data: { type } })

// 获取活动页职位列表
export const listJobsApi = (data: IJobSearch, isSale?: boolean, activeType?: number) =>
  Client({
    url: `/jds`,
    data: { ...data, type: 'es', sale_fair: isSale ? 1 : 0, sale_fair_type: activeType },
  })

// 获取活动页公司列表
export const listCompanyApi = (data: IJobSearch, isSale?: boolean, activeType?: number) =>
  Client({
    url: `/companies-fairs`,
    data: { ...data, sale_fair: isSale ? 1 : 0, sale_fair_type: activeType },
  })

//是否有抽奖机会
export const initActivity = () =>
  Client<ILuckyDraw>({ url: `/ymtd-profile/profiles/packet/initActivity` })

//获取活动链接
export const getActivityLink = () => Client({ url: `/profiles/packet/getActivityLink` })

//没兴趣
export const dismiss = () =>
  Client({ url: `/ymtd-profile/profiles/packet/dismiss`, method: 'POST' })

//是否第一次保存简历
export const firstSaveProfile = () =>
  Client({ url: `/ymtd-profile/profiles/packet/firstSaveProfile`, method: 'POST' })

// 保存简历得奖励
export const saveProfileAward = () => {
  return Client<{
    hasAward: boolean
  }>({
    url: `/ymtd-capp/dragonSpringWar/profile/rewards`, method: 'GET'
  })
}

//是否是校园版
export const isCampusApi = () => Client<ICampusJudge>({ url: `/yard/campus` })

// 获取双选会/宣讲会首页-专场列表信息
export const getActiveListApi = (params: IActiveSearch) =>
  Client<IList<IMeetingInfo>>({ url: `/yard/meet/home`, data: params, method: 'POST' })

//预约活动
export const subscribeActiveApi = (id: number | string) =>
  Client({ url: `/yard/preach/subscribe`, method: 'POST', data: { id } })

//宣讲会详情
export const preachDetailApi = (meetId: number | string) =>
  Client<IMeetingDetail>({ url: `/yard/preach/basic/${meetId}` })

//双选会详情
export const bilateralDetailApi = (meetId: number | string) =>
  Client<IMeetingDetail>({ url: `/yard/bilateral/basic/${meetId}` })

//双选会公司职位列表
export const bilateralListApi = (data?: IPager & { id: number | string }) =>
  Client<IMeetingCompanyList>({ method: 'POST', url: `/yard/bilateral/list`, data })

// 双选会详情职位列表信息
export interface IActiveJobCard extends IJobCardProps {}
export const bilateralJDListApi = (data?: IPager & { id: number | string }) =>
  Client<IActiveJobCard>({ method: 'POST', url: `/yard/bilateral/jdList`, data })

/** 简历置顶服务介绍 */
export const fetchRSTIntroduceApi = (): Promise<IResumeStickyTop> =>
  Client({ method: 'GET', url: `/ymtd-capp/commercialize/profileTop/introduce` })

// 简历置顶支付API
export const fetchJsApiPrepayApi = (): Promise<IJsApiPrepay> =>
  Client({ method: 'POST', url: `/ymtd-capp/commercialize/profileTop/jsApiPrepay` })

/** 推广公司列表 */
export const fetchCompanyListApi = (id:number,v?:number): Promise<Array<IAdsCompany>> =>
  Client({
    method: 'POST',
    url: `/ymtd-capp/api/yard/bilateral/companyList`,
    data: { id,v },
  })

/** 一键登录至禾蛙 */
export const fetchLoginToHewaApi = (): Promise<{
  hewaToken: string;
  miniAppId: string;
  miniRoute: string;
}> => {
  return Client({
    method: 'POST',
    url: '/ymtd-capp/hewa/loginToHewa'
  })
}