import c from 'classnames'
import { ITouchEvent, View, Text } from '@tarojs/components'
import { useEffect, useState } from 'react'

import { IProps } from '@/def/common'
import './index.scss'

export interface IRadio extends IProps {
  onChange: (actived: boolean) => void
  selected?:boolean
}

const Radio: React.FC<IRadio> = ({ onChange, className, children,selected=false }) => {
  const [actived, setActived] = useState(false)
  const handleClick = (event: ITouchEvent) => {
    event.stopPropagation()
    setActived(!actived)
    onChange(!actived)
  }
  useEffect(() => {
    setActived(selected)
  }, [selected])
  return (
    <View onClick={handleClick} className={c('hd-radio',className,{'hd-radio--actived': actived})}>
      <Text
        className={c('at-icon at-icon-check hd-radio__icon-cnt' )}
      />
      {children}
    </View>
  )
}

export default Radio
