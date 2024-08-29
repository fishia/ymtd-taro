import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IReceivedUpdateConversation } from '@rongcloud/imlib-v4'

import {
  ICommonlyWord,
  IConversation,
  IConversationReadStatus,
  IConversationUserInfoRecords,
  IStoragedConversationUserInfo,
} from '@/def/message'
import { getIMClient } from '@/services/IMService'

import appStore from '.'

export const messageSliceName = 'message'

export interface MessageStoreType {
  rcUserId: Nullable<string>
  isFollowWx: boolean

  unreadMessageCount: number
  conversations: IConversation[]
  conversationTimestamp: number
  storagedConversationData: IConversationUserInfoRecords

  commonlyWords: ICommonlyWord[]
}

const initialState: MessageStoreType = {
  rcUserId: null,
  isFollowWx: true,

  unreadMessageCount: 0,
  conversations: [],
  conversationTimestamp: -1,
  storagedConversationData: {},

  commonlyWords: [],
}

type ConversationPayloadActionType = PayloadAction<{
  conversations: IConversation[]
  timestamp?: number
}>

const messageSlice = createSlice({
  name: messageSliceName,
  initialState,
  reducers: {
    // 清空所有 IM 数据
    initMessageAction() {
      return initialState
    },

    // 设置用户融云 ID
    setUserRCIdAction(state, action: PayloadAction<Nullable<string>>) {
      state.rcUserId = action.payload
    },

    // 设置用户微信公众号关注状态
    setUserIsFollowWxAction(state, action: PayloadAction<boolean>) {
      state.isFollowWx = action.payload
    },

    // 设置未读数
    setUnreadMessageCountAction(state, action: PayloadAction<number>) {
      state.unreadMessageCount = action.payload
    },

    // 设置会话列表
    setConversationsAction(state, action: ConversationPayloadActionType) {
      state.conversations = action.payload.conversations
      if (action.payload.timestamp !== undefined) {
        state.conversationTimestamp = action.payload.timestamp
      }
    },

    // 清除对应targetId的未读数量
    setConversationsClearUnreadAction(state, action) {
      const conversationList = state.conversations

      const targetConversation = conversationList.find((item) => {
        return item.targetId === action.payload
      })
      if (targetConversation) {
        targetConversation.unreadMessageCount = 0
      }
    },

    // 追加会话列表项
    appendConversationAction(state, action: ConversationPayloadActionType) {
      state.conversations = state.conversations.concat(action.payload.conversations)
      if (action.payload.timestamp !== undefined) {
        state.conversationTimestamp = action.payload.timestamp
      }
    },

    // 合并会话列表
    mergeConversationAction(state, action: PayloadAction<IReceivedUpdateConversation[]>) {
      state.conversations = getIMClient().Conversation.merge({
        conversationList: state.conversations,
        updatedConversationList: action.payload,
      })
    },

    // 为会话列表里的项更新已读时间
    attachConversationReadStatusAction(
      state,
      action: PayloadAction<{ targetId: string; readStatus: IConversationReadStatus }>
    ) {
      const currentData = state.storagedConversationData[action.payload.targetId]

      if (
        currentData &&
        currentData.hr_last_read_time < (action.payload.readStatus.hr_last_read_time || 0)
      ) {
        state.storagedConversationData[action.payload.targetId] = {
          ...state.storagedConversationData[action.payload.targetId],
          ...action.payload.readStatus,
        }
      }
    },

    // 为会话列表里的项更新用户信息
    attachConversationUserInfoAction(state, action: PayloadAction<IConversationUserInfoRecords>) {
      state.storagedConversationData = {
        ...state.storagedConversationData,
        ...action.payload,
      }
    },

    // 合并更新会话列表里的项目
    mergeConversationInfoAction(
      state,
      action: PayloadAction<Partial<IStoragedConversationUserInfo> & { targetId: string }>
    ) {
      const { targetId, ...restFields } = action.payload
      const conversationInfo = state.storagedConversationData[targetId]
      if (!conversationInfo) {
        return
      }

      state.storagedConversationData = {
        ...state.storagedConversationData,
        [targetId]: {
          ...conversationInfo,
          ...restFields,
        },
      }
    },

    // 清空本地已存储的会话用户信息
    clearStoragedConversationDataAction(state) {
      state.storagedConversationData = initialState.storagedConversationData
    },

    // 设置常用语
    setCommonlyWords(state, action: PayloadAction<ICommonlyWord[]>) {
      state.commonlyWords = action.payload
    },

    // 新增常用语
    addCommonlyWord(state, action: PayloadAction<ICommonlyWord>) {
      state.commonlyWords = [action.payload, ...state.commonlyWords]
    },

    // 更新常用语
    updateCommonlyWord(state, action: PayloadAction<Omit<ICommonlyWord, 'commonWordsType'>>) {
      const index = state.commonlyWords.findIndex(
        item => item.commonWordsId === action.payload.commonWordsId
      )
      const item = state.commonlyWords.splice(index, 1)[0]
      if (item) {
        state.commonlyWords.unshift(Object.assign(item, action.payload))
      }
    },

    // 按 ID 删除常用语
    removeCommonlyWordsById(state, action: PayloadAction<number>) {
      state.commonlyWords = (state.commonlyWords || []).filter(
        t => t.commonWordsId !== action.payload
      )
    },
  },
})

