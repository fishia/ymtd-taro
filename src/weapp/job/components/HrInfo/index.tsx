import { View, Image, ITouchEvent, Button } from '@tarojs/components'
import c from 'classnames'
import React, { useEffect, useRef, useState } from 'react'

import CrownPng from '@/assets/imgs/badges/icon_crown.png'
import LoginButton from '@/components/LoginButton'
import CommonPopup from '@/components/Popup/commonPopup'
import FixedBottomPopup from '@/components/Popup/fixedBottomPopup'
import Tag from '@/components/Tag'
import { IProps } from '@/def/common'
import { IHrInfo, IJob } from '@/def/job'
import { useIsLogin } from '@/hooks/custom/useUser'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'
import { combineStaticUrl } from '@/utils/utils'
import CopyPhonePop from '@/weapp/resume/components/CopyPhonePop'

import './index.scss'

export interface IHrInfoProps extends IProps {
  data: IHrInfo
  jd?: IJob
  isLink?: boolean
  detail?: boolean
  onClick?: (hrId: number) => void
  onHandChat?: (status: boolean) => void
}

const HrInfo: React.FC<IHrInfoProps> = props => {
  const { data, jd, isLink = false, className, style, children, onClick, onHandChat } = props
  const {
    avatar,
    name,
    identity,
    id,
    position_name,
    company_name,
    activityTagUrl,
    activeTag,
    replyTag,
    behaviorTag,
    activityPortrait,
    phone,
  } = data
  const isLogined = useIsLogin()

  const btnText = phone ? '查看联系方式' : '获取联系方式'

  const phoneTipsPopupRef = useRef<any>(null)

  const [phonePopOpen, setPhonePopOpen] = useState<boolean>(false)

  const handleClick = (e: ITouchEvent) => {
    e.stopPropagation()
    onClick && onClick(id)
  }
  const handleChatClick = (e: ITouchEvent) => {
    e.stopPropagation()
    onHandChat && onHandChat(true)
  }

  useEffect(() => {
    if (!isLogined && onHandChat) {
      sendDataRangersEventWithUrl('register_and_login_Expose', {
        event_name: '注册登录引导',
        type: '获取联系方式',
        page_name: '职位详情页',
      })
    }
  }, [isLogined, onHandChat])

  const getPhone = (e: ITouchEvent) => {
    e.stopPropagation()
    if (phone) {
      setPhonePopOpen(true)
      return
    }

    if (isLogined) {
      handleChatClick(e)
      return
    }
    sendDataRangersEventWithUrl('register_and_login_click', {
      event_name: '注册登录引导',
      type: '获取联系方式',
      page_name: '职位详情页',
      button_name: '获取联系方式',
    })
    phoneTipsPopupRef?.current?.setOpen(true)
  }

  return (
    <>
      <View className={['job-hr', className].join(' ')} style={style} onClick={handleClick}>
        <View className="job-hr__icon">
          {activityPortrait && (
            <Image
              src={combineStaticUrl(activityPortrait)}
              className="job-hr__headFrame"
              mode="aspectFit"
            />
          )}

          {avatar && (
            <Image src={combineStaticUrl(avatar)} mode="aspectFit" className="job-hr__icon" />
          )}
        </View>

        <View className="job-hr__right">
          <View className="job-hr__rightTop">
            <View className="job-hr__title">
              {name}
              <View className="job-hr__title__identity">{identity}</View>
            </View>
            <View className="job-hr__item">{position_name ? ` · ${position_name}` : ''}</View>

            {activeTag && <View className="job-hr__textTag">{activeTag}</View>}
            {behaviorTag && (
              <View
                className={c(
                  { 'job-hr__onlineTag': behaviorTag.includes('在线') },
                  { 'job-hr__replyTag': behaviorTag.includes('回复快') },
                  {
                    'job-hr__textTag': !(
                      behaviorTag.includes('在线') || behaviorTag.includes('回复快')
                    ),
                  }
                )}
              >
                {behaviorTag}
              </View>
            )}
          </View>
          <View className="job-hr__intro">
            {company_name && (
              <View className="job-hr__tip">
                <View className="job-hr__item" style={position_name ? {} : { maxWidth: '100%' }}>
                  {company_name}&nbsp;
                </View>

                {replyTag && <View className="job-hr__replyTag">{replyTag}</View>}
              </View>
            )}
          </View>
          {activityTagUrl && <Tag style="margin-bottom: 10px" iconSrc={activityTagUrl} />}
          {onHandChat && (
            <View className="chatBtn" hoverStopPropagation>
              <Button className="circle" onClick={getPhone}>
                {btnText}
              </Button>
            </View>
          )}
        </View>
        {isLink && <View className="at-icon at-icon-chevron-right" />}
        {children}
      </View>
      <CommonPopup
        type="login"
        ref={phoneTipsPopupRef}
        onConfirm={handleChatClick}
        recordJdInfo={jd ? { id: jd.id, hrId: data.id, mode: 'contactType' } : undefined}
      />
      <CopyPhonePop data={data} open={phonePopOpen} onClose={() => setPhonePopOpen(false)} />
    </>
  )
}

export default HrInfo
