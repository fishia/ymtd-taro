import _ from 'lodash'
import { useCallback } from 'react'

import {
  clearRCUnreadCountApi,
  fetchChattingStatusApi,
  fetchRCChatUnreadCountApi,
  fetchRCHistoryMessageList,
  sendRCReadTagApi,
  sendRCSyncReadCountApi,
} from '@/apis/message'
import { setChatPrepareData } from '@/services/IMService'

import { useReduceUnreadMessageCount, useRefreshUnreadMessageCount } from './unreadCount'
import { dispatchReadConversation } from '@/store'

async function sleep(time: number) {
  await new Promise(res => void setTimeout(res, time))
}

// 根据 targetId 来初始化聊天
export function useInitChatByTargetId(): Func2<string, boolean | undefined, Promise<void>> {
  const refreshUnreadCount = useRefreshUnreadMessageCount()
  const reduceUnreadMessageCount = useReduceUnreadMessageCount()

  async function initChatByTargetId(targetId: string, isNew?: boolean) {
    // 拉取聊天状态和历史消息
    const [chattingStatus, unreadMessageCount] = await Promise.all([
      fetchChattingStatusApi(targetId),
      fetchRCChatUnreadCountApi(targetId),
    ])

    // 新发起沟通时后端会发送4-5条消息，等待 1s 避免拉取历史消息后到开始监听新消息前这段空白时间之间遗漏消息
    if (isNew) {
      await sleep(1000)
    }

    const historyMessage = await fetchRCHistoryMessageList(targetId, 0, 10)

    const messages = historyMessage.list || []
    // 存在未读数，则发送已读标记，并清除未读数
    const latestMessage = _.last(messages)
    if (latestMessage && unreadMessageCount > 0) {
      sendRCReadTagApi(targetId, latestMessage.messageUId, latestMessage.sentTime)

      // 清除本会话的未读消息数并发送同步，先扣减掉全局总未读消息数，然后刷新全局未读消息总数
      reduceUnreadMessageCount(unreadMessageCount || 0)
      clearRCUnreadCountApi(targetId).then(refreshUnreadCount)
      sendRCSyncReadCountApi(targetId, latestMessage.sentTime)
      dispatchReadConversation(targetId)
    }

    const nowTime = new Date().getTime()

    setChatPrepareData({
      chatStatus: chattingStatus,
      messageList: messages,
      isNoMore: historyMessage.noMore,
      earliestMessageTime: messages[0]?.sentTime || nowTime,
    })
  }

  return useCallback(initChatByTargetId, [reduceUnreadMessageCount, refreshUnreadCount])
}
