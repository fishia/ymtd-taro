import { navigateBack, useDidHide, useDidShow } from '@tarojs/taro'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'

import {
  appendProjExpApi,
  checkSensitiveWordsApi,
  deleteProjExpApi,
  fetchProjApi,
  updateProjExpApi,
} from '@/apis/resume'
import Button from '@/components/Button'
import { IFormError } from '@/def/client'
import { IProjectExp, createDefaultProject } from '@/def/resume'
import useAlertBeforeUnload from '@/hooks/custom/useAlertBeforeUnload'
import { useRefreshCurrentResume, useResumeId } from '@/hooks/custom/useResume'
import { usePreviewResumeList } from '@/hooks/custom/useResumePreview'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import useShowModal2 from '@/hooks/custom/useShowModal2'
import useToast from '@/hooks/custom/useToast'
import MainLayout from '@/layout/MainLayout'

import DateRangePicker from '../components/DateRangePicker'
import FixedButtonBar from '../components/FixedButton/FixedButtonBar'
import Form, { FormItem, useFormRef } from '../components/Form'
import Input from '../components/Input'
import Textarea from '../components/Textarea'

import './index.scss'

const currentDay = dayjs().format('YYYY-MM-DD')

const EditProjExp: React.FC = () => {
  const routerParam = useRouterParam()
  const mode = routerParam.mode
  const projExpId = Number(routerParam.id) || 0
  const projExpIndex = Number(routerParam.index)

  const showToast = useToast()
  const showModal = useShowModal2()

  const { list, updateListItem, omitListItem } = usePreviewResumeList<IProjectExp>('profileProject')

  const resumeId = useResumeId()
  const refreshCurrentResume = useRefreshCurrentResume()

  const formRef = useFormRef<IProjectExp>()
  const [projExpInfo, setProjExpInfo] = useState<IProjectExp>(createDefaultProject)
  const { enableAlertBeforeUnload, disableAlertBeforeUnload } = useAlertBeforeUnload()

  const showDeleteButton = mode === 'confirm' ? projExpIndex > -1 : projExpId > 0

  // 加载页面
  useEffect(() => {
    if ((resumeId && projExpId) || mode === 'confirm') {
      const fetchFn =
        mode === 'confirm'
          ? () => Promise.resolve(list[projExpIndex] || createDefaultProject)
          : () => fetchProjApi(projExpId)

      fetchFn()
        .then(setProjExpInfo)
        .catch(() => void showToast({ content: '获取项目经历失败' }))
    }
  }, [list, mode, projExpId, projExpIndex, resumeId, showToast])

  // 点击保存
  const saveClickHandler = async () => {
    if (!(await formRef.current?.validateAndToast())) {
      return
    }

    if (mode === 'confirm') {
      updateListItem(formRef.current!.getData(), projExpIndex)
      disableAlertBeforeUnload()
      navigateBack()
    } else {
      const fn = projExpId === 0 ? appendProjExpApi : updateProjExpApi
      fn(formRef.current!.getData())
        .then(() => {
          disableAlertBeforeUnload()
          refreshCurrentResume()
          navigateBack()
        })
        .catch((err: IFormError<IProjectExp>) => {
          formRef.current?.validateAndToastByResponse(err)
        })
    }
  }

  // 点击删除；新建时无删除按钮
  const deleteClickHandler = async () => {
    if (!(await showModal({ text: '确定要删除该条项目经历？', confirmText: '删除' }))) {
      return
    }

    if (mode === 'confirm') {
      omitListItem(projExpIndex)
      disableAlertBeforeUnload()
      navigateBack()
    } else {
      deleteProjExpApi(projExpId)
        .then(() => {
          disableAlertBeforeUnload()
          refreshCurrentResume()
          navigateBack()
        })
        .catch((err: IFormError<IProjectExp>) => {
          showToast({ content: err.errorMessage })
        })
    }
  }

  useDidShow(() => {
    enableAlertBeforeUnload('现在退出，您编辑的信息将不会保存，是否继续？')
  })

  useDidHide(disableAlertBeforeUnload)

  const dateRangeVlidate = val => {
    if (!val?.[0]) {
      return new Error('请选择开始时间')
    } else if (!val?.[1]) {
      return new Error('请选择结束时间')
    } else {
      if (val[1].startsWith('0000')) {
        return null
      }

      return dayjs(val[1]).valueOf() >= dayjs(val[0]).valueOf()
        ? null
        : new Error('结束时间不能早于开始时间')
    }
  }

  const projectNameCheckSensitiveHandler = () => {
    const projectNameString = formRef.current?.data.name || ''
    if (projectNameString.length < 2) {
      formRef.current?.setFieldError('name', true, '项目名称至少输入2个字')
      showToast({ content: '项目名称至少输入2个字' })

      return
    }

    checkSensitiveWordsApi(projectNameString).then(pass => {
      if (!pass) {
        formRef.current?.setFieldError('name', true, '项目名称中包含敏感词，请修改')
        showToast({ content: '项目名称中包含敏感词，请修改' })
      }
    })
  }

  return (
    <MainLayout border navBarTitle="项目经历" className="edit-proj-exp">
      <Form data={projExpInfo} ref={formRef}>
        <FormItem field="name">
          <Input
            title="项目名称"
            placeholder="请填写项目名称"
            onBlur={projectNameCheckSensitiveHandler}
            minLength={2}
            maxlength={20}
            required
          />
        </FormItem>

        <FormItem field="duringDate" validation={dateRangeVlidate}>
          <DateRangePicker
            title="项目时间"
            end={currentDay}
            placeholderStart="开始时间"
            placeholderEnd="结束时间"
            required
          />
        </FormItem>

        <FormItem field="workDesc">
          <Textarea
            title="项目描述"
            pageTitle="请填写项目描述"
            placeholder="请填写项目描述（选填）"
            inputPlaceholder="这个项目的目的是XXX，我在其中主要负责XXX内容，最终目标达成情况为XXX"
            minLength={5}
            checkSensitive
          />
        </FormItem>
      </Form>

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

export default EditProjExp
