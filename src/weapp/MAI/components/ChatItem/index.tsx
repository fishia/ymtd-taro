import { View, Text, Image, Icon } from '@tarojs/components'
import { getStorageSync, navigateBack } from '@tarojs/taro'
import { useEffect } from 'react'

import { DEFAULT_FEMALE_AVATAR, DEFAULT_MALE_AVATAR, OSS_STATIC_HOST, PROFILE } from '@/config'
import { MaiSourceType, MaiSourceTypeData } from '@/def/MAI'
import { SexType } from '@/def/user'
import { senceData } from '@/hooks/message/maiSocket'
import appStore from '@/store'
import { combineStaticUrl } from '@/utils/utils'

import { Message } from '../../chat'
import ChatBottomBtn from '../ChatBottomBtn'
import ChatBottomNewBtn from '../ChatBottomNewBtn'
import { ChatCard, TextCard } from '../ChatCard'
import CreateResumeBtn from '../CreateResumeBtn'
import GuidanceSelectCard from '../GuidanceSelectCard'
import Loading from '../Loading'

import './index.scss'

export interface ItemProps {
  loading?: boolean
  showBottom?: boolean
  showEdit?: boolean
  content: string
  extraContent: any
  role: string
  stream?: boolean
  time?: string
  type: MaiSourceType
  uuid: string
  status?: string
  personEdit: () => void
  autoEdit: () => void
  netConnected?: boolean // 是否有网络连接
  refrash: (uuid?: string, extraContent?: any) => void
  userRefrash: (e: string, id: string, sendType?: string) => void
  openResume: (uuid: string) => void
  orderClick: () => void
  inputRef: any
  setShowInputBar: (e: boolean) => void
  chooseIdenity: (
    messageItem: Message,
    isApi: boolean,
    twoMore?: boolean,
    btnIndex?: number | 'all'
  ) => void
  interceptBtn: (messageItem: Message) => boolean
}

const clickContent = {
  color: '#4256DC',
}

export const robotAvatar = `${OSS_STATIC_HOST}/mp/MAI/robotHead.png`
const userAvatar = `${OSS_STATIC_HOST}/mp/MAI/userHead.png`
const userdefaultAvatar = `${OSS_STATIC_HOST}/mp/MAI/defaultHeader.png`

const ChatItem: React.FC<ItemProps> = props => {
  const {
    content,
    extraContent,
    role,
    showEdit = false,
    stream,
    time,
    type,
    uuid,
    loading,
    showBottom,
    personEdit,
    autoEdit,
    netConnected = true,
    refrash,
    userRefrash,
    openResume,
    status,
    orderClick,
  } = props

  const BtnText = extraContent?.buttons?.used ? '已使用' : MaiSourceTypeData[type]?.btnText

  const renderContentText = () => {
    if (loading) {
      return <Loading />
    }
    if (type === MaiSourceType.GREETING) {
      return <ChatCard {...props} />
    }
    return <>{content && <TextCard {...props} />}</>
  }

  const renderCard = () => {
    if (type === MaiSourceType.GUIDANCE_CMD_SELECT) {
      return <GuidanceSelectCard {...props} />
    }
    return (
      <>
        {/* {MaiSourceTypeData[type]?.showTitle && (
          <View className="message-content-title">
            <View className="title">{extraContent?.title}</View>
            <View className="subContent">{extraContent?.subTitle}</View>
          </View>
        )} */}
        <View className="message-content-text">{renderContentText()}</View>
        {/* 当前卡片是否有展示聊天卡片下部按钮 */}
        {/* 列表status为done直接不展示按钮 */}
        {status && status !== 'done' ? null : (
          <>
            {role === 'assistant' && MaiSourceTypeData[type]?.showBtn && extraContent?.buttons && (
              <>
                {/* 这里分两种情况，一种是used为true按钮消失，一种是展示并禁用 */}
                {extraContent.buttons.used && !MaiSourceTypeData[type].usedDisabled ? null : (
                  <>
                    {MaiSourceTypeData[type]?.btnBg ? (
                      // 如果btnBg存在，则展示以btnBg为背景的按钮
                      <View className="message-content-bottom pb11">
                        <ChatBottomNewBtn
                          imgUrl={MaiSourceTypeData[type]?.btnBg}
                          onClick={orderClick}
                        />
                      </View>
                    ) : (
                      // 普通封装好的通用按钮
                      <View className="message-content-bottom btnBottom">
                        <ChatBottomBtn
                          isShowExitBtn={MaiSourceTypeData[type]?.isShowExitBtn}
                          BtnText={BtnText}
                          ExitBtnText={MaiSourceTypeData[type]?.exitBtnText}
                          BtnProps={{ disabled: extraContent.buttons.used }}
                          onExitBtnClick={personEdit}
                          onBtnClick={autoEdit}
                          ExitBtnProps={{
                            customStyle: { color: MaiSourceTypeData[type]?.exitBtnColor },
                          }}
                        />
                      </View>
                    )}
                  </>
                )}
              </>
            )}
            {type === MaiSourceType.GUIDANCE_PROFILE_MANUAL && (
              <CreateResumeBtn openResume={openResume} />
            )}
          </>
        )}
      </>
    )
  }

  const headerUrl = () => {
    const header = MaiSourceTypeData[type]?.header

    // 机器人头像
    if (role === 'assistant') {
      return robotAvatar
    }

    // 有默认设置头像走这
    if (header) {
      return header
    }

    // 已经生成过简历的用用户头像
    const profile = getStorageSync(PROFILE)
    const avatar = getStorageSync(PROFILE)?.avatar
    const profileSex = getStorageSync(PROFILE)?.sex

    if (profile) {
      const avatarUrl = avatar
        ? combineStaticUrl(avatar)
        : profileSex === SexType.girl
        ? DEFAULT_FEMALE_AVATAR
        : DEFAULT_MALE_AVATAR
      return avatarUrl
    }

    // 没成过简历的默认头像
    return userdefaultAvatar
  }

  return (
    <View className={`chat-message ${role !== 'assistant' ? 'user' : 'robot'}`}>
      <Image className="avatar" src={headerUrl()} />
      <View className="message-content">
        {role === 'assistant' ? (
          <View className="icon iconfont iconln_jiantouzuo AK-LN-left" />
        ) : (
          <View className="icon iconfont iconln_jiantouyou AK-LN-right" />
        )}

        {renderCard()}

        {role === 'assistant' && !netConnected && (
          <>
            <View className="font28 errText">抱歉，出现了异常，请再试一次</View>
            <View className="message-content-bottom">
              <ChatBottomBtn
                isShowExitBtn={false}
                BtnText={
                  <>
                    <Text className="icon iconfont iconmessage" />
                    再试一次
                  </>
                }
                onBtnClick={() => refrash(uuid, extraContent)}
              />
            </View>
          </>
        )}
      </View>
      {role !== 'assistant' && !netConnected && (
        <Icon
          size="20"
          type="warn"
          color="#CF303A"
          className="iconfasongshibai"
          onClick={() => userRefrash(content, uuid, MaiSourceTypeData[type]?.sendType)}
        />
      )}
    </View>
  )
}

export default ChatItem
