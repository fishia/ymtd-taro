import { ICommonlyWord } from '@/def/message'
import { useAppSelector } from '@/store'

/** 获取当前常用语列表 */
export function useCommonlyWords(): ICommonlyWord[] {
  return useAppSelector(root => root.message.commonlyWords)
}
