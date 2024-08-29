import { Image, View } from '@tarojs/components'
import dayjs from 'dayjs'
import _ from 'lodash'
import React from 'react'

import RedDotted from '@/components/RedDotted'
import { DEFAULT_MALE_AVATAR, DEFAULT_FEMALE_AVATAR } from '@/config'
import { IResumeBasicInfo } from '@/def/resume'
import { SexType } from '@/def/user'
import { computeAge } from '@/services/DateService'
import { showSensitiveBothNameAndPhone } from '@/services/StringService'
import { combineStaticUrl } from '@/utils/utils'

import ResumeBlock, { ResumeRow } from '../ResumeBlock'
import createResumeData from '../ResumeData'

import './index.scss'

const { ResumeData, ResumeField } = createResumeData<IResumeBasicInfo>()

const renderSex = (sex: SexType) => (
  <View
    className={`basicinfo-block__row__sex icon iconfont icon${sex === SexType.boy ? 'nan' : 'nv'}`}
  ></View>
)

const renderWorkyears = (workBeginTime: string) => {
  if (workBeginTime?.startsWith('0000')) {
    return '应届毕业生'
  }

  const years = dayjs().year() - dayjs(workBeginTime).year()

  return `${years}年工作经验`
}

export interface IBasicBlockProps {
  basicInfo: IResumeBasicInfo
  onEditClick?(): void
}

const BasicInfoBlock: React.FC<IBasicBlockProps> = props => {
  const { basicInfo, onEditClick = _.noop } = props

  const isBasicInfoEmpty = !!basicInfo

  const image = basicInfo?.avatar
    ? combineStaticUrl(basicInfo.avatar)
    : basicInfo?.sex === SexType.girl
    ? DEFAULT_FEMALE_AVATAR
    : DEFAULT_MALE_AVATAR

  const Content = () => (
    <>
      <Image src={image} mode="aspectFit" className="basicinfo-block__avatar" />
      <ResumeData data={basicInfo} onFieldClick={onEditClick}>
        <View onClick={onEditClick} className="basicinfo-block__content">
          <ResumeRow>
            <ResumeField
              className="basicinfo-block__row__name"
              field="name"
              maxWidth={350}
              label="姓名"
              render={showSensitiveBothNameAndPhone}
            >
              <RedDotted visible={!basicInfo.wechat} />
            </ResumeField>
            <ResumeField
              className="basicinfo-block__row__sexfield"
              field="sex"
              label="性别"
              render={renderSex}
              option
            />
          </ResumeRow>

          <ResumeRow>
            <ResumeField field="birthDate" label="出生日期" render={computeAge} separator inline />
            <ResumeField field="cityName" label="居住地" separator inline />
            <ResumeField
              field="workBeginTime"
              label="开始工作时间"
              render={renderWorkyears}
              inline
            />
          </ResumeRow>
        </View>
      </ResumeData>
    </>
  )

  const Empty = () => (
    <View onClick={onEditClick} className="basicinfo-block__empty">
      请添加基本信息
    </View>
  )

  return (
    <ResumeBlock className="basicinfo-block">
      <View className="basicinfo-block__edit icon iconfont iconbianji" onClick={onEditClick} />

      {isBasicInfoEmpty ? <Content /> : <Empty />}
    </ResumeBlock>
  )
}

export default BasicInfoBlock
