import { View } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import c from 'classnames'
import { noop } from 'lodash'
import { FC, useEffect, useState } from 'react'

import { IProps } from '@/def/common'
import { ICommonlyWord } from '@/def/message'
import { pxTransform } from '@/utils/taroUtils'

import './index.scss'

export interface IOpenCloseContentProps extends IProps {
  keys: string
  maxHeight: number
}

const OpenCloseContent: FC<IOpenCloseContentProps> = props => {
  const { className, style, children, keys, maxHeight } = props

  const [showUnfold, setShowUnfold] = useState(false)
  const [isFold, setIsfold] = useState(false)

  useDidShow(() => {
    setTimeout(() => {
      const current = getCurrentPages().pop()

      current
        ?.createSelectorQuery()
        .select('.tester-' + keys)
        .boundingClientRect()
        .exec(rect => {
          console.log(rect[0].height)
          if ((rect?.[0]?.height || 0) > maxHeight) {
            setShowUnfold(true)
            setIsfold(true)
          }
        })
    }, 30)
  })

  const unfoldHandler = e => {
    e.preventDefault()
    e.stopPropagation()

    setIsfold(!isFold)
  }

  return (
    <View className={c('open-close-content', className)} style={style}>
      <View
        className={c('open-close-content__children', isFold ? 'fold' : 'unfold', `.tester-${keys}`)}
        style={{
          height: isFold ? maxHeight : 'unset',
        }}
      >
        {children}
      </View>

      {showUnfold && isFold ? (
        <View onClick={unfoldHandler} className="open-close-content__unfold">
          {isFold ? '展开' : '收起'}
          <View className="icon iconfont iconxiangxiajiantou"></View>
        </View>
      ) : null}
    </View>
  )
}

export default OpenCloseContent
