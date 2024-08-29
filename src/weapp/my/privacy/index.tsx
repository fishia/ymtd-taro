import React from 'react'
import { hideLoading, showLoading, setStorageSync, navigateTo } from '@tarojs/taro'

import { setUserPrivacyApi, setJdRecommendApi } from '@/apis/user'
import { useCurrentUserInfo, useUpdateCurrentUserInfo } from '@/hooks/custom/useUser'
import useShowModal from '@/hooks/custom/useShowModal'
import { useRefreshHomePage } from '@/hooks/custom/useJob'
import MainLayout from '@/layout/MainLayout'
import Switch from '../components/Switch'
import { IS_JD_RECOMMAND } from '@/config'

import './index.scss'
import Cell from '../components/Cell'
import { sendHongBaoEvent } from '@/utils/dataRangers'
import { View } from '@tarojs/components'

const Privacy: React.FC = () => {
  const showModal = useShowModal()
  const updateCurrentUserInfo = useUpdateCurrentUserInfo()
  const refreshHomepageJobList = useRefreshHomePage()
  const userInfo = useCurrentUserInfo()!

  const isHideResume = !userInfo.is_open
  const isOpenRecommend = Boolean(userInfo.is_jd_recommend)

  const confirmSetResume = (currentIsHide: boolean) => {
    if (currentIsHide) {
      return true
    }

    return showModal({
      title: '提示',
      content: '隐藏简历时，除非您主动投递，企业不能查看您的简历，也不能与您联系',
    }).then(Boolean)
  }

  const handleChangeResume = async newIsHideStatus => {
    const newIsOpenStatus = !newIsHideStatus
    sendHongBaoEvent('HideResumeClick', { is_hide: newIsOpenStatus })

    showLoading({ title: '加载中...' })
    await setUserPrivacyApi(newIsOpenStatus)
    await updateCurrentUserInfo()
    hideLoading()
  }

  const confirmSetRecommend = (currentIsOpen: boolean) => {
    if (!currentIsOpen) {
      return true
    }

    return showModal({
      title: '提示',
      content:
        '关闭个性化职位推荐，我们将无法为您推荐职位。有合适的职位时，您也无法第一时间接收到通知。',
      confirmText: '仍要关闭',
      cancelText: '再考虑一下',
    }).then(Boolean)
  }

  const handleChangeRecommend = async newIsOpenRecommend => {
    showLoading({ title: '加载中...' })
    setStorageSync(IS_JD_RECOMMAND, newIsOpenRecommend)
    await setJdRecommendApi(newIsOpenRecommend)
    await updateCurrentUserInfo()
    refreshHomepageJobList()
    hideLoading()
  }

  return (
    <MainLayout className="my-privacy">
      <View className="card">
        <Cell
          title="屏蔽公司"
          onClick={() => {
            sendHongBaoEvent('BlockClick')
            navigateTo({ url: '/weapp/my/shielding_company/index' })
          }}
        />
        <Switch
          title="对所有招聘者隐藏简历"
          value={isHideResume}
          confirm={confirmSetResume}
          onChange={handleChangeResume}
        />
        <Switch
          title="个性化职位推荐"
          value={isOpenRecommend}
          confirm={confirmSetRecommend}
          onChange={handleChangeRecommend}
        />
        <Cell
          title="招呼语设置"
          onClick={() => {
            navigateTo({ url: '/weapp/message/greeting-word/index' })
          }}
        />
      </View>
    </MainLayout>
  )
}

export default Privacy
