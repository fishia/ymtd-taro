import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getCurrentInstance, getStorageSync, setStorageSync } from '@tarojs/taro'
import _ from 'lodash'

import { LOCATION_STORAGE_KEY, LOCATION_STORAGE_KEY_CHANGE_DATE } from '@/config'
import { defaultLocation, ILocation } from '@/def/common'
import { getCurrentTabBarIndex } from '@/utils/tabBar'

import appStore from '.'
import dayjs from 'dayjs'

// 此处使用 onAppRoute 此非公有 API 来处理跳转
// @ts-ignore
wx.onAppRoute(e => {
  if (['switchTab', 'redirectTo', 'reLaunch'].includes(e.openType)) {
    dispatchSetTabBarIndex(getCurrentTabBarIndex(e.path))
  } else {
    dispatchSetAllPages(e.path)
  }
})

// 此处为刚启动的小程序设置 tab 栏激活状态
// wx.getLaunchOptionsSync() 、 wx.getEnterOptionsSync() 有 bug，始终获取上一次的值
// 因此此处使用异步的 onAppShow 代替
wx.onAppShow(
  _.once(() => {
    setTimeout(() => {
      dispatchSetTabBarIndex(getCurrentTabBarIndex(getCurrentInstance().router?.path || ''))
    }, 10)
  })
)

export const commonSliceName = 'common'

export interface CommonStoreType {
  refresh: number
  currentTabIndex: number
  currentCity: ILocation
  pages: string[]
  rangersData: object
  version: boolean
  resumeType: string
  resumeIndex: number
  outsideLink: string
  jdInviteCode: string
}

const initialState: CommonStoreType = {
  refresh: 0,
  currentTabIndex: 0,
  currentCity: { ...defaultLocation, ...getStorageSync(LOCATION_STORAGE_KEY) },
  pages: [],
  rangersData: {},
  version: false,
  resumeType: '',
  resumeIndex: 0,
  outsideLink: '',
  jdInviteCode: '',
}

const messageSlice = createSlice({
  name: commonSliceName,
  initialState,
  reducers: {
    // 刷新首页职位列表
    refreshHomePageAction(state) {
      state.refresh = state.refresh + 1
    },

    // 设置 Tab 栏激活 index
    setCurrentTabIndexAction(state, action: PayloadAction<number>) {
      state.currentTabIndex = action.payload
    },

    // 设置当前城市
    setCurrentCityAction(state, action: PayloadAction<ILocation>) {
      state.currentCity = action.payload
    },
    //设置路由
    setAllPagesAction(state, action: PayloadAction<string>) {
      state.pages = [...state.pages, action.payload]
    },
    //设置火山实验参数
    setRangersDataAction(state, action: PayloadAction<object>) {
      state.rangersData = action.payload
    },
    //设置小程序版本
    setVersion(state, action: PayloadAction<boolean>) {
      state.version = action.payload
    },
    //设置微简历类型
    setResumeType(state, action: PayloadAction<string>) {
      state.resumeType = action.payload
    },
    //设置微简历首页获取返回url的index
    setResumeIndex(state, action: PayloadAction<number>) {
      state.resumeIndex = action.payload
    },
    //设置外链进来的参数
    setOutsideLink(state, action: PayloadAction<string>) {
      state.outsideLink = action.payload
    },
    // 设置邀请码
    setJdInviteCode(state, action: PayloadAction<string>) {
      state.jdInviteCode = action.payload
    }
  },
})

export default messageSlice.reducer

const {
  refreshHomePageAction,
  setCurrentTabIndexAction,
  setCurrentCityAction,
  setAllPagesAction,
  setRangersDataAction,
  setVersion,
  setResumeType,
  setResumeIndex,
  setOutsideLink,
  setJdInviteCode,
} = messageSlice.actions

// 刷新首页职位列表
export const dispatchRefreshHomePage = () => void appStore.dispatch(refreshHomePageAction())

// 设置 Tab 栏激活 index
export const dispatchSetTabBarIndex = (index: number) =>
  void appStore.dispatch(setCurrentTabIndexAction(index))

export const currentDay = dayjs().format('YYYY-MM-DD')

// 设置当前省市区,城市id影响推荐、相似职位查询所以还需同步记录city_id,搜索选择省不覆盖城市，选择结果包含市时需覆盖全局的city_id
export const dispatchSetCurrentCity = (city: ILocation) => {
  appStore.dispatch(setCurrentCityAction(city))
  setStorageSync(LOCATION_STORAGE_KEY, city)
  setStorageSync(LOCATION_STORAGE_KEY_CHANGE_DATE, currentDay)
}

// 设置所有路由
export const dispatchSetAllPages = (route: string) =>
  void appStore.dispatch(setAllPagesAction(route))
//设置火山实验参数
export const dispatchSetRangersData = (params: object) =>
  void appStore.dispatch(setRangersDataAction(params))
//设置小程序版本
export const dispatchSetVersion = (v: boolean) => void appStore.dispatch(setVersion(v))

export const dispatchSetResumeType = (v: string) => void appStore.dispatch(setResumeType(v))
export const dispatchSetResumeIndex = (v: number) => void appStore.dispatch(setResumeIndex(v))
export const dispatchSetOutsideLink = (v: string) => void appStore.dispatch(setOutsideLink(v))
export const dispatchSetInviteCode = (v: string) => void appStore.dispatch(setJdInviteCode(v))
