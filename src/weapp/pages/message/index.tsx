import { View } from '@tarojs/components'
import {
  hideLoading,
  navigateTo,
  redirectTo,
  showLoading,
  stopPullDownRefresh,
  switchTab,
  useDidShow,
  usePullDownRefresh,
  useReachBottom,
  eventCenter,
  pxTransform,
} from '@tarojs/taro'
import c from 'classnames'
import { last } from 'ramda'
import React, { useEffect, useRef, useState } from 'react'

import { fetchRecommendCount } from '@/apis/message'
import picImg from '@/assets/imgs/popup/phone.png'
import CustomNavTab, { statusBarHeight, tabItem } from '@/components/NavTab'
import { FixedBottomPopup } from '@/components/Popup'
import ResumeStickyAd from '@/components/ResumeStickyAd'
import { SUBSCRIBE_PAGE_URL } from '@/config'
import { IConversationItem } from '@/def/message'
import { useFixedBottomPopup, useFixedBottomPupupRef } from '@/hooks/custom/usePopup'
import { useCurrentResume } from '@/hooks/custom/useResume'
import useToast from '@/hooks/custom/useToast'
import { useIsLogin, useUpdateCurrentUserInfo } from '@/hooks/custom/useUser'
import {
  useConversationItems,
  useAppendConversations,
  useInitChatByTargetId,
  useRefreshUnreadMessageCount,
  useIsShowSubscribeCard,
  useRefreshIsFollowWx,
  useIsInitConversations,
  setTemporaryClosureSubscribe,
} from '@/hooks/message'
import MainLayout from '@/layout/MainLayout'
import {
  connectIM,
  ensureIMConnect,
  getIMConnectStatus,
  refreshConversations,
} from '@/services/IMService'
import { sendHongBaoEvent } from '@/utils/dataRangers'
import { reportLog } from '@/utils/reportLog'
import { jumpToWebviewPage } from '@/utils/utils'

import SubscriptionCard from '../my/components/subscriptionCard'
import ConversationItem from './components/ConversationItem'
import InteractionItem from './components/InteractionItem'
import { IIteractionItem, deafultIteractionData, nowTime } from './components/InteractionItem/const'
import NoMessage from './components/NoMessage'
import SubscriptionPopupCard from './components/SubscriptionPopupCard'
import Interact, { InteractRef } from './components/interact'

import './index.scss'

