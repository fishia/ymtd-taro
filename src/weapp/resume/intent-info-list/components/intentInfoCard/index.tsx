import React from 'react';
import c from 'classnames'
import { View } from '@tarojs/components';
import { IProps } from '@/def/common';
import { IntentWorkTypeEnum, IResumeIntentInfo } from '@/def/resume';
import './index.scss'

export const IntentInfoName = props => <View className="intent-info-card__name" style={props.style}>{props.text}</View>
export const IntentInfoSubText = props => <View className="intent-info-card__subText" style={props.style}>{props.text}</View>
export const IntentInfoTag = props => <View className="intent-info-card__tag" style={props.style}>{props.text}</View>


export interface IIntentInfoCardProps extends IProps {
  data?: IResumeIntentInfo
  onClick?: () => void
}

const IntentInfoCard: React.FC<IIntentInfoCardProps> = (props) => {
  const {
    className,
    data,
    onClick
  } = props

  const {
    cityName,
    expectPositionName,
    expectSalaryFrom,
    expectSalaryTo,
    workType,
    keywords
  } = data as IResumeIntentInfo
  return (
    <View className={c("intent-info-card", className)} onClick={onClick}>
      <View className="intent-info-card__basic">
        <View className="intent-info-card__info">
          <IntentInfoName text={expectPositionName} />
          <IntentInfoSubText text={`${expectSalaryFrom}k-${expectSalaryTo}k`} />
          <IntentInfoSubText text={cityName} />
          <IntentInfoSubText text={workType === IntentWorkTypeEnum.FULL_TIME ? '全职' : '兼职'} />
        </View>
        {
          keywords?.length ?
            <View className="intent-info-card__tags">
              {
                keywords.map(item => item.name).join(' | ')
              }
            </View> : null
        }
      </View>
      <View className="at-icon at-icon-chevron-right rightIcon" />
    </View>
  )
}


export default IntentInfoCard;
