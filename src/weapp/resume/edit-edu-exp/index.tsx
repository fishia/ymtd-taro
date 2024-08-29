import { navigateBack, useDidHide, useDidShow } from '@tarojs/taro'
import React, { useEffect, useState } from 'react'

import { fetchEduExpApi, updateEduExpApi, deleteEduExpApi, appendEduExpApi } from '@/apis/resume'
import Button from '@/components/Button'
import { IFormError } from '@/def/client'
import { createDefaultEducation, IEducationExp } from '@/def/resume'
import useAlertBeforeUnload from '@/hooks/custom/useAlertBeforeUnload'
import { useRefreshCurrentResume, useResumeId } from '@/hooks/custom/useResume'
import { usePreviewResumeList } from '@/hooks/custom/useResumePreview'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import useShowModal2 from '@/hooks/custom/useShowModal2'
import useToast from '@/hooks/custom/useToast'
import MainLayout from '@/layout/MainLayout'

import EditEduBlock from '../components/EditEduBlock'
import FixedButtonBar from '../components/FixedButton/FixedButtonBar'
import { useFormRef } from '../components/Form'

import './index.scss'

const EditEduInfo: React.FC = () => {
  const routerParam = useRouterParam()
  const mode = routerParam.mode
  const eduExpId = Number(routerParam.id) || 0
  const eduExpIndex = Number(routerParam.index)
  const isStudent = routerParam.isStudent === 'true' ? true : false

  const showToast = useToast()
  const showModal = useShowModal2()

  const { list, updateListItem, omitListItem } = usePreviewResumeList<IEducationExp>('profileEdu')

  const resumeId = useResumeId()!
  const refreshCurrentResume = useRefreshCurrentResume()

  const formRef = useFormRef<IEducationExp>()
  const [eduExpInfo, setEduExpInfo] = useState<IEducationExp>(createDefaultEducation)
  const showDeleteButton = mode === 'confirm' ? eduExpIndex > -1 : eduExpId > 0
  const { enableAlertBeforeUnload, disableAlertBeforeUnload } = useAlertBeforeUnload()

  // 加载页面
  useEffect(() => {
    if ((resumeId && eduExpId) || mode === 'confirm') {
      const fetchFn =
        mode === 'confirm'
          ? () => Promise.resolve(list[eduExpIndex] || createDefaultEducation)
          : () => fetchEduExpApi(eduExpId)

      fetchFn()
        .then(setEduExpInfo)
        .catch(() => void showToast({ content: '获取教育经历失败' }))
    }
  }, [resumeId, eduExpId, showToast, mode, eduExpIndex, list])

  // 点击保存
  const saveClickHandler = async () => {
    if (!(await formRef.current?.validateAndToast())) {
      return
    }

    if (mode === 'confirm') {
      updateListItem(formRef.current!.getData(), eduExpIndex)
      disableAlertBeforeUnload()
      navigateBack()
    } else {
      const fn = eduExpId === 0 ? appendEduExpApi : updateEduExpApi
      fn(formRef.current!.getData())
        .then(() => {
          disableAlertBeforeUnload()
          refreshCurrentResume()
          navigateBack()
        })
        .catch((err: IFormError<IEducationExp>) => {
          formRef.current?.validateAndToastByResponse(err)
        })
    }
  }

  // 点击删除；新建时无删除按钮
  const deleteClickHandler = async () => {
    console.log(list)
    if (!(await showModal({ text: '确定要删除该条教育经历？', confirmText: '删除' }))) {
      return
    }

    if (mode === 'confirm') {
      omitListItem(eduExpIndex)
      disableAlertBeforeUnload()
      navigateBack()
    } else {
      deleteEduExpApi(eduExpId)
        .then(() => {
          disableAlertBeforeUnload()
          refreshCurrentResume()
          navigateBack()
        })
        .catch((err: IFormError<IEducationExp>) => {
          showToast({ content: err.errorMessage })
        })
    }
  }

  useDidShow(() => {
    enableAlertBeforeUnload('现在退出，您编辑的信息将不会保存，是否继续？')
  })

  useDidHide(disableAlertBeforeUnload)

  return (
    <MainLayout border navBarTitle="教育经历" className="edit-edu-exp">
      <EditEduBlock data={eduExpInfo} formRef={formRef} isStudent={isStudent} />

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

export default EditEduInfo
