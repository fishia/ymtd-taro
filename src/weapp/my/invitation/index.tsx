import { navigateTo } from '@tarojs/taro'
import React, { useEffect, useState } from 'react'

import { listRecommendedJobsApi } from '@/apis/user'
import LoadMore from '@/components/LoadMore'
import ScrollView from '@/components/ScrollView'
import { APP_DEF_PAGE_SIZE } from '@/config'
import { LoadStatusType } from '@/def/common'
import { IEventExposeParams, IJob, JobStatusType } from '@/def/job'
import useToast from '@/hooks/custom/useToast'
import { useCurrentUserInfo } from '@/hooks/custom/useUser'
import MainLayout from '@/layout/MainLayout'
import { renderJobDetailUrlByParams } from '@/utils/utils'

import InvitationJobCard from '../components/InvitationJobCard'
import NoInvitation from '../components/NoInvitation'

import './index.scss'

const Invitation: React.FC = () => {
  const showToast = useToast()
  const userInfo = useCurrentUserInfo()!

  const [pageNum, setPageNum] = useState<number>(1)
  const [list, setList] = useState<IJob[]>([])
  const [status, setStatus] = useState<LoadStatusType>('more')

  // 请求追加列表
  const appendList = () => {
    if (!userInfo.profile || status === 'loading' || status === 'noMore') {
      return
    }

    setStatus('loading')
    listRecommendedJobsApi(pageNum).then(pageData => {
      const listData = pageData.list.map(item => item.jd)

      setList([...list, ...listData])
      setPageNum(pageData.current + 1)
      setStatus(pageData.current * APP_DEF_PAGE_SIZE >= pageData.total ? 'noMore' : 'more')
    })
  }

  // 进入页面后初次加载
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(appendList, [])

  // 点击列表项
  const handleClick = (job: IJob, eventExposeParams: IEventExposeParams) => {
    if (job.status === JobStatusType.OK) {
      navigateTo({ url: renderJobDetailUrlByParams({ ...eventExposeParams, tag: job?.tag }) })
    } else {
      showToast({ content: '该职位已停止招聘' })
    }
  }

  // 没有更多且长度为 0 时渲染空状态
  if (!userInfo.profile || (status === 'noMore' && list.length <= 0)) {
    return (
      <MainLayout className="my-invitation">
        <NoInvitation />
      </MainLayout>
    )
  }

  return (
    <MainLayout className="my-invitation">
      <ScrollView lowerThreshold={300} loadMore={appendList} className="my-invitation__scrollview">
        {list.map((job, i) => {
          const eventExposeParams: IEventExposeParams = {
            jd_id: job.id,
            page_no: pageNum,
            position_no: (i % 10) + 1,
          }
          return (
            <InvitationJobCard
              onClick={() => handleClick(job, eventExposeParams)}
              key={job.id}
              data={job}
              eventExposeParams={eventExposeParams}
              relativeToClassName="my-invitation__scrollview"
            />
          )
        })}
        <LoadMore status={status} />
      </ScrollView>
    </MainLayout>
  )
}

export default Invitation
