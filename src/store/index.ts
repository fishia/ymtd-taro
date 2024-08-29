import { configureStore } from '@reduxjs/toolkit'
import { createElement } from 'react'
import { Provider, TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { Middleware } from 'redux'
import { createLogger } from 'redux-logger'

import common from './common'
import message from './message'
import previewResume from './previewResume'
import resume from './resume'
import user from './user'

export * from './message'
export * from './common'
export * from './resume'
export * from './previewResume'
export * from './user'

const middleware: Middleware[] = []

if (process.env.DEBUG_REDUX === 'on') {
  middleware.push(createLogger())
}

const appStore = configureStore({
  reducer: { message, common, resume, previewResume, user },
  middleware,
})

export default appStore

export type RootState = ReturnType<typeof appStore.getState>
export type AppDispatch = typeof appStore.dispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>()

export const StoreProvider: React.FC = props =>
  createElement(Provider, { ...props, store: appStore })
