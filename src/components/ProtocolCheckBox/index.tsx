import React from 'react'
import _ from 'lodash'
import { Text, ITouchEvent, View } from '@tarojs/components'
import { IProps } from '@/def/common'
import c from 'classnames'
import './index.scss'
import { navigateTo } from '@tarojs/taro'

export interface ICheckboxProps extends IProps {
  onCheck?(boolean): void
  onClick?(e: ITouchEvent): void
  onDisabledClick?(e: ITouchEvent): void
  text?: string | React.ReactNode
  checked: boolean
  tipsText?: string
  disabled?: boolean
  tipsVisible?: boolean
  isSheidCompany?: boolean //是否是屏蔽公司使用
}

const ProtocolCheckBox: React.FC<ICheckboxProps> = props => {
  const {
    text,
    checked,
    tipsText = '请先阅读并勾选协议政策',
    tipsVisible = false,
    disabled = false,
    className,
    onCheck = _.noop,
    onClick = _.noop,
    onDisabledClick = _.noop,
    isSheidCompany = false,
  } = props

  const handleClick = (event: ITouchEvent) => {
    event.stopPropagation()
    event.preventDefault()

    if (disabled) {
      onDisabledClick(event)
      return
    }

    onClick && onClick(event)
  }
  const handleCheckbox = () => {
    onCheck(!checked)
  }

  const goProtocol = (e, current) => {
    e?.stopPropagation()
    navigateTo({ url: `/weapp/general/protocol/index?current=${current}` })
  }
  const ToastTips = () => (
    <View
      className={c('form-checkbox-tips', {
        'form-checkbox-tips--active': tipsVisible && !checked,
      })}
    >
      <View className="form-checkbox-tips__wrap">
        <View className="form-checkbox-tips__arrow"></View>
        <View className="form-checkbox-tips__text">{tipsText}</View>
      </View>
    </View>
  )
  return (
    <View className={c('form-checkbox', className)}>
      <View className="form-checkbox__protocol" onClick={handleCheckbox}>
        <View
          className={
            checked
              ? 'icon iconfont icongouxuan icongouxuan--checked'
              : isSheidCompany
              ? 'icon iconfont iconnocheck'
              : 'icon iconfont icongouxuan'
          }
        />
        {text ? (
          text
        ) : (
          <View className="form-checkbox__protocol--text" onClick={handleClick}>
            我已阅读并同意
            <Text className="form-checkbox__protocol--link" onClick={e => goProtocol(e, 0)}>
              《用户协议》
            </Text>
            及
            <Text className="form-checkbox__protocol--link" onClick={e => goProtocol(e, 1)}>
              《用户隐私政策》
            </Text>
          </View>
        )}
      </View>
      <ToastTips />
    </View>
  )
}

export default ProtocolCheckBox