const MessagePage: React.FC = () => {
  const showToast = useToast()
  const isLogined = useIsLogin()
  const hasResume = !!useCurrentResume()
  const refreshCurrentUser = useUpdateCurrentUserInfo()

  const appendConversationItems = useAppendConversations()
  const refreshUnreadMessageCount = useRefreshUnreadMessageCount()
  const isInitConversations = useIsInitConversations()
  const showSubscribeCard = useIsShowSubscribeCard()
  const refreshIsFollowWx = useRefreshIsFollowWx()

  const initChat = useInitChatByTargetId()
  const conversationItems = useConversationItems()
  const fixedBottomPopupRef = useFixedBottomPupupRef()
  const { open, close } = useFixedBottomPopup()
  const myRef = useRef<InteractRef>(null)

  const [isAppendLoading, setIsAppendLoading] = useState<boolean>(false)
  const [isClickFollowWx, setIsClickFollowWx] = useState<boolean>(false)
  const [refresh, setRefresh] = useState<number>(0)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isClosed, setIsClosed] = useState(true)
  const [tabList, setTabList] = useState<tabItem[]>([{ title: '消息' }, { title: '互动' }])

  const [interactionItems, setInteractionItems] = useState<IIteractionItem[]>(deafultIteractionData)

  // 触底加载更多消息
  const appendConversationList = () => {
    if (isAppendLoading || currentIndex || !conversationItems.length) {
      return
    }

    setIsAppendLoading(true)
    appendConversationItems()
      .then(() => {
        setIsAppendLoading(false)
      })
      .catch(() => {
        setIsAppendLoading(false)
      })
  }

  // 初次启动
  // useEffect(
  //   () => {
  //     refreshCurrentUser().catch(() => {
  //       // 未登录用户，直接跳转即可
  //       redirectTo({ url: '/weapp/general/login/index' })
  //     })
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   []
  // )

  // 触底加载更多消息
  useReachBottom(appendConversationList)

  // 下拉刷新消息列表
  usePullDownRefresh(() => {
    // 如果连接已断开则重连，重连失败时需重新登录
    if (!getIMConnectStatus()) {
      connectIM()
      // .catch(() => void redirectTo({ url: '/weapp/general/login/index' }))

      return
    }

    setIsAppendLoading(true)

    refreshIsFollowWx()
    refreshUnreadMessageCount()

    refreshConversations()
      .then(() => {
        setIsAppendLoading(false)
        stopPullDownRefresh()
      })
      .catch(() => {
        connectIM()
        // .catch(() => void redirectTo({ url: '/weapp/general/login/index' }))
      })
  })

  const getIteractionData = () => {
    fetchRecommendCount().then(res => {
      const {
        favoriteCount,
        favoriteName,
        favoriteTime,
        newCompanyJdCount,
        newJdCompanyName,
        newJdCompanyTime,
        viewCount,
        viewName,
        viewTime,
      } = res
      setInteractionItems([
        {
          iteractionKey: 2,
          company_name: newJdCompanyName,
          count: newCompanyJdCount,
          iteractionTime: newJdCompanyTime,
        },
        {
          iteractionKey: 1,
          company_name: viewName,
          count: viewCount,
          iteractionTime: viewTime,
        },
        {
          iteractionKey: 0,
          company_name: favoriteName,
          count: favoriteCount,
          iteractionTime: favoriteTime,
        },
      ])
    })
  }

  // onShow 拉取订阅状态
  useDidShow(() => {
    getIteractionData()
    close()
    setRefresh(refresh + 1)
    if (isClickFollowWx) {
      setIsClickFollowWx(false)
      refreshIsFollowWx()
    }
    //关注公众号返回小程序自动关闭底部弹窗
    if (!isClosed) eventCenter.trigger('showMessageSubscribeCard')
  })

  useEffect(() => {
    eventCenter.on('showMessageSubscribeCard', () => {
      const currentPage = last(getCurrentPages())
      if (currentPage && currentPage?.route === 'weapp/pages/message/index')
        sendHongBaoEvent('SubPopupExpose')
      setIsClosed(false)
    })
    eventCenter.on('closeMessageSubscribeCard', () => {
      const currentPage = last(getCurrentPages())
      if (currentPage && currentPage?.route === 'weapp/pages/message/index')
        sendHongBaoEvent('SubPopupClick', { is_notice_me: '否' })
      setTemporaryClosureSubscribe()
      setIsClosed(true)
    })
  }, [])

  useEffect(() => {
    setIsClosed(!showSubscribeCard)
    if (showSubscribeCard) {
      eventCenter.trigger('showMessageSubscribeCard')
    }
  }, [showSubscribeCard])

  // 无消息，点击跳转职位列表
  const noMessageClickHandler = () => void switchTab({ url: '/weapp/pages/job/index' })

  // 点击关注公众号
  const openNoticeHandler = () => {
    sendHongBaoEvent('OpenPopupClick', {
      is_notice_open: '是',
    })
    setIsClickFollowWx(true)
    jumpToWebviewPage(SUBSCRIBE_PAGE_URL)
  }

  const interactionItemsClick = (interaction: IIteractionItem) => {
    setCurrentIndex(1)
    myRef?.current?.goTab(interaction.iteractionKey)
  }

  // 点击消息进入对话
  const conversationItemClick = async (conversation: IConversationItem) => {
    showLoading({ title: '加载中...' })

    const isConnected = await ensureIMConnect()
    if (!isConnected) {
      reportLog('core', 'im').error('IM进入对话时未连接 [conversationItemClick]')

      hideLoading()
      showToast({ content: '初始化聊天失败，请重新启动小程序或重新登录' })

      return
    }

    initChat(conversation.targetId, false)
      .then(() => {
        hideLoading()
        navigateTo({
          url: '/weapp/message/chat/index?targetId=' + encodeURIComponent(conversation.targetId),
        })
      })
      .catch(err => {
        reportLog('core', 'im').error('IM初始化失败 [initChat]:', err)

        hideLoading()
        showToast({ content: '加载聊天时出错' })
      })
  }

  const handleTabClick = i => {
    setCurrentIndex(i)
    if (i) {
      myRef?.current?.rememberLatestId()
      myRef?.current?.clearFirstDot()
    }
  }

  const renderResumeStickyAd = () => {
    return <ResumeStickyAd adKey="chat" className="message__ad" />
  }

  const InteractionItemBlock = () => {
    return (
      <>
        {isLogined &&
          !currentIndex &&
          interactionItems.map(interaction => (
            <InteractionItem
              {...interaction}
              key={interaction.iteractionKey}
              onClick={() => void interactionItemsClick(interaction)}
            />
          ))}
      </>
    )
  }

  return (
    <MainLayout
      className="message"
      navBarTitle="我的消息"
      style={{
        paddingTop: `calc(${statusBarHeight}px + ${pxTransform(80)})`,
      }}
    >
      <CustomNavTab
        tabList={isLogined ? tabList : [tabList[0]]}
        current={currentIndex}
        onClick={handleTabClick}
      />
      {isLogined && (
        <View className={c({ show: currentIndex, hide: !currentIndex })}>
          <Interact
            ref={myRef}
            onChangeTabs={bool => {
              setTabList([tabList[0], { ...tabList[1], new: bool }])
            }}
          />
        </View>
      )}

      {!currentIndex ? renderResumeStickyAd() : null}
      {conversationItems.length === 0 && !isAppendLoading && !currentIndex ? (
        <>
          <InteractionItemBlock />
          <NoMessage
            // isLoading={!isInitConversations && hasResume}
            onButtonClick={noMessageClickHandler}
          />
        </>
      ) : (
        <View className={c({ show: !currentIndex, hide: currentIndex })}>
          <View className="message__list">
            {isClosed ? null : (
              <SubscriptionCard
                className="message_card"
                title="收到以下消息时通知我"
                primaryButtonText="有消息通知我"
                subButtonText="暂不接收消息"
                onPrimaryButtonClick={() => {
                  sendHongBaoEvent('SubPopupClick', { is_notice_me: '是' })
                  //打开去关注的底部弹窗
                  open({
                    key: 'followwx',
                    showClear: false,
                    children: (
                      <SubscriptionPopupCard
                        picUrl={picImg}
                        subButtonText="暂不"
                        onPrimaryButtonClick={openNoticeHandler}
                        onSubButtonClick={() => {
                          sendHongBaoEvent('OpenPopupClick', {
                            is_notice_open: '否',
                          })
                          close()
                        }}
                      />
                    ),
                  })
                }}
                onSubButtonClick={() => {
                  eventCenter.trigger('closeMessageSubscribeCard')
                  eventCenter.trigger('closeMySubscribeCard')
                }}
                tipText={
                  <View className="message_card__tips">
                    <View>1、消息回复</View>
                    <View>2、面试通知</View>
                    <View>3、面试邀请</View>
                  </View>
                }
              />
            )}
            <InteractionItemBlock />
            {conversationItems.map(conversation => (
              <ConversationItem
                key={conversation.targetId}
                {...conversation}
                onClick={() => void conversationItemClick(conversation)}
              />
            ))}
          </View>
          <View className="message__tips">
            {isAppendLoading ? '加载中' : '仅展示最近6个月的聊天记录'}
          </View>
        </View>
      )}

      <FixedBottomPopup ref={fixedBottomPopupRef} />
    </MainLayout>
  )
}

export default MessagePage
