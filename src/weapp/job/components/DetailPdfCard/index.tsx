import { View } from '@tarojs/components'
import React from 'react'

import { IProps } from '@/def/common'
import { previewResumeAttachment } from '@/services/ResumeService/attachment'

import './index.scss'

interface ILocationProps extends IProps {
  url?: string
  name?: string
}

const DetailPdfCard: React.FC<ILocationProps> = props => {
  const { className, style, name = '', url = '' } = props

  const showPdf = () => {
    previewResumeAttachment(url, name)
  }

  return (
    <>
      <View className={['detail-pdfCard', className].join(' ')} style={style} onClick={showPdf}>
        <View className="detail-pdfCard__position">{name}</View>
        <View className="detail-pdfCard__rightText">
          <View>查看</View>
          <View className="icon iconfont iconright" />
        </View>
      </View>
    </>
  )
}

export default DetailPdfCard
