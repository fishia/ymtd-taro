import appStore from '.'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { IRelationalType } from '@/def/common'
import { INullableUserInfo } from '@/def/user'

export const userSliceName = 'userSlice'

export type UserStoreType = INullableUserInfo

const initialState: UserStoreType = null as UserStoreType

const userSlice = createSlice({
  name: userSliceName,
  initialState,
  reducers: {
    // 设置用户信息
    setUserAction(_state, action: PayloadAction<INullableUserInfo>) {
      return action.payload
    },

    // 新增用户收藏项
    addUserFavoriteAction(state, action: PayloadAction<{ type: IRelationalType; target: number }>) {
      switch (action.payload.type) {
        default:
        case 'jd':
          state?.favorite_ids.push(action.payload.target);
          break
        case 'article':
          state?.favorite_article_ids.push(action.payload.target)
          break
        case 'company':
          state?.favorite_company_ids.push(action.payload.target)
          break
      }
    },

    // 按 ID 删除用户收藏项
    deleteUserFavoriteAction(
      state,
      action: PayloadAction<{ type: IRelationalType; target: number }>
    ) {
      switch (action.payload.type) {
        default:
        case 'jd':
          state!.favorite_ids = state!.favorite_ids.filter(t => t !== action.payload.target)
          break
        case 'article':
          state!.favorite_article_ids = state!.favorite_article_ids.filter(
            t => t !== action.payload.target
          )
          break
        case 'company':
          state!.favorite_company_ids = state!.favorite_company_ids.filter(
            t => t !== action.payload.target
          )
          break
      }
    },

    // 清除用户未处理提醒
    clearUserNoticeCountAction(state, action: PayloadAction<'record' | 'recommend'>) {
      if (action.payload === 'recommend') {
        state!.profile!.unread_recommended_count = 0
      } else if (action.payload === 'record') {
        state!.profile!.unread_apply_count = 0
      }
    },
    setHaveChatAction(state, action: PayloadAction<{ haveChat: number }>) {
      state!.haveChat = action.payload.haveChat
    },
  },
})

const {
  setUserAction,
  addUserFavoriteAction,
  deleteUserFavoriteAction,
  clearUserNoticeCountAction,
  setHaveChatAction,
} = userSlice.actions

export default userSlice.reducer

// 设置用户信息
export const dispatchSetUser = (user: INullableUserInfo) =>
  void appStore.dispatch(setUserAction(user))

// 新增用户收藏项
export const dispatchAddUserFavorite = (type: IRelationalType, id: number) =>
  void appStore.dispatch(addUserFavoriteAction({ type, target: id }))

// 按 ID 删除用户收藏项
export const dispatchDeleteUserFavorite = (type: IRelationalType, id: number) =>
  void appStore.dispatch(deleteUserFavoriteAction({ type, target: id }))

// 清除用户未处理提醒
export const dispatchClearUserNoticeCount = (type: 'record' | 'recommend') =>
  void appStore.dispatch(clearUserNoticeCountAction(type))

// 是否沟通过
export const dispatchSetHaveChat = (n: number) =>
  void appStore.dispatch(setHaveChatAction({ haveChat: n }))
