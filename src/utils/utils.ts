import Taro, { navigateTo, showToast, switchTab } from '@tarojs/taro'
import _ from 'lodash'

import routerConfig from '@/app.config'
import { STATIC_HOST, DEFAULT_MALE_AVATAR, DEFAULT_FEMALE_AVATAR } from '@/config'
import { IJobDetailParams } from '@/def/job'

/**
 * 拼接图片等静态资源地址
 * @param url 相对路径
 * @returns 完整路径
 */
export function combineStaticUrl(urlStr: string = '') {
  const url = urlStr || ''
  if (url.startsWith('http') || url === DEFAULT_MALE_AVATAR || url === DEFAULT_FEMALE_AVATAR) {
    return url
  }

  if (STATIC_HOST.endsWith('/') && url.startsWith('/')) {
    return STATIC_HOST + url.slice(1)
  } else if (!STATIC_HOST.endsWith('/') && !url.startsWith('/')) {
    return STATIC_HOST + '/' + url
  }

  return STATIC_HOST + url
}

export function isWeapp() {
  return process.env.TARO_ENV === 'weapp'
}

export function isH5() {
  return process.env.TARO_ENV === 'h5'
}

//序列化数据
export function jsonToUrl(jsonData) {
  // 过滤掉值为 '' || undefined || null || 及空数组 的对象属性
  const postData = _.isObject(jsonData) ? trimParams(jsonData, false) : {}
  let params = ''
  for (let i in postData) {
    params += `&${i}=${postData[i]}`
  }
  return encodeURI(params.slice(1))
}

// 去除空数据
export function trimParams(params, isCity = true) {
  return _.pickBy(params, function (value: any) {
    let commonFilter =
      value !== '' && value !== undefined && value !== null && value.toString().length
    return isCity ? commonFilter && value > 0 : commonFilter
  })
}

export const isTabBar = (url: string) => {
  return routerConfig.tabBar.list.some(item => url && url.includes(item.pagePath))
}

const mapOldPath = {
  '/pages/position': '/weapp/pages/job/index', //首页
  '/pages/center': '/weapp/pages/my/index', //我的
  '/pages/tabResume': '/weapp/resume/index/index', //简历
  '/pages/article': '/weapp/pages/discover/index', //发现
  '/pages/resume/index': '/weapp/resume/index/index', //简历
  '/packageA/relatedPos': '/weapp/job/job-batch-share/index', //职位批量分享
  '/packageA/posDesc': '/weapp/job/job-detail/index', //职位详情页
  '/packageA/comDesc': '/weapp/job/company-index/index', // 公司详情页
  '/packageA/resume-competition': '/weapp/resume/resume-competition/index', //简历大赛页
  '/packageA/activePage': '/weapp/active/index', //招聘会活动首页
  '/pages/positionTypeList': '/weapp/job/job-zones/index', //专区页
  '/pages/webViewBridge': '/weapp/general/webview/index', //Webview 页
  '/packageA/articleDetail': '/weapp/discover/discover-detail/index', //文章详情页
  '/packageA/deliverRecord': '/weapp/my/record/index', //投递记录页
  '/packageA/aboutUs': '/weapp/my/cooperation/index', //商务合作页
  '/packageA/resumePk': '/weapp/resume/resume-competition/index', //简略简历大赛路径，公众号配置路由不超过32字符
}

// 旧小程序路由匹配转化
export function translateOldRoute(path: string, query) {
  const pagePath = path.startsWith('/') ? path : '/' + path

  if (mapOldPath[pagePath]) {
    return `${mapOldPath[pagePath]}?${jsonToUrl(query)}`
  } else if (process.env.TARO_ENV === 'h5') {
    return '/h5/error/index'
  } else {
    return '/weapp/general/error/index'
  }
}

// 匹配跳转新、旧小程序页面
export function linkToURL(url): string {
  if (url) {
    let path = _.split(url, '?')[0].startsWith('/')
        ? _.split(url, '?')[0]
        : '/' + _.split(url, '?')[0],
      queryList = _.split(url, '?')[1]?.match(/([^\?&]+)=([^&]+)/g) || [],
      query = queryList.reduce((total, item) => {
        //@ts-ignore
        total[item.split('=')[0]] = item.split('=')[1]
        return total
        //@ts-ignore
      }, {})
    //区分旧小程序，新小程序
    if (mapOldPath[path]) {
      return translateOldRoute(path, query)
    } else {
      return url
    }
  } else {
    throw new Error('linkToURL 需要一个 url 参数')
  }
}

