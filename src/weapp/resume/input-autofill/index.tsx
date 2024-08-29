import { View } from '@tarojs/components'
import { navigateBack, eventCenter, setNavigationBarTitle } from '@tarojs/taro'
import React, { useEffect, useRef, useState } from 'react'

import { checkSensitiveWordsApi } from '@/apis/resume'
import { IInputCurrent } from '@/def/common'
import useToast from '@/hooks/custom/useToast'
import MainLayout from '@/layout/MainLayout'

import {
  getInputAutofillOption,
  InputAutofillEventName,
} from '../components/InputWithAutofill/useInputAutofill'
import NoPickerList from './components/NoPickerList'
import SearchBar from './components/SearchBar'

import './index.scss'

const SchoolSearch: React.FC = () => {
  const showToast = useToast()

  const inputRef = useRef<IInputCurrent>(null)
  const [tipsVisible, setTipsVisible] = useState<Boolean>(false)

  const {
    fetcher,
    tips,
    pageNavTitle,
    renderThinkItem,
    checkSensitive,
    minLength,
    maxLength,
  } = getInputAutofillOption()!

  useEffect(
    () => {
      setNavigationBarTitle({ title: pageNavTitle || '' })

      return () => void eventCenter.off(InputAutofillEventName)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // 确认选择的值
  const confirmHandler = async (keyword: string, item?: any) => {
    if (minLength && (keyword || '').length < minLength) {
      showToast({ content: `${pageNavTitle}至少输入${minLength}个字` })
      return
    }

    if (checkSensitive) {
      const pass = await checkSensitiveWordsApi(keyword || '')
      if (!pass) {
        showToast({ content: `${pageNavTitle}内容包含敏感词，请修改` })
        return
      }
    }

    eventCenter.trigger(InputAutofillEventName, keyword, item)
    navigateBack()
  }

  return (
    <MainLayout className="picker-search input-autofill">
      <View className="picker-search__navbar">
        <SearchBar
          ref={inputRef}
          onSearch={fetcher}
          onRightButtonClick={confirmHandler}
          onSearchResultClick={confirmHandler}
          border={false}
          placeholder={'请输入' + tips + '名称'}
          onClear={() => void setTipsVisible(false)}
          renderNoListTips={() => void setTipsVisible(true)}
          renderThinkItem={renderThinkItem}
          maxLength={maxLength}
          showRightBtn
          pagination
        />
        <View className="picker-search__navbar-bottom" />
      </View>

      {tipsVisible && <NoPickerList tipsText={tips} />}
    </MainLayout>
  )
}

export default SchoolSearch
