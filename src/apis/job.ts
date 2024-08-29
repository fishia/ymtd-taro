import Client from '@/apis/client'
import { transformJobData } from '@/components/JobCard/transformJobData'
import { ILocation, IPager } from '@/def/common'
import {
  IJobSearch,
  IBanner,
  IZoneIcon,
  IZoneJobList,
  IJobList,
  ICompantRelatedList,
  ICompany,
  IJob,
  IHrInfo,
  ICompanyJobsSearch,
  IGreetingMapItem,
  IChoiseList,
} from '@/def/job'
import { IntentWorkTypeEnum } from '@/def/resume'
import appStore from '@/store'
import { trimParams } from '@/utils/utils'

// 获取热门搜索
export const getHotJobsApi = () =>
  Client({ url: '/ymtd-capp/guess/list' }).then(data => {
    return data
  })

// 关键词联想
export const getThinkApi = (keyword: string, client = 'mini', cityFilter?: ILocation) =>
  Client({
    url: '/ymtd-capp/api/searches/auto-completion',
    data: { keyword, client, ...trimParams(cityFilter) },
  }).then(res => (res || []).slice(0, 6))

// 搜索职位
export const listJobSearchApi = (data: IJobSearch) => {
  return Client<IJobList>({
    url: '/ymtd-capp/jds/search',
    data: { ...data, type: 'es' },
    reportAddTags: ['core', 'jobs'],
  })
}

// 首页推荐职位
export const listRecommandJobsApi = (data: IJobSearch) =>
  Client<IJobList>({
    url: '/ymtd-capp/jds/references',
    data: { ...data, type: 'es' },
    reportAddTags: ['core', 'jobs'],
  })

// 首页热门职位、冷启动
export const listHotJobsApi = (data: IJobSearch) => {
  // if (!appStore.getState().user && data.page! > 1) {
  //   return Promise.resolve({
  //     list: [],
  //     current: data.page,
  //     total: 20,
  //   })
  // }

  return Client<IJobList>({
    url: '/ymtd-position/jds/hots',
    data: { ...data, type: 'es' },
    reportAddTags: ['core', 'jobs'],
  }).then(res => {
    // if (!appStore.getState().user) {
    //   return { ...res, total: 20 }
    // }

    return res
  })
}

interface IRecommendNoLoginParams {
  jobType?: IntentWorkTypeEnum
  expectPosition?: number
  intentCityId?: number
  expectSalaryTo?: number
  expectSalaryFrom?: number
}

// 没登录下根据本地暂存求职意向推荐职位列表接口
export const fetchRecommendNoLogin = (data: IRecommendNoLoginParams) => {
  return Client<IJobList>({
    url: '/ymtd-capp/jds/references/no-login',
    data: {
      ...data,
      page: 1,
      pageSize: 10,
    },
    method: 'POST',
  }).then(res => {
    return { ...res, total: 10 }
  })
}

// 相似职位
export const listSimilarJobsApi = (id: number, params: IJobSearch) =>
  Client<IJobList>({ url: `/jds/${id}/similar-jds`, data: params }).then(res => {
    if (!appStore.getState().user) {
      return { ...res, list: (res.list || []).slice(0, 3), total: 3 }
    }

    return res
  })

// 搜索相关公司
export const listRelatedApi = (data: IJobSearch) =>
  Client<ICompantRelatedList>({ url: '/ymtd-capp/api/h5/searchCompanies', method: 'POST', data })

// 公司详情
export const detailCompanyApi = (id: number) => Client<ICompany>({ url: `/companies/${id}` })

// 获取公司职位
export const listCompanyJobsApi = (id: number, params: ICompanyJobsSearch) =>
  Client<IJobList>({ url: `/companies/${id}/jds`, data: params })

// 职位详情
export const detailJobApi = (id: number, hrId?: string) =>
  Client<IJob>({
    url: `/jds/${id}`,
    data: {
      hrId: hrId || '',
    },
  })

// 投递职位
export const applyJobApi = (jobId: number, profile_id: string) =>
  Client({ url: `/jds/${jobId}/apply`, method: 'PUT', data: { profile_id, type: 1 } })

// 订阅投递进展反馈通知
export const subscribeApplyJobNoticeApi = (templateId: string[]) =>
  Client({ url: '/auth/subscribe', method: 'PUT', data: { template_ids: templateId } })

// 接受职位邀请
export const applyRecommendJobApi = (jobId: number) =>
  Client<void>({ url: `/jds/${jobId}/accept`, method: 'POST' })

// 收藏职位 jobId
export const favoriteJobApi = (id: number) =>
  Client({ url: '/objects/jd/collect', method: 'POST', data: { id } })

// 取消收藏职位 jobId
export const deleteFavoriteApi = (id: number) =>
  Client({ url: `/objects/jd/collect/${id}`, method: 'DELETE' })

// 搜索职位过滤性
export const getJobFiltersApi = () =>
  Client({ url: '/ymtd-capp/api/sys/filter-options', cacheKey: 'com.ymtd.m.cache.job_filters' })

// 获取职位页banner列表，26是校园版
export const getJobBannerList = (id?: number) =>
  Client<IBanner[]>({ url: `/banners${id ? `/${id}` : ''}` })

