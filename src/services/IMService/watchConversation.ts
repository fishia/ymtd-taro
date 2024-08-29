import _ from 'lodash'
import { IReceivedUpdateConversation } from '@rongcloud/imlib-v4'

import { dispatchMergeConversations } from '@/store'
import { runIMFirstLaunchedDone, refreshUnreadMessageCount } from '.'

// 更新未读数（防抖)
const debouncedUpdateUnreadMessageCount = _.debounce(refreshUnreadMessageCount, 500, {
  leading: true,
})

// 监听会话列表变更事件
// 触发时机：会话状态变化（置顶、免打扰）、会话未读数变化（未读数增加、未读数清空）、会话最后一条消息变化
export default function watchConversation(e: {
  updatedConversationList: IReceivedUpdateConversation[]
}) {
  if (!runIMFirstLaunchedDone()) {
    return
  }

  const updatedConversationList = e.updatedConversationList

  if (updatedConversationList?.length > 0) {
    debouncedUpdateUnreadMessageCount()
    dispatchMergeConversations(e.updatedConversationList)
  }

  if (process.env.DEBUG_MESSAGE === 'on') {
    updatedConversationList.length > 0 && console.log('☆ 会话列表更新：', updatedConversationList)
  }
}
