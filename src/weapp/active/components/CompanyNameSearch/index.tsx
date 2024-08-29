import React from 'react'
import { View, Input, Icon } from '@tarojs/components'
import './index.scss'

interface Iprops {
  placeholder: string
  fetchMethod: Function
}

const CompanyNameSearch: React.FC<Iprops> = props => {
  const { placeholder, fetchMethod } = props
  const confirm = event => {
    fetchMethod(event.detail.value)
  }
  return (
    <View className="gbui-search-bar">
      <View className="weui-search-bar">
        <View className="weui-search-bar__form">
          <View className="weui-search-bar__box">
            <Input
              placeholder={placeholder}
              maxlength={24}
              confirmType="search"
              onConfirm={confirm}
            />
          </View>
          <Icon size="14" type="search" />
        </View>
      </View>
    </View>
  )
}

export default CompanyNameSearch
