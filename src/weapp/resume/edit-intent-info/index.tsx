import { View, Text } from '@tarojs/components'
import { eventCenter, navigateBack, useDidHide, useDidShow } from '@tarojs/taro'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'

import {
  appendUserIntentApi,
  deleteUserIntentInfoApi,
  fetchUserIntentDetailByIdApi,
  updateUserIntentInfoApi,
} from '@/apis/resume'
import { updateUserStatusApi } from '@/apis/user'
import Button from '@/components/Button'
import { REFRESH_INTENTS_LIST } from '@/config'
import { IFormError } from '@/def/client'
import { defaultResumeIntentInfo, IResumeIntentInfo } from '@/def/resume'
import useAlertBeforeUnload from '@/hooks/custom/useAlertBeforeUnload'
import { useCurrentResume, useRefreshCurrentResume } from '@/hooks/custom/useResume'
import { usePreviewResume } from '@/hooks/custom/useResumePreview'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import useShowLoadingStatus from '@/hooks/custom/useShowLoadingStatus'
import useShowModal2 from '@/hooks/custom/useShowModal2'
import useToast from '@/hooks/custom/useToast'
import { useCurrentUserInfo } from '@/hooks/custom/useUser'
import MainLayout from '@/layout/MainLayout'
import { refreshUserInfo } from '@/services/AccountService'
import appStore, { dispatchOmitPreviewIntent, dispatchUpdatePreviewIntent } from '@/store'

import EditIntentBlock from '../components/EditIntentBlock'
import FixedButtonBar from '../components/FixedButton/FixedButtonBar'
import { useFormRef } from '../components/Form'

import './index.scss'

const EditIntentInfo: React.FC = () => {
  const routerParam = useRouterParam()
  const mode = routerParam.mode
  const id = Number(routerParam.id) || 0
  const index = Number(routerParam.index)

  const currentUserInfo = useCurrentUserInfo()!
  const refreshCurrentResume = useRefreshCurrentResume()
  const currentResume = useCurrentResume()
  const [previewResume] = usePreviewResume()

  const showToast = useToast()
  const showModal = useShowModal2()
  const { hideLoadingStatus } = useShowLoadingStatus()
  const { enableAlertBeforeUnload, disableAlertBeforeUnload } = useAlertBeforeUnload()

  const formRef = useFormRef<IResumeIntentInfo>()
  const [intentInfo, setIntentInfo] = useState<IResumeIntentInfo>(defaultResumeIntentInfo)

  const showDeleteButton =
    mode === 'confirm'
      ? index > -1 && (previewResume?.intents || []).length > 1
      : id > 0 &&
        (currentResume
          ? (currentResume.intents || []).length > 1
          : currentUserInfo.intent_count > 1)

  const isEditIntent = mode === 'confirm' ? index > -1 : id > 0
  const intentCount =
    mode === 'confirm' ? previewResume?.intents.length : currentResume?.intents.length

  // 加载页面
  useEffect(() => {
    if (id || mode === 'confirm') {
      const fetchFn =
        mode === 'confirm'
          ? () => Promise.resolve(previewResume?.intents?.[index] || defaultResumeIntentInfo)
          : () => fetchUserIntentDetailByIdApi(id)

      fetchFn()
        .then(intent => void (intent && setIntentInfo(intent)))
        .then(hideLoadingStatus)
        .catch(() => void showToast({ content: '获取求职意向失败' }))
    } else {
      hideLoadingStatus()
    }
  }, [hideLoadingStatus, id, index, mode, previewResume?.intents, showToast])

  // 点击保存
  const saveClickHandler = _.debounce(
    async () => {
      if (!(await formRef.current?.validateAndToast())) {
        return
      }

      if (!appStore.getState().user?.status) {
        updateUserStatusApi(Number(formRef.current!.getData().userStatus)).then(refreshUserInfo)
      }

      if (mode === 'confirm') {
        if (index > -1) {
          dispatchUpdatePreviewIntent(formRef.current!.getData(), Number(index))
        } else {
          dispatchUpdatePreviewIntent(formRef.current!.getData(), -1)
        }

        disableAlertBeforeUnload()
        navigateBack()
      } else {
        const fn = id === 0 ? appendUserIntentApi : updateUserIntentInfoApi
        fn(formRef.current!.getData())
          .then(() => {
            eventCenter.trigger(REFRESH_INTENTS_LIST)
            disableAlertBeforeUnload()
            refreshCurrentResume().then(() => navigateBack())
          })
          .catch((err: IFormError<IResumeIntentInfo>) => {
            formRef.current?.validateAndToastByResponse(err)
          })
      }
    },
    1000,
    { leading: true, trailing: false }
  )

  // 点击删除
  const deleteClickHandler = async () => {
    if (!(await showModal({ text: '确定要删除该条求职意向？', confirmText: '删除' }))) {
      return
    }

    if (mode === 'confirm') {
      dispatchOmitPreviewIntent(index)
      disableAlertBeforeUnload()
      navigateBack()
    } else {
      deleteUserIntentInfoApi(id)
        .then(() => {
          eventCenter.trigger(REFRESH_INTENTS_LIST)
          disableAlertBeforeUnload()
          refreshCurrentResume()
          navigateBack()
        })
        .catch(err => {
          showToast({ content: err.errorMessage })
        })
    }
  }

  useDidShow(() => {
    enableAlertBeforeUnload('现在退出，您编辑的信息将不会保存，是否继续？')
  })

  useDidHide(disableAlertBeforeUnload)

  return (
    <MainLayout navBarTitle="求职意向" defaultLoading border className="edit-intent-info">
      {isEditIntent ? null : (
        <View className="edit-intent-info__title">
          <View className="edit-intent-info__title__main">
            添加求职意向
            {intentCount ? (
              <Text>
                （<Text className="edit-intent-info__title__highlight">{intentCount + 1}</Text>
                /3）
              </Text>
            ) : null}
          </View>
          <View className="edit-intent-info__title__tips">求职意向不同，推荐的职位也会不同</View>
        </View>
      )}

      <EditIntentBlock data={intentInfo} formRef={formRef} />

      <FixedButtonBar>
        {showDeleteButton ? (
          <Button btnType="delete" onClick={deleteClickHandler}>
            删除
          </Button>
        ) : null}

        <Button onClick={saveClickHandler}>{mode === 'confirm' ? '确认' : ' 保存'}</Button>
      </FixedButtonBar>
    </MainLayout>
  )
}

export default EditIntentInfo
