import { View } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import React, { useEffect, useState } from 'react'

import { fetchChattingJobCardInfoApi } from '@/apis/message'
import { IJob, JobStatusType } from '@/def/job'
import { IMessageItem, IMRoleType, MessageType } from '@/def/message'
import useToast from '@/hooks/custom/useToast'

import AvatarMessage from '../AvatarMessage'
import JobCard from './JobCard'

import './index.scss'

export type IJobCardMessageContent = {
  jd_id: number
  jd_name: string
  initiator: IMRoleType
}

export interface IJobCardMessageProps extends IMessageItem {
  messageType: MessageType.JOB_CARD
  content: IJobCardMessageContent
}

const TipsText: React.FC<{ text: string }> = ({ text }) => (
  <View className="loading">
    <View className="loading-text">{text}</View>
  </View>
)

const JobCardMessage: React.FC<IJobCardMessageProps> = props => {
  const { content, hr_id } = props
  const showToast = useToast()

  const [jobInfo, setJobInfo] = useState<IJob>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isError, setIsError] = useState<boolean>(false)

  const isOffline = jobInfo?.status === JobStatusType.OFF_LINE

  const jobCardClickHandler = () => {
    if (isOffline) {
      showToast({ content: '该职位已下线' })
      return
    }
    navigateTo({
      url: `/weapp/job/job-detail/index?jd_id=${content.jd_id}&&hr_id=${hr_id}`,
    })
  }

  useEffect(
    () => {
      if (!content?.jd_id) {
        setIsError(true)
        return
      }

      fetchChattingJobCardInfoApi(content.jd_id)
        .then(setJobInfo)
        .then(() => void setIsLoading(false))
        .catch(() => void setIsError(true))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <AvatarMessage {...props} className="message-item__job-card">
      <View className="message-item__job-card__body">
        {isError ? (
          <TipsText text="职位信息加载失败" />
        ) : isLoading ? (
          <TipsText text="加载职位信息..." />
        ) : (
          <JobCard
            onClick={jobCardClickHandler}
            className="message-item__job-card__card"
            data={jobInfo!}
            messageCard
            simple
          />
        )}
      </View>
    </AvatarMessage>
  )
}

export default JobCardMessage
