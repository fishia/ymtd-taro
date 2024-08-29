/*
 * @Author: CC 13916343936@163.com
 * @Date: 2023-07-13 16:58:53
 * @LastEditors: CC 13916343936@163.com
 * @LastEditTime: 2023-07-14 16:44:31
 * @FilePath: \ymtd-taro\src\weapp\job\components\SafetyTips\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { View, Image } from '@tarojs/components'
import React from 'react'

import { IProps } from '@/def/common'

import './index.scss'

interface ISafetyTipsProps extends IProps {
  title?: string
  content?: string
}

const iconUrl = 'https://kr-ymtd.oss-cn-beijing.aliyuncs.com/mp/common/security.svg'
const defaultContent =
  '「医脉同道」严禁用人单位做出任何损害求职者合法权益的违法违规行为，包括但不限于扣押求职者证件、收取求职者财物、向求职者集资、让求职者入股、诱导求职者异地入职、异地参与培训等，您一旦发现此类行为，请立即举报。'
const SafetyTips: React.FC<ISafetyTipsProps> = props => {
  const { title = '安全提示', content = defaultContent, style } = props
  return (
    <View className="safety-tips" style={style}>
      <View className="safety-tips_header">
        <Image src={iconUrl} className="safety-tips_header__icon" mode="scaleToFill" />
        <View className="safety-tips_header__title">{title}</View>
      </View>
      <View className="safety-tips_content">{content}</View>
    </View>
  )
}

export default SafetyTips
