import { Image, View } from '@tarojs/components'
import { eventCenter, navigateTo, switchTab, useRouter } from '@tarojs/taro'
import { map, sampleSize } from 'lodash'
import { useEffect, useRef, useState } from 'react'

import { jdAggregateZone } from '@/apis/job'
import CloseIcon from '@/assets/imgs/close.svg'
import { IChoiseList } from '@/def/job'
import { defaultUserInfo } from '@/def/user'
import useOnce, { MAISpringWarTips, MAIJobChoice, MAIJobSOHO } from '@/hooks/custom/useOnce'
import useShowModal from '@/hooks/custom/useShowModal'
import { useCurrentUserInfo, useIsLogin } from '@/hooks/custom/useUser'
import { useAsync } from '@/hooks/sideEffects/useAsync'
import { sendHongBaoEvent } from '@/utils/dataRangers'
import { jsonToUrl } from '@/utils/utils'
import SaveAward from '@/weapp/pages/job/components/SaveAward'

import './index.scss'

export const MAIIcon = 'https://oss.yimaitongdao.com/mp/MAI/MAIICON.png'

export const tabRoute = [
  '/weapp/pages/job/index',
  '/weapp/pages/discover/index',
  '/weapp/pages/message/index',
  '/weapp/pages/my/index',
]

const tipsConfig = {
  goAward: {
    title: '你有升职季活动奖品暂未领取',
    body: '一键领取后可助你求职事半功倍',
    button: '去领取',
  },
  goReply: {
    title: '有HR正急盼你的简历',
    body: '回复可累积现金，回复越多现金越大',
    button: '去回复',
  },
}

