import React from 'react'
import _ from 'lodash'
import c from 'classnames'
import { Image } from '@tarojs/components'

import { IProps } from '@/def/common'

import './index.scss'
import recreateButtonImage from './recreate.png'

export interface IRecreateButtonProps extends IProps {
  onClick?(): void
}

const RecreateButton: React.FC<IRecreateButtonProps> = props => {
  const { className, style, onClick = _.noop } = props

  return (
    <Image
      className={c('resume-recreate', className)}
      style={style}
      onClick={onClick}
      src={recreateButtonImage}
    />
  )
}

export default RecreateButton