export function jumpOldUrl(oldUrl: string) {
  const url = linkToURL(oldUrl)

  if (isTabBar(url)) {
    switchTab({ url })
  } else {
    navigateTo({ url })
  }
}

export function jumpToWebviewPage(url: string, title?: string) {
  navigateTo({
    url:
      `/weapp/general/webview/index?url=${encodeURIComponent(url)}` +
      (title ? `&title=${encodeURIComponent(title || ' ')}` : ''),
  })
}

//数字精确四舍五入保留几位小数
export function formatFloat(src, pos) {
  return Math.round(src * Math.pow(10, pos)) / Math.pow(10, pos)
}

//banner、首页弹窗匹配类型跳转
export function jumpToUrlByLinkType(item) {
  // 1、链接 3、小程序 因为运营后台配置不可控，所以直接走一套逻辑
  switch (item.link_type) {
    case 2:
      // previewImage({
      //   urls: [`${STATIC_HOST}${item.link_image_url}`],
      // })
      break //图片预览
    default:
      if (item.link_url) {
        if (item.link_url.startsWith('http') || item.link_url.startsWith('https')) {
          jumpToWebviewPage(item.link_url)
        } else {
          jumpOldUrl(item.link_url)
        }
      } else showToast({ title: '后台未配置页面', icon: 'none' })
      break
  }
}
//带参跳转职位详情
export function renderJobDetailUrlByParams(params?: IJobDetailParams) {
  console.log(params, jsonToUrl(params))
  return `/weapp/job/job-detail/index?${jsonToUrl(params)}`
}

//去除对象中无效值
export function renderValidParams(data) {
  return Object.keys(data)
    .filter(key => data[key] !== null && data[key] !== undefined)
    .reduce((acc, key) => ({ ...acc, [key]: data[key] }), {})
}

export function getMappingData(data, mapping) {
  let new_data = {}
  for (let k in data) {
    if (k in mapping) {
      new_data[mapping[k]] = data[k]
    } else {
      new_data[k] = data[k]
    }
  }
  return new_data
}

// 4月30日关闭春战入口
export function isShowSpringWar() {
  var targetDate = new Date('2023-04-30')
  var currentDate = new Date()
  return currentDate <= targetDate
}

// ios判断
export function mpIsInIos() {
  let isInIos = false;
  
  Taro.getSystemInfo({
    success: (res) => {
      isInIos = res.platform === 'ios';
    }
  })

  return isInIos;
}
 
// 判断职位类型
export function getJobType(isPriority: number | undefined, topStatus: number | undefined) {
  if (isPriority && topStatus) return "置顶优先"
  if (!isPriority && topStatus) return "置顶"
  if (isPriority && !topStatus) return "优先"
  if (!isPriority && !topStatus) return "普通"
}

// 详情页路由判断
export const getJobDetailPath = () => {
  const jobUrl = "weapp/pages/job/index";
  const searchUrl = "weapp/job/job-search/index";
  const companyUrl = "weapp/job/company-index/index";
  const jobZoneUrl = "weapp/job/job-zones/index";

  const sendResumeUrl = [jobUrl, searchUrl, companyUrl]; //这三个页面是投简历 其他页面是打招呼
  const prePageArr = [jobUrl, jobZoneUrl];

  const prePage = getCurrentPages().slice(-2, -1)[0]?.route;
  const isPreJob = sendResumeUrl.indexOf(prePage) >= 0; //相似职位推荐按钮文案根据上一页按钮改变
  const isStopBackRoute = prePageArr.indexOf(prePage) >= 0; //是否是首页和金刚区的页面 进详情页 详情页返回首次需截停
  const isJobUrl = prePage === jobUrl;
  const isJobZoneUrl = prePage === jobZoneUrl;

  return {
    isPreJob,
    isStopBackRoute,
    isJobUrl,
    isJobZoneUrl
  }
}