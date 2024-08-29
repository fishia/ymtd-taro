import { View } from '@tarojs/components'
import { ViewProps } from '@tarojs/components/types/View'
import { eventCenter, useRouter } from '@tarojs/taro'
import c from 'classnames'
import React, { useEffect, useRef } from 'react'

import MAITips from '@/components/MAITips'
import CreateResumeModal from '@/components/Modal/CreateResumeModal'
import PickIntentPopup from '@/components/PickIntentPopup'
import AddFavoritePopup, { addFavoritePopupEventKey } from '@/components/Popup/addFavoritePopup'
import LoginPopup, { loginPopupEventKey } from '@/components/Popup/loginPopup'
import ResumeStickyPopup from '@/components/Popup/resumeStickyPopup'
import { IProps } from '@/def/common'
import { useResumeStickyPopupRef, useShowAddFavoritePopup } from '@/hooks/custom/usePopup'

import LoadingStatus, { loadingStatusEventKey } from '../components/LoadingStatus'
import Modal, { modalEventKey } from '../components/Modal'
import Modal2, { modalEventKey2 } from '../components/Modal2'
import Toast, { toastEventKey } from '../components/Toast'

import './index.scss'

export interface IMainLayoutProps extends Omit<IProps, 'ref'>, ViewProps {
  navBarTitle?: string
  isTabbarPage?: boolean
  border?: boolean
  defaultLoading?: boolean
}

const MainLayout: React.FC<IMainLayoutProps> = props => {
  const {
    navBarTitle,
    isTabbarPage,
    defaultLoading,
    children,
    className,
    style,
    ...restProps
  } = props

  const router = useRouter()

  const showAddFavoritePopup = useShowAddFavoritePopup()

  const modalRef = useRef<any>(null)
  const modalRef2 = useRef<any>(null)

  const toastRef = useRef<any>(null)
  const loginPopupRef = useRef<any>(null)
  const addFavoriteRef = useRef<any>(null)
  const loadingStatusRef = useRef<any>(null)
  const resumeStickyPopupRef = useResumeStickyPopupRef()

  useEffect(() => {
    eventCenter.on(modalEventKey, (p, type = 'open') => void modalRef?.current?.[type](p))
    eventCenter.on(
      router.path + modalEventKey2,
      (p, type = 'open') => void modalRef2?.current?.[type](p)
    )
    eventCenter.on(
      router.path + toastEventKey,
      (p, type = 'open') => void toastRef.current?.[type](p)
    )
    eventCenter.on(loginPopupEventKey, (p, type = 'open') => void loginPopupRef.current?.[type](p))
    eventCenter.on(
      router.path + addFavoritePopupEventKey,
      (p, type = 'open') => void addFavoriteRef.current?.[type](p)
    )
    eventCenter.on(
      router.path + loadingStatusEventKey,
      (p, type = 'open') => void loadingStatusRef.current?.[type](p)
    )

    showAddFavoritePopup()

    return () => {
      // eventCenter.off(modalEventKey)
      eventCenter.off(router.path + modalEventKey2)
      eventCenter.off(router.path + toastEventKey)
      // eventCenter.off(loginPopupEventKey)
      eventCenter.off(router.path + addFavoritePopupEventKey)
      eventCenter.off(router.path + loadingStatusEventKey)
    }
  }, [router.path, showAddFavoritePopup])

  return (
    <View {...restProps} className={c('main-layout', className)} style={style}>
      {children}
      <View>
        <Modal ref={modalRef} />
        <Modal2 ref={modalRef2} />
        <Toast ref={toastRef} />

        <LoginPopup ref={loginPopupRef} />
        <AddFavoritePopup ref={addFavoriteRef} />
        <LoadingStatus
          ref={loadingStatusRef}
          defaultLoading={defaultLoading}
          hasNavBar={Boolean(navBarTitle)}
          hasTabBar={isTabbarPage}
        />
        <PickIntentPopup />
        <CreateResumeModal />
        <ResumeStickyPopup ref={resumeStickyPopupRef} />
        <MAITips />
      </View>
    </View>
  )
}

export default MainLayout
