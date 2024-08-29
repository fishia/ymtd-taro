import { View, Image } from '@tarojs/components'
import { switchTab, navigateTo, eventCenter } from '@tarojs/taro'
import { FC, useEffect, useState } from 'react'
import { AtBadge } from 'taro-ui'

import weappConfig from '@/app.config'
import { addFavoritePopupEventKey } from '@/components/Popup/addFavoritePopup'
import RedDotted from '@/components/RedDotted'
import ToastTips from '@/components/ToastTips'
import useOnce, { unreadMessageTips, showGuideTips } from '@/hooks/custom/useOnce'
import { customTabItemTapEventKey } from '@/hooks/custom/useTabItemTap'
import { useCurrentUserInfo, useIsLogin } from '@/hooks/custom/useUser'
import { useCurrentUnreadMessageCount } from '@/hooks/message'
import { onceShowLoginPopupForLaunch } from '@/services/PopupService'
import appStore, { useAppSelector } from '@/store'
import { sendDataRangersEvent, sendHongBaoEvent } from '@/utils/dataRangers'

import './index.scss'

interface ITabBarConfig {
  color: string
  selectedColor: string
  backgroundColor: string
  list: ITabBarIconConfig[]
}

interface ITabBarIconConfig {
  pagePath: string
  text: string
  iconPath: string
  selectedIconPath: string
}

const tabBarConfig: ITabBarConfig = weappConfig.tabBar
const tabBarIconConfigs = tabBarConfig.list

const tabBarIconColor = tabBarConfig.color
const tabBarIconSelectedColor = tabBarConfig.selectedColor

const CustomTabBar: FC = () => {
  const isLogined = useIsLogin()
  const userInfo = useCurrentUserInfo()!
  const unreadMessageCount = useCurrentUnreadMessageCount()

  const currentTabIndex = useAppSelector(root => root.common.currentTabIndex)

  const [tipsVisible, setTipsVisible] = useState(false)
  const [isFirst, setIsFirst] = useState(true)
  //const [avaterList, setAvaterList] = useState([])
  const { needShow, setCurrentTips } = useOnce(unreadMessageTips, true)
  const { needShow: showGuide, setCurrentTips: setGuideCurrentTips } = useOnce(showGuideTips)

  const clearTips = () => {
    setCurrentTips()
    setTipsVisible(false)
  }
  useEffect(() => {
    if (showGuide) {
      setTipsVisible(true)
    } else {
      if (unreadMessageCount) {
        if (needShow) {
          setTipsVisible(true)
          setIsFirst(false)
          sendHongBaoEvent('TipsExpose', { tips_name: '未读消息tips' })
        }
      } else {
        // 如果非首次且未读消息为0，关闭今日不再提示
        if (!isFirst) clearTips()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFirst, showGuide, needShow, unreadMessageCount])

  const handleTabClick = (index: number) => {
    const item = tabBarIconConfigs[index]
    const url = `/${item.pagePath}`

    const pre_url = tabBarIconConfigs[appStore.getState().common.currentTabIndex || 0].pagePath
    const current_url = item.pagePath || ''
    sendDataRangersEvent('BottomButtonClick', {
      button_name: item.text || '',
      pre_url,
      current_url,
    })

    // if (index === 2 && !isLogined) {
    //   navigateTo({ url: '/weapp/general/login/index' })
    // } else {
    switchTab({ url }).then(() => {
      setTimeout(() => {
        eventCenter.trigger(url + customTabItemTapEventKey, {
          index: index,
          text: item.text,
          pagePath: item.pagePath,
        })

        // if (!isLogined) {
        //   onceShowLoginPopupForLaunch(url)
        // }

        eventCenter.trigger(url + addFavoritePopupEventKey, {}, 'close')
      }, 100)
    })
    // }
  }

  return (
    <View className="custom-tab-bar-wrapper">
      {tabBarIconConfigs.map((item, index) => {
        const isSelected = currentTabIndex === index

        return (
          <View
            key={item.pagePath}
            className="tab-bar-icon-wrapper"
            onClick={() => void handleTabClick(index)}
          >
            {unreadMessageCount && index === 2 ? (
              <AtBadge value={unreadMessageCount} maxValue={99}>
                <Image
                  src={isSelected ? `../${item.selectedIconPath}` : `../${item.iconPath}`}
                  className="tab-bar-icon"
                />
              </AtBadge>
            ) : (
              <Image
                src={isSelected ? `../${item.selectedIconPath}` : `../${item.iconPath}`}
                className="tab-bar-icon"
              />
            )}
            <View
              className="tab-bar-title"
              style={{ color: isSelected ? tabBarIconSelectedColor : tabBarIconColor }}
            >
              {item.text}
              {item.text === '我的' && <RedDotted visible={!userInfo?.wechat} />}
            </View>
          </View>
        )
      })}
      <ToastTips
        visible={tipsVisible && showGuide && isLogined}
        onClose={() => {
          setTipsVisible(false)
          setGuideCurrentTips()
        }}
        className="custom-toast__tips guideToast"
        content={
          <View className="custom-toast__tips__content">
            <View className="custom-toast__tips__text">新增了更多互动场景</View>
          </View>
        }
      />
      <ToastTips
        visible={tipsVisible && needShow && !showGuide && unreadMessageCount > 0}
        onClose={clearTips}
        className="custom-toast__tips"
        content={
          <View className="custom-toast__tips__content">
            {/*  <View className="custom-toast__tips__avaterList">
              <Image src={AvatarImg} />
              <Image src={AvatarImg} />
              <Image src={AvatarImg} />
              {
                // todo超过三人的未读消息显示...
              }
              {true && (
                <View className="avater__ellipsis">
                  <View className="avater__ellipsis__dotted"></View>
                  <View className="avater__ellipsis__dotted"></View>
                  <View className="avater__ellipsis__dotted"></View>
                </View>
              )}
            </View> */}
            <View className="custom-toast__tips__text">
              您有{unreadMessageCount}条未读消息，请尽快回复
            </View>
            <View className="custom-toast__tips__description">回复越快，简历排名越靠前</View>
          </View>
        }
      />
    </View>
  )
}

export default CustomTabBar
