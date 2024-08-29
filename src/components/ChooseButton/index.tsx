import { View } from '@tarojs/components'
import React, { useEffect } from 'react'
import classNames from 'classnames'
import { IChoose, IPair } from '@/def/common'

import './index.scss'

export type ChooseButtonType = 'fast' | 'choose'

export interface IChooseBtnProps {
  disabled?: boolean
  type?: ChooseButtonType
  item: IChoose
  onClick: (event: IChooseEvent) => void
}

export interface IChooseEvent {
  item: IPair
  selected: boolean
  category?: IPair
}

const ChooseBtn: React.FC<IChooseBtnProps> = props => {
  const { item, onClick, type, disabled = false } = props
  const [selected, setSelected] = React.useState<boolean>(false)

  useEffect(() => {
    setSelected(item.selected || false)
  }, [item])

  const handleClick = event => {
    event.stopPropagation()
    if (!disabled) {
      setSelected(!selected)
      onClick && onClick({ item, selected: !selected })
    }
  }

  if (type === 'fast') {
    return (
      <View className="choose-button-fast" onClick={handleClick}>
        {item.name}
      </View>
    )
  }
  return (
    <View
      onClick={handleClick}
      className={classNames('choose-button', {
        'choose-button--active': selected,
      })}
    >
      {item.name}
    </View>
  )
}
export default ChooseBtn