// 获取首页专区位,school是否开启校园版
export const getZonesIconList = (school?: boolean) =>
  Client<IZoneIcon[]>({ url: `/zones`, data: { v: school ? 0 : '' } })

// 获取专区职位列表
export const listZoneJobsApi = (id: number, data: IJobSearch) =>
  Client<IZoneJobList>({
    url: `/ymtd-capp/app/jd/zone`,
    method: 'POST',
    data: { ...data, zones: id },
  })

// 收藏公司 companyId
export const favoriteCompanyApi = (id: number) =>
  Client({ url: '/objects/company/collect', method: 'POST', data: { id } })

// 取消收藏公司 companyId
export const deleteFavoriteCompanyApi = (id: number) =>
  Client({ url: `/objects/company/collect/${id}`, method: 'DELETE' })

// 分享职位
export const shareJobApi = (id: string) => Client({ url: `/share/jd-card?jd_id=${id}` })

// 职位生成分享卡片
export const generatorJobCardsApi = (id: string, avatar?: string, nickname?: string) =>
  Client({ url: `/share/jd?avatar=${avatar || ''}&jd_id=${id}&nickname=${nickname || ''}` })

// 分享公司
export const shareCompanyApi = (id: string) =>
  Client({ url: `/share/company-card?company_id=${id}` })

// 职位生成分享卡片
export const generatorCompanyCardsApi = (id: string, avatar?: string, nickname?: string) =>
  Client({
    url: `/share/company?avatar=${avatar || ''}&company_id=${id}&nickname=${nickname || ''}`,
  })

// 批量分享职位
export const batchShareCompanyApi = (id: number) =>
  Client({ url: `/share/jd-card-batch?share_id=${id}` })

// 批量职位生成分享卡片
export const batchGeneratorCompanyCardsApi = (share_id, avatar?: string, nickname?: string) =>
  Client({
    url: `/share/jd-batch?share_id=${share_id}&avatar=${avatar || ''}&nickname=${nickname || ''}`,
  })

// hr详情
export const detailHrInfoApi = (id: number) => Client<IHrInfo>({ url: `/hrs/${id}` })

// hr在招职位列表
export const listHrJobsApi = (id: number | string, params: IPager) =>
  Client<IJobList>({ url: `/hrs/${id}/jds`, data: params })

// 品牌雇主互动是否在线
export const fetchBestEmployerisValid = () =>
  Client({ url: '/ymtd-bapp/activity/bestEmployer/isValid', method: 'POST' })

// 每日精选 or 相似精选职位
export const listQualityPositionListApi = (jdId?: string | number) =>
  Client<IJob[]>({
    url: '/ymtd-capp/jds/highPriorityReference',
    data: { jdId },
    method: 'POST',
  }).then(res => res.map(transformJobData))

// 一键投递
export const batchApplyPositionApi = (
  chatInitList: { jdId: number; targetUserId: number }[],
  sendProfile: boolean
) =>
  Client({
    url: '/ymtd-capp/im/batchInitChat',
    data: { chatInitList, sendProfile },
    method: 'POST',
  })

// 品牌雇主保存加油包
export const saveCheerApi = () =>
  Client({ url: '/ymtd-bapp/activity/bestEmployer/saveCheer', method: 'POST' }).then(res => {
    if (res?.success) return res?.state || 0
  })

// 拉取指定职位的外置招呼语
export const fetchGreetingWordsApi = (jdId: number | string) =>
  Client<IGreetingMapItem[]>({
    url: '/ymtd-capp/app/jd/searchGreet',
    method: 'POST',
    data: { jdId },
  }).then((data: any) => data.jdGreetMap)

// 对我感兴趣
export const likeMeListApi = (data: IJobSearch) =>
  Client<IJobList>({
    url: '/ymtd-capp/interact/likeMeList',
    data: { ...data, pageSize: 10 },
    method: 'POST',
  })

//看过我列表
export const lookMeLisAtApi = (data: IJobSearch) =>
  Client<IJobList>({
    url: '/ymtd-capp/interact/lookMeListA',
    data: { ...data, pageSize: 10 },
    method: 'POST',
  })
//看过我列表
export const lookMeListBApi = (data: IJobSearch) =>
  Client<IJobList>({
    url: '/ymtd-capp/interact/lookMeListB',
    data: { ...data, pageSize: 10 },
    method: 'POST',
  })

//看过我列表
export const newJdTabApi = (data: IJobSearch) =>
  Client<IJobList>({
    url: '/ymtd-capp/interact/newJdTab',
    data: { ...data, pageSize: 10 },
    method: 'POST',
  })

//推荐职位卡片数据
export const fetchtRecommendPosition = (jdId: number, limit?: number) =>
  Client<any>({
    url: '/ymtd-capp/promote/getRecommendPositionForApplet', ///ymtd-capp/promote/getRecommendPosition
    data: { jdId, limit: limit || 3 },
    method: 'POST',
  })

// 聚合榜单
export const jdAggregateZone = () =>
  Client<IChoiseList[]>({ url: `/ymtd-capp/app/jd/jdAggregateZone` })
