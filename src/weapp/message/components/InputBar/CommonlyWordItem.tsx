import { View } from '@tarojs/components'
import c from 'classnames'
import { noop } from 'lodash'
import { FC, useEffect, useState } from 'react'

import { IProps } from '@/def/common'
import { ICommonlyWord } from '@/def/message'

import './CommonlyWordItem.scss'

export interface ICommonlyWordItemProps extends IProps {
  item: ICommonlyWord
  onClick?(): void
}

const CommonlyWordItem: FC<ICommonlyWordItemProps> = props => {
  const { onClick = noop, item, className, style } = props

  const [showUnfold, setShowUnfold] = useState(false)
  const [isUnfold, setIsUnfold] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      const messagePage = getCurrentPages().find(p => p.route === 'weapp/message/chat/index')
      messagePage
        ?.createSelectorQuery()
        .select('.tester-' + item.commonWordsId)
        .boundingClientRect()
        .exec(rect => {
          if ((rect?.[0]?.width || 0) > 345) {
            setShowUnfold(true)
          } else {
            setIsUnfold(true)
          }
        })
    }, 30)
  }, [item.commonWordsId])

  const unfoldHandler = e => {
    e.preventDefault()
    e.stopPropagation()
    setIsUnfold(true)
  }

  return (
    <View onClick={onClick} className={c('commonly-word-item', className)} style={style}>
      <View className={c('commonly-word-item__text', isUnfold ? 'unfold' : 'fold')}>
        {item.content}
      </View>

      {showUnfold && !isUnfold ? (
        <View onClick={unfoldHandler} className="commonly-word-item__unfold">
          展开
        </View>
      ) : null}

      <View className={c('commonly-word-item__tester', 'tester-' + item.commonWordsId)}>
        {item.content}
      </View>
    </View>
  )
}

export default CommonlyWordItem
