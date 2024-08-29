import { View, Image, Button, Swiper, SwiperItem, Text } from '@tarojs/components'
import { navigateTo, useDidShow, eventCenter, getStorageSync } from '@tarojs/taro'
import c from 'classnames'
import _ from 'lodash'
import { last } from 'ramda'
import React, { useCallback, useEffect, useState } from 'react'

import NewPng from '@/assets/imgs/new.png'
import LoginButton from '@/components/LoginButton'
import { onJumpStickyFn } from '@/components/Popup/resumeStickyPopup'
import RedDotted from '@/components/RedDotted'
import {
  HR_HOST,
  DEFAULT_MALE_AVATAR,
  DEFAULT_FEMALE_AVATAR,
  SUBSCRIBE_PAGE_URL,
  STATIC_MP_IMAGE_HOST,
  APP_DOWNLOAD,
  HR_BASE_HOST,
  APP_IS_OLD_USER,
} from '@/config'
import { defaultUserInfo, SexType } from '@/def/user'
import { useShowLoginPopup } from '@/hooks/custom/usePopup'
import { bestEmployerByToken } from '@/hooks/custom/usePopupData'
import { useCurrentResume } from '@/hooks/custom/useResume'
import useShowModal from '@/hooks/custom/useShowModal'
import {
  useClearUserNoticeCount,
  useCurrentUserInfo,
  useIsLogin,
  useLogout,
  useUpdateCurrentUserInfo,
} from '@/hooks/custom/useUser'
import { useIsShowSubscribeCard, useRefreshIsFollowWx } from '@/hooks/message'
import { senceData } from '@/hooks/message/maiSocket'
import MainLayout from '@/layout/MainLayout'
import { showSensitiveBothNameAndPhone } from '@/services/StringService'
import appStore from '@/store'
import { sendDataRangersEventWithUrl, sendHongBaoEvent, sendResumeEvent } from '@/utils/dataRangers'
import { pxTransform } from '@/utils/taroUtils'
import { combineStaticUrl, isShowSpringWar, jumpToWebviewPage } from '@/utils/utils'

import SwiperBar from '../job/components/SwiperBar'
import Badge from './components/Badge'
import Cell from './components/Cell'
import License from './components/License'
import MyRecommend from './components/MyRecommend'
import SubscriptionCard from './components/subscriptionCard'

import './index.scss'

