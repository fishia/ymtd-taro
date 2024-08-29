import { Text, View } from '@tarojs/components'
import { navigateTo, useDidShow, hideLoading, showLoading } from '@tarojs/taro'
import React, { useState } from 'react'

import { fetchUserIntentsApi } from '@/apis/resume'
import { updateUserStatusApi } from '@/apis/user'
import Empty from '@/components/Empty'
import { IResumeIntentInfo } from '@/def/resume'
import { useCurrentUserInfo } from '@/hooks/custom/useUser'
import MainLayout from '@/layout/MainLayout'
import { useResumeOptions } from '@/services/ResumeService'
import { dispatchSetUser } from '@/store'
import { sendHongBaoEvent } from '@/utils/dataRangers'

import Form, { FormItem, useFormRef } from '../components/Form'
import Picker from '../components/Picker'
import AddIntentButton from './components/addIntentButton'
import IntentInfoCard from './components/intentInfoCard'

import './index.scss'

const IntentInfoList: React.FC = () => {
  const resumeOptions = useResumeOptions()
  const formRef = useFormRef<IResumeIntentInfo>()
  const [intentList, setIntentList] = useState<IResumeIntentInfo[]>([])
  const userInfo = useCurrentUserInfo()!
  const [status, setStatus] = useState<number>()

  useDidShow(async () => {
    showLoading({ title: '加载中...' })
    setStatus(userInfo?.status)
    //获取职位列表
    fetchUserIntentsApi()
      .then(list => {
        hideLoading()
        setIntentList(list)
      })
      .catch(hideLoading)
  })

  // 点击保存
  const saveClickHandler = value => {
    if (!formRef.current?.validate()) {
      return
    }

    sendHongBaoEvent('JobSeekingStatus')
    updateUserStatusApi(value).then(() => {
      dispatchSetUser({ ...userInfo, status: value })
      setStatus(value)
    })
  }

  return (
    <MainLayout border navBarTitle="管理求职意向" className="intent-info-list-index">
      <View className="intent-info-list-index__title">
        管理求职意向（<Text className="intent-info-list-index__highlight">{intentList.length}</Text>
        /3）
      </View>
      <View className="intent-info-list-index__subTitle">“求职意向”的不同，推荐的职位也会不同</View>
      <View className="intent-info-list-index__cardWrapper">
        {intentList.length ? (
          intentList.map((item, i) => (
            <IntentInfoCard
              key={i}
              data={item}
              onClick={() => {
                sendHongBaoEvent('IntentionCardClick')
                navigateTo({ url: `/weapp/resume/edit-intent-info/index?id=${item.id}` })
              }}
            />
          ))
        ) : (
          <Empty text="暂无求职意向，点击下方按钮添加" className="intent-info-list__no-intent" />
        )}
      </View>
      {intentList.length < 3 ? (
        <AddIntentButton
          onClick={() => {
            sendHongBaoEvent('IntentionContAddClick')
            navigateTo({ url: `/weapp/resume/edit-intent-info/index?counts=${intentList.length}` })
          }}
        />
      ) : null}
      <Form data={{ status }} ref={formRef}>
        <FormItem field="status">
          <Picker
            title="求职状态"
            placeholder="请选择求职状态"
            range={resumeOptions.mpc_status}
            defaultSelectValue="4"
            border={false}
            onChange={saveClickHandler}
          />
        </FormItem>
      </Form>
    </MainLayout>
  )
}

export default IntentInfoList
