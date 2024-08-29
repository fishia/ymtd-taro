import { View } from '@tarojs/components'
import classNames from 'classnames'
import { noop } from 'lodash'

import { IProps } from '@/def/common'

import './ActionBar.scss'

export interface IActionBarProps extends IProps {
  hidePreviewAttachment?: boolean
  hideReuploadAttachment?: boolean
  hideReuploadResume?: boolean
  onPreviewAttachment?(): void
  onReuploadAttachment?(): void
  onReuploadResume?(): void
}

export default function ActionBar(props: IActionBarProps) {
  const {
    hidePreviewAttachment = false,
    hideReuploadAttachment = false,
    hideReuploadResume = false,
    onPreviewAttachment = noop,
    onReuploadAttachment = noop,
    onReuploadResume = noop,
    className,
    style,
  } = props

  return (
    <View className={classNames('resume-action-bar', className)} style={style}>
      {hidePreviewAttachment ? null : (
        <View className="resume-action-bar__button" onClick={onPreviewAttachment}>
          查看附件
        </View>
      )}

      {hideReuploadAttachment ? null : (
        <View className="resume-action-bar__button" onClick={onReuploadAttachment}>
          重传附件
        </View>
      )}

      {hideReuploadResume ? null : (
        <View className="resume-action-bar__button" onClick={onReuploadResume}>
          重新导入
        </View>
      )}
    </View>
  )
}
