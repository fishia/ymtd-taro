import { dispatchRefreshHomePage, useAppSelector } from '@/store'
import { eventCenter } from '@tarojs/taro'

// 刷新首页
export function useRefreshHomePage() {
  return dispatchRefreshHomePage
}

// 获取当前页面刷新状态
export function useHomePageRefreshState(): number {
  return useAppSelector(store => store.common.refresh)
}
