import { Button as TButton, ButtonProps, ITouchEvent } from '@tarojs/components'
import c from 'classnames'
import _ from 'lodash'
import React from 'react'

import LoginButton, { IRecordJdInfo } from '../LoginButton'

import './index.scss'

export type ButtonType = 'primary' | 'disabled' | 'border' | 'grey' | 'text' | 'delete'

export interface IButtonProps extends ButtonProps {
  btnType?: ButtonType
  onClick?(e: ITouchEvent): void
  onDisabledClick?(): void
  disabled?: boolean
  round?: boolean
  useLoginButton?: boolean
  loginButtonJdInfo?: IRecordJdInfo
}

const Button: React.FC<IButtonProps> = props => {
  const {
    children,
    btnType = 'primary',
    loading = false,
    round = false,
    className,
    style,
    formType,
    openType,
    useLoginButton = false,
    onClick = _.noop,
    onDisabledClick = _.noop,
    loginButtonJdInfo,
  } = props

  let disabled = props.disabled

  const handleClick = (event: ITouchEvent) => {
    event.stopPropagation()
    event.preventDefault()

    if (disabled) {
      onDisabledClick(event)
      return
    }

    onClick && onClick(event)
  }

  const Component = useLoginButton ? LoginButton : TButton

  return (
    <Component
      {...props}
      style={style}
      className={c(
        'hd-button',
        'hd-button--default',
        {
          'hd-button--disabled': disabled,
          'hd-button--round': round,
        },
        `hd-button--${btnType}`,
        className
      )}
      disabled={disabled}
      loading={loading}
      onClick={handleClick}
      formType={formType}
      openType={openType}
      hoverClass="none"
      hover-stop-propagation
      recordJdInfo={loginButtonJdInfo}
    >
      {children}
    </Component>
  )
}

export default Button