export default messageSlice.reducer

const {
  initMessageAction,
  setUserRCIdAction,
  setUserIsFollowWxAction,
  setUnreadMessageCountAction,
  setConversationsAction,
  appendConversationAction,
  mergeConversationAction,
  attachConversationReadStatusAction,
  attachConversationUserInfoAction,
  mergeConversationInfoAction,
  clearStoragedConversationDataAction,
  setCommonlyWords,
  addCommonlyWord,
  updateCommonlyWord,
  removeCommonlyWordsById,
  setConversationsClearUnreadAction
} = messageSlice.actions

// 初始化
export const dispatchInitMessageStore = () => void appStore.dispatch(initMessageAction())

// 设置融云用户 ID
export const dispatchSetRCUserId = (id: Nullable<string>) =>
  void appStore.dispatch(setUserRCIdAction(id))

// 设置是否关注公众号
export const dispatchSetIsFollowWx = (isFollowWx: boolean) =>
  void appStore.dispatch(setUserIsFollowWxAction(isFollowWx))

// 设置未读消息数（初始化拉取未读消息量）
export const dispatchSetUnreadMessageCount = (count: number) =>
  void appStore.dispatch(setUnreadMessageCountAction(count))

// 设置会话列表
export const dispatchSetConversations = (conversations: IConversation[], timestamp: number) =>
  void appStore.dispatch(setConversationsAction({ conversations, timestamp }))

// 已读单条信息
export const dispatchReadConversation = ((targetId) => {
  void appStore.dispatch(setConversationsClearUnreadAction(targetId))
})

// 追加会话
export const dispatchAppendConversations = (conversations: IConversation[], timestamp?: number) =>
  void appStore.dispatch(appendConversationAction({ conversations, timestamp }))

// 合并会话
export const dispatchMergeConversations = (updateConversations: IReceivedUpdateConversation[]) =>
  void appStore.dispatch(mergeConversationAction(updateConversations))

// 会话列表更新已读标记
export const dispatchAttachConversationReadStatus = (
  targetId: string,
  readStatus: IConversationReadStatus
) => void appStore.dispatch(attachConversationReadStatusAction({ targetId, readStatus }))

// 会话列表更新用户信息
export const dispatchAttachConversationUserInfo = (userInfos: IConversationUserInfoRecords) =>
  void appStore.dispatch(attachConversationUserInfoAction(userInfos))

// 合并更新会话列表里的项目
export const dispatchMergeConversationInfoAction = (
  targetId: string,
  conversationInfo: Partial<IStoragedConversationUserInfo>
) => void appStore.dispatch(mergeConversationInfoAction({ ...conversationInfo, targetId }))

// 清空已储存的会话列表数据
export const dispatchClearConversationStoragedData = () =>
  void appStore.dispatch(clearStoragedConversationDataAction())

// 设置常用语
export const dispatchSetCommonlyWords = (newCommonlyWords: ICommonlyWord[]) =>
  void appStore.dispatch(setCommonlyWords(newCommonlyWords))

// 新增常用语
export const dispatchAddCommonlyWord = (newCommonlyWord: ICommonlyWord) =>
  void appStore.dispatch(addCommonlyWord(newCommonlyWord))

// 更新常用语
export const dispatchUpdateCommonlyWord = (commonlyWord: Omit<ICommonlyWord, 'commonWordsType'>) =>
  void appStore.dispatch(updateCommonlyWord(commonlyWord))

// 按 ID 删除常用语
export const dispatchRemoveCommonlyWordsById = (removeId: number) =>
  void appStore.dispatch(removeCommonlyWordsById(removeId))
