import { ITouchEvent, Image, View } from '@tarojs/components'
import React from 'react'

import Button, { ButtonType } from '@/components/Button'
import { IRecordJdInfo } from '@/components/LoginButton'
import { IProps } from '@/def/common'
import { useIsLogin } from '@/hooks/custom/useUser'

import './index.scss'

export interface ISubmitBarProps extends IProps {
  type?: ButtonType
  text: string
  disabled?: boolean
  loading?: boolean
  onBtnClick?: (e: ITouchEvent) => void
  useLoginButton?: boolean
  loginButtonJdInfo?: IRecordJdInfo
  needShowButton?: boolean
  showBadge?: boolean
}
const SubmitBar: React.FC<ISubmitBarProps> = props => {
  const {
    text,
    disabled,
    loading = false,
    children = null,
    useLoginButton = false,
    onBtnClick,
    className,
    loginButtonJdInfo,
    needShowButton = true,
    showBadge = false,
  } = props

  let type: ButtonType = props.type || 'primary'
  disabled && (type = 'grey')

  const handleBtnClick = (event: ITouchEvent) => {
    if (!loading && type !== 'grey') {
      event.stopPropagation()
      onBtnClick && onBtnClick(event)
    }
  }

  return (
    <View className={['hd-submitbar', className].join(' ')}>
      <View className="hd-submitbar__left">{children}</View>
      {showBadge && (
        <Image
          className="badge"
          src="https://oss.yimaitongdao.com/mp/activity/dragonSpringWar/red-badge-1888.png"
        />
      )}
      {needShowButton && (
        <Button
          btnType={type}
          disabled={type === 'disabled'}
          loading={loading}
          onClick={handleBtnClick}
          useLoginButton={useLoginButton}
          loginButtonJdInfo={loginButtonJdInfo}
        >
          {text}
        </Button>
      )}
    </View>
  )
}

export default SubmitBar
