import dataRangers from '@datarangers/sdk-mp'
import { getCurrentPages } from '@tarojs/taro'
import { memoize } from 'lodash'

import store, { dispatchSetRangersData } from '@/store'

export interface IDataReport {
  landingPage: string
  channelId: string
  channelLaunch: string
  activId: string
  activName: string
  trParam1: string
  [k: string]: string | undefined
}

const dataRangersWebIdRef: Record<'current', string | undefined> = {
  current: undefined,
}

/** 初始化火山埋点 */
export function initDataRangers() {
  dataRangers.init({
    // 应用的 APP_ID
    app_id: process.env.ENV === 'development' ? 10000006 : 10000007,
    //是否开启预置事件采集
    auto_report: true,
    // 私部数据上送域名
    channel_domain: 'https://ci-collect.data-growth.ciwork.cn',
    // 是否打印 log
    log: false,
    enable_ab_test: true,
    clear_ab_cache_on_user_change: false,
  })

  dataRangers.config({
    app_name: process.env.ENV === 'development' ? 'ym_dev' : 'ym_prod',
    evtParams: { ym_platform: '小程序' },
  })
  /* 设置所有实验参数，并将其曝光 */
  setAllVarParams()
  dataRangers.send()

  dataRangers.getToken((token: any) => {
    dataRangersWebIdRef.current = token.web_id
  })
}

/** 火山埋点设置用户 ID */
export async function setDataRangersUserId(userId: string | number, timeout = 10) {
  await dataRangers.config({ user_unique_id: userId })
  await setAllVarParams()
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout)
  })
}

/** 火山埋点重设用户 ID */
export function resetDataRangersUserId() {
  dataRangers.config({ user_unique_id: dataRangersWebIdRef.current })
  setAllVarParams()
}

// 火山埋点web_id
export function getDataRangersWebId() {
  return { FinderDeviceId: dataRangersWebIdRef.current || '' }
}

/** 火山埋点上报事件 */
export function sendDataRangersEvent(eventName: string, eventBody: object = {}) {
  dataRangers.event(eventName, eventBody)
}

/** 火山埋点上报事件携带 current_url、pre_url */
export function sendDataRangersEventWithUrl(eventName: string, eventBody: object = {}) {
  const body = { ...eventBody }
  // 兼容处理 对埋点上报参数做 decodeURIComponent 处理
  Object.keys(body).forEach(_key => {
    try {
      body[_key] = decodeURIComponent(body[_key])
    } catch (e) {}
  })

  const pageStack = getCurrentPages() || []
  const currentPage = pageStack[pageStack.length - 1]
  const prePage = pageStack[pageStack.length - 2]

  dataRangers.event(
    eventName,
    Object.assign({ current_url: currentPage?.route || '', pre_url: prePage?.route || '' }, body)
  )
}

async function rawIsDataRangersCurrentInABTestGroup(abTestName: string): Promise<boolean> {
  return new Promise(
    resolve => void dataRangers.getAllVars(result => void resolve(!!result[abTestName]))
  )
}

/** 判断当前用户是否进入了某个 A/B 测试流量中 */
export const isDataRangersCurrentInABTestGroup = memoize(rawIsDataRangersCurrentInABTestGroup)

/** 火山埋点上报事件 （红包活动专用，会带上 current_url、pre_url） */
export const sendHongBaoEvent = sendDataRangersEventWithUrl

/** 简历上报事件 */
export const sendResumeEvent = sendDataRangersEventWithUrl

/* 设置实验参数进入本地数据管理 */
export function setAllVarParams() {
  dataRangers.getAllVars((data: Record<string, { val: any; vid: string }>) => {
    const params: Record<string, any> = {},
      ab_sdk_version: string[] = []
    Object.entries(data).forEach(it => {
      //曝光实验，埋点自动添加ab_sdk_version
      dataRangers.getVar(`${it[0]}`, false, _res => {})
      params[it[0]] = it[1].val
      ab_sdk_version.push(it[1].vid)
    })
    dispatchSetRangersData({
      ...params,
      ab_sdk_version: ab_sdk_version.join(','),
    })
  })
}

/* 获取实验参数 */
export function getVarParam(key) {
  return store.getState().common.rangersData[key]
}

export const isShowLoginGuide = () => {
  return true
}


/* 设置实验埋点事件ab_sdk_version */
export async function setTestAbVersion(vid) {
  return new Promise(res => {
    dataRangers.config({
      ab_sdk_version: vid,
    })
    res(undefined)
  })
}

/** 火山埋点引擎对象自身 */
export default dataRangers
