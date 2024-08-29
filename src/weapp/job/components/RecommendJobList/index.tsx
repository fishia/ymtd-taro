import { View, Navigator } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import _ from 'lodash'
import React, { useEffect } from 'react'
import { AtLoadMore } from 'taro-ui'

import JobCard from '@/components/JobCard'
// import ListTailLoginTips from '@/components/JobCard/ListTailLoginTips'
import { IProps, LoadStatusType } from '@/def/common'
import { IEventExposeParams, IJobWithIndex } from '@/def/job'
import { ExpChannelType } from '@/def/volcanoPoint'
import { useIsLogin } from '@/hooks/custom/useUser'
import { renderJobDetailUrlByParams } from '@/utils/utils'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import './index.scss'

export interface IRecommendJobListProps extends IProps {
  title?: string
  isDeliverButton?: boolean
  list: Array<IJobWithIndex>
  loadStatus?: LoadStatusType
  page?: number
  setList?: (e: Array<IJobWithIndex>) => void
}

const RecommendJobList = (props: IRecommendJobListProps): ReturnType<React.FC> => {
  const { title, isDeliverButton, list, loadStatus = 'more', setList = _.noop } = props
  const isLogin = useIsLogin()

  useEffect(() => {
    sendDataRangersEventWithUrl('EventPopupExpose', {
      recommend_no: list.length || '0',
      event_name: '职位详情页_相似职位推荐',
      page_name: '职位详情页'
    })
  }, [])

  return (
    <View className="recommend-jobList">
      {title && <View className="recommend-job-list__subtitle">
        <View className="recommend-job-list__subtitleItem">
          <View className="recommend-job-list__line" />
          <View className="recommend-job-list__subtitleText">{title}</View>
          <View className="recommend-job-list__line" />
        </View>
      </View>}
      <View className="recommend-job-list__list">
        {list.map((v, i) => {
          const eventExposeParams: IEventExposeParams = {
            jd_id: v.id,
            page_no: v.page_no,
            position_no: v.position_no,
            exp_channel: ExpChannelType.SAMEPOSITION,
            expose_id: v.exposeId,
            expName: v.expName,
            isSeed: v.isSeed,
            isVirtual: v.isVirtual,
          }
          return (
            <View key={v.id}>
              <JobCard
                className="recommend-job-list__card"
                data={v}
                eventExposeParams={eventExposeParams}
                relativeToClassName="job-detail__scrollview"
                isDeliverButton={isDeliverButton}
                showChatBtn
                onClick={() => {
                  const arr = [...list]
                  arr[i].isSeed = true
                  setList(arr)
                  navigateTo({
                    url: renderJobDetailUrlByParams({
                      ...eventExposeParams,
                      cardSource: "recommendCard",
                      tag: v?.tag,
                    }),
                  })
                }}
                onClickDetailRecommendBtn={() => {
                  sendDataRangersEventWithUrl('DeliverClick', {
                    to_user_id: v.hr?.id,
                    jd_id: v.id,
                    recommend_no: list.length,
                    event_name: '职位详情页_相似职位推荐',
                    page_name: '职位详情页'
                  })
                }}
              />
            </View>
          )
        })}

        {!isLogin && loadStatus === 'noMore' ? null : (
          <AtLoadMore
            noMoreText="暂无更多职位"
            loadingText="正在加载中~"
            moreText="加载更多~"
            status={loadStatus as any}
          />
        )}
      </View>
    </View>
  )
}

export default RecommendJobList
