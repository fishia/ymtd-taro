import React, { useState } from 'react'
import c from 'classnames'
import _ from 'lodash'
import { View } from '@tarojs/components'
import './index.scss'

import { ISubscriptionPopupCardProps } from '@/weapp/pages/message/components/SubscriptionPopupCard'
import { IntentWorkTypeEnum, IResumeIntentInfo } from '@/def/resume'
import { IntentInfoName, IntentInfoTag } from '../intentInfoCard'
import useToast from '@/hooks/custom/useToast'

interface ISelectIntentsPopupCardProps extends ISubscriptionPopupCardProps {
  data?: IResumeIntentInfo[]
  editMode?: boolean
  onPrimaryButtonClick?: (data?: IResumeIntentInfo[]) => void
}
const SelectIntentsPopupCard: React.FC<ISelectIntentsPopupCardProps> = props => {
  const {
    title = '保留求职意向通知',
    primaryButtonText = '知道了',
    onPrimaryButtonClick = _.noop,
    tipText = '为了更精准的给您推荐职位，我们将保留您过往填写的3个“求职意向”，后续可在 “管理求职意向”页面修改',
    className,
    data = [],
    editMode = false
  } = props

  const showToast = useToast()
  const [selectionIntents, setSelectionIntents] = useState<number[]>([])

  //判断是不是选中了
  const isKeywordSelected = (id) => {
    return selectionIntents.includes(id)
  }
  //取消选中
  const deleteSelected = (id) => {
    setSelectionIntents(selectionIntents.filter(t => t === id))
  }
  //选中
  const addSelected = (id) => {
    setSelectionIntents([...selectionIntents, id])
  }

  const handleClick = (id) => {
    if (isKeywordSelected(id)) {
      deleteSelected(id)
    } else {
      addSelected(id)
    }
  }
  const rootCls = "select-intents_popup__card"
  return (
    <View className={c("select-intents_popup__card", className)}>
      <View className={`${rootCls}__body`}>
        <View className={`${rootCls}__title`}>{title}</View>
        <View className={`${rootCls}__tips`}>{tipText}</View>
        <View className={`${rootCls}__content`}>
          <View className={`${rootCls}__listTitle`}>求职意向</View>
          {data.map((item, i) => {
            return <View className={`${rootCls}__intentInfocard`} key={i}>
              {
                editMode ?
                  <View
                    onClick={() => handleClick(item.id)}
                    className={
                      isKeywordSelected(item.id) ? 'icon iconfont icongouxuan icongouxuan--checked' : 'icon iconfont icongouxuan'
                    }
                  />
                  :
                  <View className={`${rootCls}__intentInfocard__orderIndex`}>{i + 1}</View>
              }
              <View className={`${rootCls}__intentInfocard__basic`}>
                <View className={`${rootCls}__intentInfocard__info`}>
                  <View className={`${rootCls}__intentInfocard__name`}>{item.expectPositionName}</View>
                </View>
                <View className={`${rootCls}__intentInfocard__tags`}>
                  <IntentInfoTag text={`${item.expectSalaryFrom}k-${item.expectSalaryTo}k`} />
                  <IntentInfoTag text={item.cityName} />
                  <IntentInfoTag text={item.workType === IntentWorkTypeEnum.FULL_TIME ? '全职' : '兼职'} />
                </View>
              </View>
            </View>
          })}
        </View>
        <View className={`${rootCls}__action`}>
          <View
            onClick={() => {
              if (editMode && !selectionIntents.length) {
                showToast({ content: '请至少选择一条求职意向 ' })
              } else {
                onPrimaryButtonClick(data.filter(item => item.id && selectionIntents.includes(item.id)))
              }
            }}
            className={`${rootCls}__button`}
          >
            {primaryButtonText}
          </View>
        </View>
      </View >
    </View >
  )
}

export default SelectIntentsPopupCard
