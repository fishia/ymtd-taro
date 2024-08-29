import { View, Navigator } from '@tarojs/components'
import { eventCenter, useRouter } from '@tarojs/taro'
import c from 'classnames'
import React, { useEffect, useRef, useState } from 'react'

import { listJobsApi } from '@/apis/active-page'
import { batchShareCompanyApi, batchGeneratorCompanyCardsApi } from '@/apis/job'
import JobCard from '@/components/JobCard'
import LoadMore from '@/components/LoadMore'
import FixedBottomPopup, { fixedBottomPopupEventKey } from '@/components/Popup/fixedBottomPopup'
import ShareCard from '@/components/Popup/sharePopup'
import ScrollView from '@/components/ScrollView'
import { APP_DEF_PAGE_SIZE } from '@/config'
import { LoadStatusType } from '@/def/common'
import { IJob } from '@/def/job'
import { useShowLoginPopup, useFixedBottomPopup } from '@/hooks/custom/usePopup'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import { useIsLogin } from '@/hooks/custom/useUser'
import MainLayout from '@/layout/MainLayout'
import { checkMicroResumeStep, isMicroResume } from '@/services/AccountService'
import { encodeURLParams } from '@/services/StringService'
import store, { dispatchSetInviteCode } from '@/store'

import NoJob from '../../pages/job/components/NoJob'

import './index.scss'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

const JobBatchShare: React.FC = () => {
  const routerParams = useRouterParam()
  const router = useRouter()
  const fixedbottomPopupRef = useRef<any>(null)
  // scene 为字符串，分割，第一个为id请求列表，第二个为邀请码
  const defaultScene = routerParams.scene ? routerParams.scene : ''
  const [scene, jdInviteCode] = defaultScene.split(',')

  if (jdInviteCode) {
    dispatchSetInviteCode(jdInviteCode)
  }

  const isLogined = useIsLogin()
  const showLoginPopup = useShowLoginPopup()
  const { close, openSharePopup } = useFixedBottomPopup()

  const [pageNum, setPageNum] = useState<number>(1)
  const [list, setList] = useState<IJob[]>([])
  const [status, setStatus] = useState<LoadStatusType>('more')

  useEffect(() => {
    if (jdInviteCode) {
      sendDataRangersEventWithUrl('CooperatewithHeadhuntersMiniprogramsExpose')
    }
  }, [])

  useEffect(() => {
    eventCenter.on(
      router.path + fixedBottomPopupEventKey,
      (p, type = 'open') => void fixedbottomPopupRef.current?.[type](p)
    )
    return () => {
      eventCenter.off(router.path + fixedBottomPopupEventKey)
    }
  }, [router.path])
  // 请求追加列表
  const appendList = () => {
    if (!scene || status === 'loading' || status === 'noMore') {
      return
    }
    setStatus('loading')
    listJobsApi({
      // 注意此处 city_id 固定传 1，因为是必填项不传接口会报错，不能传当前城市否则列表显示不完整
      city_id: 1,
      page: pageNum,
      share_id: scene,
    }).then(pageData => {
      const listData = pageData.list

      setList([...list, ...listData])
      setPageNum(pageData.current + 1)
      setStatus('noMore')
    })
  }

  // 进入页面后初次加载
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(appendList, [])

  //批量分享职位
  const handleShared = () => {
    if (!isLogined) {
      showLoginPopup().then().catch()
      return
    }
    openSharePopup({
      key: 'share_jobs',
      showClear: false,
      overlayClickClose: true,
      className: 'custom_fixed_bottom',
      children: (
        <ShareCard
          onCancel={close}
          id={scene}
          generatorPhotosApi={batchGeneratorCompanyCardsApi}
          shareApi={batchShareCompanyApi}
        />
      ),
    })
  }
  const renderJobList = () => {
    return (
      <>
        <View className="job-batch-share-index__list">
          {list.map(v => (
            <View key={v.id}>
              <Navigator url={`/weapp/job/job-detail/index?jd_id=${v.id}`}>
                <JobCard className="job-batch-share-index__card" data={v} />
              </Navigator>
            </View>
          ))}
          <LoadMore status={status} />
        </View>
      </>
    )
  }
  // 没有更多且长度为 0 时渲染空状态
  if (status === 'noMore' && list.length <= 0) {
    return (
      <MainLayout className="job-batch-share-index">
        <NoJob />
      </MainLayout>
    )
  }
  return (
    <MainLayout className="job-batch-share-index">
      <ScrollView
        className="job-batch-share-index__scrollview"
        lowerThreshold={300}
        loadMore={appendList}
      >
        <View className="job-batch-share-index__container">{renderJobList()}</View>
      </ScrollView>
      {/* <View className="job-batch-share-index__submitbar">
        <View onClick={handleShared} className="job-batch-share-index__share">
          <View className={c('icon', 'iconfont', 'iconzhiweifenxiang')} />
          <View className="job-batch-share-index__share__text">分享给好友</View>
        </View>
      </View> */}
      <FixedBottomPopup ref={fixedbottomPopupRef} />
    </MainLayout>
  )
}

export default JobBatchShare
