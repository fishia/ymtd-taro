import { useCallback, useMemo } from 'react'
import _ from 'lodash'

import { IConversationItem } from '@/def/message'
import { dispatchAppendConversations, useAppSelector } from '@/store'
import { fetchRCConversationListApi } from '@/apis/message'
import { initConversations } from '@/services/IMService'

// 当前会话列表
export function useConversationItems(): IConversationItem[] {
  const conversations = useAppSelector(root => root.message.conversations)
  const storagedConversationData = useAppSelector(root => root.message.storagedConversationData)

  return useMemo(
    () =>
      conversations
        .filter(item => item.targetId in storagedConversationData)
        .map(item => ({
          ...item,
          ...storagedConversationData[item.targetId],
        })),
    [conversations, storagedConversationData]
  )
}

// 初始化会话列表
export function useInitConversations(): Func0<Promise<void>> {
  return initConversations
}

// 是否已初始化会话列表
export function useIsInitConversations(): boolean {
  const conversationTimestamp = useAppSelector(root => root.message.conversationTimestamp)
  const conversations = useAppSelector(root => root.message.conversations)
  const conversationStoragedData = useAppSelector(root => root.message.storagedConversationData)

  return useMemo(() => {
    if (conversationTimestamp <= -1) {
      return false
    }

    return conversations.length <= Object.keys(conversationStoragedData).length
  }, [conversationStoragedData, conversationTimestamp, conversations.length])
}

// 会话列表追加（分页）
export function useAppendConversations(): Func0<Promise<void>> {
  const conversationTimestamp = useAppSelector(root => root.message.conversationTimestamp)

  async function appendConversations() {
    // 未初始化的时候跳过，避免后请求的覆盖了新的
    if (conversationTimestamp <= -1) {
      return
    }

    const newList = await fetchRCConversationListApi(conversationTimestamp)
    if (newList.length <= 0) {
      return
    }

    const timestamp = _.last(newList)?.latestMessage?.sentTime
    dispatchAppendConversations(newList, timestamp)
  }

  return useCallback(appendConversations, [conversationTimestamp])
}
