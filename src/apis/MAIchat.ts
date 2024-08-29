import Client from '@/apis/client'
import { chatListProps, chatListResult, existsProfileRes } from '@/def/MAI'

// 基于时间的对话列表
export const MAIChatList = (data: chatListProps): Promise<chatListResult> =>
  Client({ url: '/ymtd-capp/mai/scroll', data })

// 确认使用某条消息
export const chooseMessage = (extraContent: string, uuid?: string) =>
  Client({ url: '/ymtd-capp/mai/use', method: 'POST', data: { uuid, extraContent } })

// 是否存在Mai生成的简历
export const existsProfile = (): Promise<existsProfileRes> =>
  Client({ url: '/ymtd-capp/mai/existsProfile' })

// 获取简历解析结果
export const getMaiProfile = (uuid: string) =>
  Client({ url: '/ymtd-capp/mai/profile', method: 'POST', data: { uuid } })