const MyPage: React.FC = () => {
  const [isClickFollowWx, setIsClickFollowWx] = useState<boolean>(false)
  const showLoginPopup = useShowLoginPopup()
  const showModal = useShowModal({ mode: 'thenCatch' })
  const updateUserInfo = useUpdateCurrentUserInfo()
  //const [open, closeGuide] = useShowGuidePopup()

  const isLogined = useIsLogin()
  const logout = useLogout()
  const clearNotice = useClearUserNoticeCount()
  const userInfo = useCurrentUserInfo() || defaultUserInfo
  const resume = useCurrentResume()
  const showSubscribeCard = useIsShowSubscribeCard()
  const refreshIsFollowWx = useRefreshIsFollowWx()
  const [isClosed, setIsClosed] = useState(true)
  const [current, setCurrent] = useState(0)

  const favoriteCount =
    (userInfo?.favorite_ids?.length ?? 0) +
    (userInfo?.favorite_company_ids?.length ?? 0) +
    (userInfo?.favorite_article_ids?.length ?? 0)

  const appliedRecordCount = userInfo.profile?.apply_ids?.length ?? 0
  const profileTop = userInfo.profileTop
  const profileTopADExpose = userInfo.profileTopADExpose
  const profileTopEffectDesc = userInfo.profileTopEffectDesc
  const recordNoticeCount = userInfo.profile?.unread_apply_count ?? 0

  const profileAvatar = userInfo.profile?.avatar
  const profileSex = userInfo.profile?.sex
  const avatarUrl = profileAvatar
    ? combineStaticUrl(profileAvatar)
    : profileSex === SexType.girl
    ? DEFAULT_FEMALE_AVATAR
    : DEFAULT_MALE_AVATAR

  const accountName = isLogined
    ? showSensitiveBothNameAndPhone(userInfo.profile?.name || userInfo.name || userInfo.phone)
    : '未登录/注册'

  const resumeText = isLogined
    ? userInfo.profile && resume
      ? `简历完整度${resume.integrity ?? 0}%`
      : '暂无简历'
    : ''

  const sendRangersData = {
    type: '我的页面顶部',
    Login_failure_or_not: getStorageSync(APP_IS_OLD_USER) ? '是' : '否',
  }

  // 验证是否已登录
  const checkLogin = async () => {
    if (isLogined) {
      return Promise.resolve()
    } else {
      showLoginPopup()
      return Promise.reject()
    }
  }

  // 登录用户直接跳转到 url，未登录用户则弹出登录弹窗
  const navigateWithLogin = url => () => {
    if (url === '/weapp/resume/intent-info-list/index') {
      sendHongBaoEvent('IntentionAddClick')
    }
    if (url === '/weapp/my/subscription/index') {
    } else if (url === '/weapp/my/privacy/index') {
      sendHongBaoEvent('PrivacySettingClick')
    }
    checkLogin()
      .then(() => void navigateTo({ url }))
      .catch(_.noop)
  }

  // 点击简历块的处理
  const handleResumeClick = () => {
    if (isLogined) {
      if (userInfo.profile) {
        navigateTo({ url: '/weapp/resume/index/index' })
      } else {
        sendResumeEvent('CreateResumeClick')
        navigateTo({ url: '/weapp/resume/create-resume/index' })
      }
      return
    }

    checkLogin()
      .then(() => void navigateTo({ url: '/weapp/resume/create-resume/index' }))
      .catch(_.noop)
  }

  const handleRecordClick = () => {
    checkLogin()
      .then(() => void clearNotice('record'))
      .then(() => void navigateTo({ url: '/weapp/my/record/index' }))
      .catch(_.noop)
  }

  // 点击注销
  const handleLoginOut = useCallback(() => {
    showModal({ content: '退出当前账号?' })
      .then(() => {
        setIsClosed(true)
        logout()
      })
      .catch(err => {
        console.log(err)
      })
  }, [showModal, logout])

  // 点击关注公众号
  const openNoticeHandler = () => {
    sendHongBaoEvent('NewJDNoticePopupClick', {
      is_notice_open: '是',
    })
    setIsClickFollowWx(true)
    jumpToWebviewPage(SUBSCRIBE_PAGE_URL)
  }

  // onShow 拉取订阅状态
  useDidShow(() => {
    sendDataRangersEventWithUrl('register_and_login_Expose', sendRangersData)

    if (isLogined) {
      updateUserInfo()
    } else {
      sendDataRangersEventWithUrl('register_and_login_Expose', {
        event_name: '注册登录引导',
        type: '添加求职意向',
        page_name: '我的页面',
      })
    }

    if (isClickFollowWx) {
      setIsClickFollowWx(false)
      refreshIsFollowWx()
    }

    if (!isClosed) {
      eventCenter.trigger('showMySubscribeCard')
    }
  })

  useEffect(() => {
    eventCenter.on('showMySubscribeCard', () => {
      const currentPage = last(getCurrentPages())
      if (currentPage && currentPage?.route === 'weapp/pages/my/index')
        sendHongBaoEvent('NewJDNoticePopupExpose')
      setIsClosed(false)
    })
    eventCenter.on('closeMySubscribeCard', () => {
      const currentPage = last(getCurrentPages())
      if (currentPage && currentPage?.route === 'weapp/pages/my/index')
        sendHongBaoEvent('NewJDNoticePopupClick', { is_notice_open: '否' })
      setIsClosed(true)
    })
  }, [])

  useEffect(() => {
    setIsClosed(!showSubscribeCard)
    if (showSubscribeCard) {
      eventCenter.trigger('showMySubscribeCard')
    }
  }, [showSubscribeCard])

  const onJumpToDownLoadAppPage = () => {
    sendDataRangersEventWithUrl('AppClick')

    // 公众号文章链接
    jumpToWebviewPage(APP_DOWNLOAD)
  }

  const goDraw = () => {
    if (isLogined) {
      sendDataRangersEventWithUrl('EventPopupClick', {
        event_name: '医药人升职季',
        type: '我的页面banner',
      })
      jumpToWebviewPage(bestEmployerByToken(`${HR_BASE_HOST}/springWar/luckyDraw/c-mini`))
    } else {
      showLoginPopup()
    }
  }

  useEffect(() => {
    if (current === 2) {
      sendDataRangersEventWithUrl('EventPopupExpose', {
        event_name: '医药人升职季',
        type: 'banner',
      })
    }
  }, [current])

  const onJumpSticky = () => {
    sendDataRangersEventWithUrl('EventPopupClick', {
      event_name: '简历置顶',
      type: '我的页面',
      button_name: '置顶中',
    })

    onJumpStickyFn()
  }

  const onClickBanner = () => {
    sendDataRangersEventWithUrl('EventPopupClick', {
      event_name: '简历置顶服务',
      type: 'banner',
    })

    onJumpStickyFn()
  }

  return (
    <MainLayout className="my-index">
      <View className="my-index__bg">
        <View className="my-index__top">
          <LoginButton
            onClick={handleResumeClick}
            className="my-index__basic"
            sendRangersData={{ ...sendRangersData, button_name: '注册登录' }}
          >
            <View className={c('my-index__basic_left')}>
              <View className="my-index__basic__text">
                <View className="my-index__basic__nameWrappper">
                  <View className="my-index__basic__name">
                    {accountName}
                    <RedDotted visible={!userInfo?.wechat} />
                  </View>
                  {userInfo?.talentTag && (
                    <View className="my-index__basic__tag">{userInfo?.talentTag}</View>
                  )}
                </View>
                <View className="my-index__basic__info">{resumeText}</View>
              </View>
            </View>
            <View className="my-index__basic_right">
              {userInfo?.talentPortrait && (
                <Image
                  src={combineStaticUrl(userInfo?.talentPortrait)}
                  className="my-index__basic__pendeant"
                  mode="aspectFit"
                />
              )}
              <Image className="my-index__basic__avatar" src={avatarUrl} mode="aspectFit" />
              {isLogined && (
                <View className="my-index__basic__arrow">
                  {userInfo.profile ? '编辑简历' : '创建简历'}
                </View>
              )}
            </View>
          </LoginButton>
          {isLogined && (
            <View className="my-index__notice">
              <View onClick={handleRecordClick} className="my-index__record">
                <View className="my-index__count">
                  {appliedRecordCount}
                  <Badge number={recordNoticeCount} />
                </View>
                <View className="my-index__count-title">投递记录</View>
              </View>

              <View
                onClick={navigateWithLogin('/weapp/my/favorite/index')}
                className="my-index__record"
              >
                <View className="my-index__count">{favoriteCount || 0}</View>
                <View className="my-index__count-title">我的收藏</View>
              </View>
            </View>
          )}
          {profileTop ? (
            <View className="my-index__resume__sticky" onClick={onJumpSticky}>
              <Image src="https://oss.yimaitongdao.com/mp/resumeSticky/resume-sticky-my.png" />
              <View className="my-index__resume__sticky__desc">{profileTopEffectDesc}</View>
            </View>
          ) : null}
        </View>
      </View>
      {!isLogined && <MyRecommend />}
      {isClosed ? null : (
        <SubscriptionCard
          title={
            <View>
              <View className="icon iconfont iconwarning-circle-fill" />
              您还未开启「新职位发布」通知
            </View>
          }
          primaryButtonText="去开启"
          primaryButtonSingle
          onPrimaryButtonClick={openNoticeHandler}
          onSubButtonClick={() => {
            eventCenter.trigger('closeMySubscribeCard')
            eventCenter.trigger('closeMessageSubscribeCard')
          }}
          tipText="开启通知后，我们将在第一时间，将和您匹配的最新职位信息，通过微信公众号发送给您。"
          showClear
        />
      )}
      <View className="my-index__menu">
        {isLogined && (
          <View className="my-index__cell-split">
            <Cell
              title="求职意向"
              icon="icona-qiuzhiyixiang2x"
              onClick={navigateWithLogin('/weapp/resume/intent-info-list/index')}
            />

            <Cell
              title="设置"
              icon="icona-yinsixieyi2x"
              onClick={navigateWithLogin('/weapp/my/privacy/index')}
            />
          </View>
        )}
        <View className="my-index__cell-split">
          <SwiperBar type={47} style={{ height: pxTransform(128) }}></SwiperBar>
        </View>
        {/* <Swiper
          className="my-index-swiper"
          style={{ height: '70px' }}
          indicatorDots
          indicatorColor="#fff"
          indicatorActiveColor="#4773FF"
          autoplay
          circular
          onChange={e => {
            setCurrent(e.detail.current)
          }}
        >
          {profileTopADExpose && !profileTop ? (
            <SwiperItem>
              <Image
                className="my-index__image"
                src="https://oss.yimaitongdao.com/mp/resumeSticky/resume-sticky-banner-mp.png"
                mode="scaleToFill"
                onClick={onClickBanner}
              />
            </SwiperItem>
          ) : null}
          <SwiperItem>
            <Image
              className="my-index__image"
              onClick={onJumpToDownLoadAppPage}
              src={`${STATIC_MP_IMAGE_HOST}app_download.png`}
              mode="scaleToFill"
            />
          </SwiperItem>
          <SwiperItem>
            <Image
              className="my-index__image"
              onClick={() => jumpToWebviewPage('https://mp.weixin.qq.com/s/3KMbXA1yriVH6BmOH81ioA')}
              src={`${STATIC_MP_IMAGE_HOST}helper_bg1.png`}
              mode="scaleToFill"
            />
          </SwiperItem>
          {userInfo?.dragonAwardTab && isShowSpringWar() ? (
            <SwiperItem>
              <Image
                className="my-index__image"
                onClick={goDraw}
                src={`${STATIC_MP_IMAGE_HOST}activity-date.png`}
                mode="scaleToFill"
              />
            </SwiperItem>
          ) : null}
        </Swiper> */}
        {/* <Button className="my-index__feedback" onClick={() => jumpToWebviewPage('https://mp.weixin.qq.com/s/3KMbXA1yriVH6BmOH81ioA')}>
          <Image
            className="my-index__image"
            src={`${STATIC_MP_IMAGE_HOST}helper_bg1.png`}
            mode="scaleToFill"
          />
        </Button> */}
        <View className="my-index__cell-split">
          <Cell
            title="商务合作"
            icon="icona-shangwuhezuo2x"
            onClick={() => void navigateTo({ url: '/weapp/my/cooperation/index' })}
          />

          <Cell
            title="我要招人"
            icon="icona-woyaozhaoren2x"
            onClick={() => {
              if (process.env.TARO_ENV === 'h5') {
                window.location.href = HR_HOST
              } else {
                navigateTo({
                  url: '/weapp/landing/hr/index',
                })
              }
            }}
          />
        </View>
        <View className="my-index__cell-split">
          <Button className="my-index__feedback" openType="contact">
            <Cell title="投诉反馈" icon="icontousufankui" />
          </Button>

          <Cell
            title="关于我们"
            icon="icona-guanyuwomen2x"
            onClick={() => void navigateTo({ url: '/weapp/my/about/index' })}
          />
          {/* <Cell
            title="关于我们111"
            icon="icona-guanyuwomen2x"
            onClick={() =>
              void navigateTo({ url: `/weapp/MAI/chat/index??sence=${senceData.PROFILE}` })
            }
          /> */}

          {isLogined && (
            <>
              <Cell title="退出登录" icon="icona-tuichudenglu2x" onClick={handleLoginOut} />
              {userInfo?.dragonAwardTab ? (
                <Cell
                  title={
                    <View>
                      我的奖品
                      <Text className="font24" style={{ color: '#7B7F97' }}>
                        （2024升职季）
                      </Text>
                      <Image src={NewPng} className="my-index__cell-new" />
                    </View>
                  }
                  icon="iconwodejiangpin"
                  onClick={() => {
                    sendDataRangersEventWithUrl('PrizeClick', {
                      event_name: '我的',
                      user_agent: '其他',
                      button_name: '中奖记录',
                    })
                    navigateTo({ url: '/weapp/my/award/index' })
                  }}
                />
              ) : null}
            </>
          )}
        </View>
      </View>

      <License />
    </MainLayout>
  )
}

export default MyPage
