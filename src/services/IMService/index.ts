import { IMClient, init, ConnectionStatus, LogLevel, CONNECTION_STATUS } from '@rongcloud/imlib-v4'
import { eventCenter, setStorageSync } from '@tarojs/taro'
import _ from 'lodash'

import {
  fetchIMTokenApi,
  fetchIsFollowWxApi,
  fetchRCConversationListApi,
  fetchRCAllUnreadCountApi,
  listChatUserInfoApi,
  listCommonlyWordListApi,
} from '@/apis/message'
import { IM_TOKEN_FLAG } from '@/config'
import {
  illegalWords,
  IMConnectSuccessEvent,
  MessageSendFailedReasons,
  IVerifyNotice,
  IMReciveUpdateExpansion,
  IConversationUserInfoRecords,
} from '@/def/message'
import appStore, {
  dispatchAttachConversationUserInfo,
  dispatchClearConversationStoragedData,
  dispatchInitMessageStore,
  dispatchSetCommonlyWords,
  dispatchSetConversations,
  dispatchSetIsFollowWx,
  dispatchSetRCUserId,
  dispatchSetUnreadMessageCount,
} from '@/store'

import { isIMLaunched, runIMFirstLaunchedDone } from './firstLaunch'
import watchConversation from './watchConversation'
import watchExpansion from './watchExpansion'
import watchMessage from './watchMessage'

export * from './chatPrepareData'
export * from './dateFormat'
export * from './firstLaunch'
export * from './checkRepeatChat'

let rcInstance: IMClient = (null as unknown) as IMClient

const readyFetchUserIdsSet = new Set<string>([])

const debouncedListChatUserInfoApi = _.debounce(
  (callback: Func1<IConversationUserInfoRecords, void>) => {
    const list = [...readyFetchUserIdsSet]
    listChatUserInfoApi(list)
      .then(callback)
      .then(() => void list.forEach(id => void readyFetchUserIdsSet.delete(id)))
  },
  500
)

// 初始化融云
export function initRongIM(appkey: string) {
  rcInstance = init({
    appkey,
    logLevel: LogLevel.ERROR,
    checkCA: false,
  })

  rcInstance.watch({
    // 监听 IM 连接状态变化
    status(currentStatus) {
      // 连接成功触发事件
      if (currentStatus.status === CONNECTION_STATUS.CONNECTED) {
        eventCenter.trigger(IMConnectSuccessEvent)
      }
    },

    // 监听会话列表变化
    conversation: watchConversation,

    // 监听收到消息
    message: watchMessage,

    // 监听收到扩展消息
    expansion: watchExpansion,
  })

  // 自动拉取 HR 头像名称的
  appStore.subscribe(() => {
    const conversations = appStore.getState().message.conversations
    const storagedConversationData = appStore.getState().message.storagedConversationData

    const newIds = conversations
      .map(item => item.targetId)
      .filter(id => !(id in storagedConversationData) && !readyFetchUserIdsSet.has(id))

    if (newIds.length > 0) {
      newIds.forEach(id => void readyFetchUserIdsSet.add(id))
      debouncedListChatUserInfoApi(dispatchAttachConversationUserInfo)
    }
  })
}

// 融云建立连接
export async function connectIM() {
  const imAuthInfo = await fetchIMTokenApi()
  const result = await rcInstance.connect({ token: imAuthInfo.token })

  setStorageSync(IM_TOKEN_FLAG, imAuthInfo.token)

  if (process.env.DEBUG_MESSAGE === 'on') {
    console.log('★ 融云连接已建立： rcId:', result.id)
  }

  if (result.id) {
    refreshUnreadMessageCount()

    dispatchInitMessageStore()
    dispatchSetRCUserId(result.id)

    listCommonlyWordListApi().then(dispatchSetCommonlyWords)

    // 设置公众号关注状态
    fetchIsFollowWxApi().then(isFollowWx => {
      dispatchSetIsFollowWx(isFollowWx)
    })

    if (isIMLaunched()) {
      initConversations()
    } else {
      runIMFirstLaunchedDone()
    }
  }

  return result
}

// 融云断开连接
export async function disconnectIM() {
  return rcInstance.disconnect().then(() => {
    dispatchInitMessageStore()
    setStorageSync(IM_TOKEN_FLAG, null)
  })
}

// 获取融云连接状态
export function getIMConnectStatus(): boolean {
  return getIMClient().getConnectionStatus() === ConnectionStatus.CONNECTED
}

// 如果融云未连接，则发起连接，确保连接处在打开状态
export async function ensureIMConnect(): Promise<boolean> {
  if (getIMConnectStatus()) {
    return true
  }

  try {
    const result = await connectIM()

    return Boolean(result.id)
  } catch (e) {
    return false
  }
}

// 导出获取融云 im 客户端实例的方法
export function getIMClient(): IMClient {
  return rcInstance
}

// 初始化会话列表
export async function initConversations(): Promise<void> {
  dispatchSetConversations([], -1)
  dispatchClearConversationStoragedData()

  const newList = await fetchRCConversationListApi(0)
  const timestamp = _.last(newList)?.latestMessage?.sentTime || 0
  dispatchSetConversations(newList, timestamp)
}

// 下拉刷新会话列表
export async function refreshConversations(): Promise<void> {
  const newList = await fetchRCConversationListApi(0)
  const newIds = newList.map(item => item.targetId)

  dispatchSetConversations([], -1)

  if (newIds.length <= 0) {
    dispatchClearConversationStoragedData()

    return
  }

  const timestamp = _.last(newList)?.latestMessage?.sentTime || 0

  const userInfoMap = await listChatUserInfoApi(newIds)
  dispatchAttachConversationUserInfo(userInfoMap)
  dispatchSetConversations(newList, timestamp)
}

// 刷新未读消息数
export async function refreshUnreadMessageCount(): Promise<number> {
  const count = await fetchRCAllUnreadCountApi()
  dispatchSetUnreadMessageCount(count)

  return count
}

// 发送失败的消息显示文字
export function messageVerifyFaildTips(verifyNotice: IVerifyNotice): string {
  switch (verifyNotice?.content?.type) {
    case MessageSendFailedReasons.INCLUDE_CONTACT:
      return '发送失败，请使用交换电话功能'
    case MessageSendFailedReasons.INCLUDE_SENSITIVE_WORDS:
      return (
        '发送失败，含有敏感词' + (verifyNotice.content.tips ? `“${verifyNotice.content.tips}”` : '')
      )
    case MessageSendFailedReasons.SEND_FAILED:
    default:
      return '发送失败，请检查网络连接'
  }
}

// 手动触发扩展更新
export function updateRCMessageExpansion(messageUId: string, expansion: Record<string, string>) {
  eventCenter.trigger(IMReciveUpdateExpansion, { messageUId, expansion })
}

// 是否包含非法词汇
export function isTextContainsContact(content: string = ''): boolean {
  for (const item of illegalWords) {
    if (item.test(content)) {
      return true
    }
  }

  return false
}
