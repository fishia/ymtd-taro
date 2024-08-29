import { View, Image } from '@tarojs/components'
import { eventCenter } from '@tarojs/taro'
import c from 'classnames'
import { noop } from 'lodash'
import { useEffect, useMemo } from 'react'

import arrowIcon from '@/assets/imgs/cell-arrow.png'
import { IProps } from '@/def/common'

import { IFormComponentProps } from '../Form'

import './index.scss'

const formLinkStorageRef = {
  current: null,
}

export function setFormLinkStorageRef(info: any) {
  formLinkStorageRef.current = info
}

export function getFormLinkStorageRef(): any {
  return formLinkStorageRef.current
}

export enum EFormEvent {
  JOB_CATEGORY = 'JOB_CATEGORY',
  POSITION = 'POSITION',
  JOB_KEYWORD = 'JOB_KEYWORD',
}

export interface IFormLink extends IFormComponentProps, IProps {
  placeholder: string
  title: string
  text?: string
  onCallback(v: any): any
  event: EFormEvent
  onClick(): void
  border?: boolean
  checkSensitive?: boolean
}

function FormLink(props: IFormLink) {
  const {
    title = '',
    className,
    style,
    onClick = noop,
    placeholder,
    onChange,
    onFocus,
    onCallback,
    event,
    text,
    error,
    children,
  } = props

  const displayText = useMemo(() => text || '', [text])

  const clickHandler = e => {
    setFormLinkStorageRef(props)
    onClick()
    onFocus && onFocus(e)
  }

  useEffect(
    () => {
      eventCenter.off(event)
      eventCenter.on(event, (callback: any) => {
        if (onCallback) {
          const newValue = onCallback(callback)

          onChange && onChange(newValue)
        }
      })

      return () => {
        eventCenter.off(event)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [event, onCallback]
  )

  return (
    <View
      onClick={clickHandler}
      className={c('form__link', className, error ? 'form__link--error' : '')}
      style={style}
      hoverClass="hover"
    >
      <View className="form__link__title">{title}</View>
      <View className="form__link__content">
        <View className={c('form__link__text', !displayText ? 'form__link__placeholder' : '')}>
          {displayText || placeholder}
        </View>
        <Image className="form__link__arrow" src={arrowIcon} mode="aspectFill" />
      </View>

      {children}
    </View>
  )
}

export default FormLink
