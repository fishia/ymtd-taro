import React, { useImperativeHandle, useState } from 'react'
import c from 'classnames'
import { View, Image } from '@tarojs/components'

import { IProps } from '@/def/common'

import './index.scss'
import logoImage from '@/assets/imgs/logo.png'

export const loadingStatusEventKey = 'loadingStatus'

export interface ILoadingStatusProps extends IProps {
  defaultLoading?: boolean
  hasNavBar?: boolean
  hasTabBar?: boolean
}

export interface ILoadingStatusOpenProps {
  loadingText?: string
  hasNavBar?: boolean
  hasTabBar?: boolean
}

const LoadingStatus: React.ForwardRefRenderFunction<any, ILoadingStatusProps> = (props, ref) => {
  const { className, style, defaultLoading = false, hasNavBar = false, hasTabBar = false } = props

  const [isShow, setIsShow] = useState<boolean>(defaultLoading)
  const [option, setOption] = useState<ILoadingStatusOpenProps>({
    loadingText: '加载中...',
    hasNavBar: hasNavBar,
    hasTabBar: hasTabBar,
  })

  useImperativeHandle(ref, () => ({
    open: (opt: ILoadingStatusOpenProps) => {
      setOption({ ...option, ...opt })
      setIsShow(true)
    },
    close: () => void setIsShow(false),
  }))

  return (
    <View
      className={c(
        'loading-status',
        {
          'loading-status--show': isShow,
          'loading-status--navbar': option.hasNavBar,
          'loading-status--tabbar': option.hasTabBar,
        },
        className
      )}
      style={style}
    >
      <Image className="loading-status__logo" src={logoImage} />
      <View className="loading-status__text">{option.loadingText}</View>
    </View>
  )
}

export default React.forwardRef(LoadingStatus)
