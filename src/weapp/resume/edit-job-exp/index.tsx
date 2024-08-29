import React, { useEffect, useState } from 'react'
import { navigateBack, useDidHide, useDidShow } from '@tarojs/taro'

import { IFormError } from '@/def/client'
import { createDefaultJob, IJobExp } from '@/def/resume'
import { appendJobExpApi, deleteJobExpApi, fetchJobExpApi, updateJobExpApi } from '@/apis/resume'
import { sendResumeEvent } from '@/utils/dataRangers'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import { useRefreshCurrentResume, useResumeId } from '@/hooks/custom/useResume'
import { usePreviewResumeList } from '@/hooks/custom/useResumePreview'
import useToast from '@/hooks/custom/useToast'
import useAlertBeforeUnload from '@/hooks/custom/useAlertBeforeUnload'
import useShowModal2 from '@/hooks/custom/useShowModal2'
import MainLayout from '@/layout/MainLayout'
import Button from '@/components/Button'
import { useFormRef } from '../components/Form'
import FixedButtonBar from '../components/FixedButton/FixedButtonBar'
import EditJobBlock from '../components/EditJobBlock'

import './index.scss'

const prefixCls = 'edit-job-exp'

const EditJobExp: React.FC = () => {
  const routerParam = useRouterParam()
  const mode = routerParam.mode
  const jobExpId = Number(routerParam.id) || 0
  const jobExpIndex = Number(routerParam.index)

  const showToast = useToast()
  const showModal = useShowModal2()
  const { list, updateListItem, omitListItem } = usePreviewResumeList<IJobExp>('profileJob')

  const resumeId = useResumeId()
  const refreshCurrentResume = useRefreshCurrentResume()

  const formRef = useFormRef<IJobExp>()
  const [jobExpInfo, setJobExpInfo] = useState<IJobExp>(createDefaultJob)

  const showDeleteButton = mode === 'confirm' ? jobExpIndex > -1 : jobExpId > 0
  const { enableAlertBeforeUnload, disableAlertBeforeUnload } = useAlertBeforeUnload()

  const [shieldCompany, setShieldCompany] = useState<boolean>()

  // 加载页面
  useEffect(() => {
    if ((resumeId && jobExpId) || mode === 'confirm') {
      const fetchFn =
        mode === 'confirm'
          ? () => Promise.resolve(list[jobExpIndex] || createDefaultJob)
          : () => fetchJobExpApi(jobExpId)

      fetchFn()
        .then(setJobExpInfo)
        .catch(() => void showToast({ content: '获取工作经历失败' }))
    }
  }, [resumeId, jobExpId, showToast, mode, list, jobExpIndex])

  // 点击保存
  const saveClickHandler = async () => {
    if (!(await formRef.current?.validateAndToast())) {
      return
    }

    if (mode === 'confirm') {
      updateListItem(formRef.current!.getData(), jobExpIndex)
      disableAlertBeforeUnload()
      navigateBack()
    } else {
      const fn = jobExpId === 0 ? appendJobExpApi : updateJobExpApi

      if (shieldCompany !== undefined) {
        sendResumeEvent('HideResumeClick', { is_hide: shieldCompany })
      }

      fn(formRef.current!.getData())
        .then(() => {
          disableAlertBeforeUnload()
          refreshCurrentResume()
          navigateBack()
        })
        .catch((err: IFormError<IJobExp>) => {
          formRef.current?.validateAndToastByResponse(err)
        })
    }
  }

  // 点击删除；新建时无删除按钮
  const deleteClickHandler = async () => {
    if (!(await showModal({ text: '确定要删除该条工作经历？', confirmText: '删除' }))) {
      return
    }

    if (mode === 'confirm') {
      omitListItem(jobExpIndex)
      disableAlertBeforeUnload()
      navigateBack()
    } else {
      deleteJobExpApi(jobExpId)
        .then(() => {
          disableAlertBeforeUnload()
          refreshCurrentResume()
          navigateBack()
        })
        .catch((err: IFormError<IJobExp>) => {
          showToast({ content: err.errorMessage })
        })
    }
  }

  useDidShow(() => {
    enableAlertBeforeUnload('现在退出，您编辑的信息将不会保存，是否继续？')
  })

  useDidHide(disableAlertBeforeUnload)

  const fieldChangeHandler = (field, value) => {
    if (field === 'isShieldCompany') {
      setShieldCompany(value)
    }
  }

  return (
    <MainLayout border navBarTitle="工作经历" className={prefixCls}>
      <EditJobBlock data={jobExpInfo} formRef={formRef} onFieldChange={fieldChangeHandler} />

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

export default EditJobExp