const MAITips = () => {
  // isShowChoice是首页是否浏览了10个职位卡片，展示提示
  const userInfo = useCurrentUserInfo() || defaultUserInfo
  const { needShow, setExpose } = useOnce(MAISpringWarTips, true, 3)
  const { needShow: choiceShow, setExpose: setChoiceShow } = useOnce(MAIJobChoice, true)
  const { needShow: sohoShow, setExpose: setSohoShow } = useOnce(MAIJobSOHO, true)
  const [tipsVisible, setTipsVisible] = useState<boolean>(needShow)
  const [choiceVisible, setChoiceVisible] = useState<boolean>(false)
  const [sohoVisible, setSohoVisible] = useState<boolean>(false)
  const [simpleList, setSimpleList] = useState<string[]>([])
  const showModal = useShowModal({ mode: 'thenCatch' })
  const needGetAward = userInfo.isDraw && !userInfo.isAddWecom
  const needGetReply = userInfo.isDraw && userInfo.isUnreadProfileMsg
  const router = useRouter()
  const timeRef = useRef<any>()
  const isLogined = useIsLogin()

  let tabList: IChoiseList[] = []

  const { value } = useAsync(() => {
    return jdAggregateZone()
  }, [])
  tabList = value as IChoiseList[]

  useEffect(() => {
    return () => {
      if (timeRef.current) {
        clearTimeout(timeRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setSimpleList(map(sampleSize(tabList || [], 3), 'name'))
  }, [tabList])

  const goTimer = () => {
    if (timeRef.current) {
      clearTimeout(timeRef.current)
    }

    timeRef.current = setTimeout(() => {
      setTipsVisible(true)
    }, 1000 * 60 * 30)
  }

  const onCloseTIps = () => {
    setTipsVisible(false)
    goTimer()
    setExpose()
  }

  const onCloseJobTIps = () => {
    setChoiceVisible(false)
    setChoiceShow()
  }

  const onCloseJobSohoTIps = () => {
    setSohoVisible(false)
    setSohoShow()
  }

  useEffect(() => {
    if (sohoShow) {
      // 监听首页卡片是否划到第20个
      eventCenter.on('jobSoho', () => {
        setChoiceVisible(true)
      })
    }
    if (choiceShow && isLogined) {
      // 监听首页卡片是否划到第20个
      eventCenter.on('jobChoice', () => {
        setChoiceVisible(true)
      })
    }

    return () => {
      eventCenter.off('jobChoice')
      eventCenter.off('jobSoho')
    }
  }, [choiceShow, isLogined])

  if (userInfo.stage !== 1 && !choiceShow) {
    return null
  }

  const onGoMAI = (buttonText?: string) => {
    if (choiceShow) {
      navigateTo({
        url: `/weapp/MAI/chatCard/index?type=quality_position`,
      })
      return
    }

    if (tipsVisible) {
      setTipsVisible(false)
      goTimer()
      setExpose()
    }

    if (needGetAward) {
      if (buttonText === '去领取') {
        showModal({
          content: <SaveAward isGetAward />,
          className: 'global-empty-modal',
          title: '',
          cancelText: '',
          confirmText: '',
          closeOnClickOverlay: false,
        }).catch(err => {})
        return
      }

      navigateTo({
        url: `/weapp/MAI/chatCard/index?type=receive_award`,
      })
      return
    }

    if (needGetReply) {
      if (buttonText === '去回复') {
        switchTab({
          url: '/weapp/pages/message/index',
        })
        return
      }
      navigateTo({
        url: '/weapp/MAI/chatCard/index?type=apply_resume',
      })
      return
    }
  }

  const onGoPositionMAI = (name: string) => {
    if (choiceVisible) {
      setChoiceVisible(false)
      setChoiceShow()
    }

    const params = {
      type: 14,
      tag: name,
      choiceList: JSON.stringify(tabList),
    }

    sendHongBaoEvent('tipsclick', {
      tips_name: 'MAI聚合提示',
    })

    navigateTo({
      url: `/weapp/job/job-choiceness/index?${jsonToUrl(params)}`,
    })
  }

  const renderTips = content => {
    if (router.path !== '/weapp/pages/job/index') {
      return null
    }

    // SOHO兼职
    if(sohoShow){
      return <View className="MAI-Icon-tips-content">123</View>
    }

    if (!choiceShow) {
      if (!tipsVisible || !needShow) {
        return null
      }

      return (
        <View className="MAI-Icon-tips-content">
          <Image className="MAI-Icon-tips-content-close" src={CloseIcon} onClick={onCloseTIps} />
          <View className="MAI-Icon-tips-content-body">
            <View className="title">{content.title}</View>
            <View>{content.body}</View>
          </View>
          <View className="MAI-Icon-tips-content-button" onClick={() => onGoMAI(content.button)}>
            {content.button}
          </View>
        </View>
      )
    }

    if (!choiceVisible) {
      return null
    }

    return (
      <View className="MAI-Icon-tips-positionContent">
        <Image
          className="MAI-Icon-tips-positionContent-close"
          src={CloseIcon}
          onClick={onCloseJobTIps}
        />
        <View className="MAI-Icon-tips-positionContent-body">
          <View className="title">精选平台最优质的职位</View>
          <View>助你入职快人一步</View>
          <View className="MAI-Icon-tips-positionContent-btnList">
            {simpleList.map(item => (
              <View
                key={item}
                className="MAI-Icon-tips-positionContent-button"
                onClick={() => onGoPositionMAI(item)}
              >
                {item}
                <View className="icon iconfont iconright" />
              </View>
            ))}
          </View>
        </View>
      </View>
    )
  }

  let content
  if (needGetAward) {
    content = tipsConfig.goAward
  } else if (needGetReply) {
    content = tipsConfig.goReply
  }

  if (!isLogined) {
    return null
  }

  if (!content && !choiceShow) {
    return null
  }

  if (!tabRoute.includes(router.path)) {
    return null
  }

  return (
    <View className="MAI-Icon-tips">
      {renderTips(content)}
      <Image className="MAI-Icon-tips-icon" src={MAIIcon} onClick={() => onGoMAI()} />
    </View>
  )
}

export default MAITips
