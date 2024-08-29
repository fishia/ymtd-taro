import { Text, Textarea, View, Image } from '@tarojs/components'
import {
  setNavigationBarTitle,
  getSystemInfoSync,
  eventCenter,
  navigateBack,
  getCurrentPages,
  useDidShow,
} from '@tarojs/taro'
import c from 'classnames'
import { noop } from 'lodash'
import React, { useEffect, useState } from 'react'

import { checkSensitiveWordsApi } from '@/apis/resume'
// import robotAvatar from '@/assets/imgs/MAI/robotHead.png'
import useAlertBeforeUnload from '@/hooks/custom/useAlertBeforeUnload'
import useToast from '@/hooks/custom/useToast'
import MainLayout from '@/layout/MainLayout'

import FixedButton from '../components/FixedButton'
import {
  getInputLongtextOption,
  InputLongtextEventName,
} from '../components/Textarea/useInputLongtext'

import './index.scss'
import { OSS_STATIC_HOST } from '@/config'

const pageHeight = getSystemInfoSync().windowHeight - 132 / 2 - 168 / 2

const robotAvatar = `${OSS_STATIC_HOST}/mp/createResume/ic_M.AI%402x.png`

const LongTextInput: React.FC = () => {
  const {
    pageTitle = '',
    pageNavTitle = '',
    desc = '',
    showMAIbtn = false,
    inputPlaceholder,
    minLength = 0,
    maxLength = 3000,
    defaultText,
    alertBeforeUnload = false,
    alertBeforeUnloadText = '填写内容未保存，是否退出？',
    checkSensitive = false,
    MAIClick = noop,
  } = getInputLongtextOption()!

  const showToast = useToast()
  const { enableAlertBeforeUnload, disableAlertBeforeUnload } = useAlertBeforeUnload()

  const [text, setText] = useState(() => defaultText || '')
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const isDisabled = text.length <= 0

  useEffect(
    () => {
      setNavigationBarTitle({ title: pageNavTitle })

      return () => void eventCenter.off(InputLongtextEventName)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const confirmHandler = async () => {
    if (text.length < minLength) {
      showToast({ content: `${pageNavTitle}至少输入${minLength}个字` })

      return
    }

    if (checkSensitive) {
      const pass = await checkSensitiveWordsApi(text || '')
      if (!pass) {
        showToast({ content: `${pageNavTitle}内容包含敏感词，请修改` })

        return
      }
    }

    eventCenter.trigger(InputLongtextEventName, text)

    if (alertBeforeUnload) {
      disableAlertBeforeUnload()
    }

    navigateBack()
  }

  const onTextareaInput = e => {
    const inputText = e.detail.value
    setText(inputText)
    return inputText
  }

  useDidShow(() => {
    if (alertBeforeUnload) {
      enableAlertBeforeUnload(alertBeforeUnloadText)
    }
    // 监听MAI返回
    let pages = getCurrentPages()
    let currentPage = pages[pages.length - 1]
    currentPage.data.text && setText(currentPage.data.text)
  })

  return (
    <MainLayout className="longtext-input">
      <View className="longtext-input__titleContent">
        <View className="longtext-input__title">
          {pageTitle}
          <Text className="longtext-input__title-count">
            （<Text className={c(text?.length ?? 0 > 0 ? 'active' : '')}>{text?.length || 0}</Text>/
            {maxLength}）
          </Text>
          {showMAIbtn && (
            <View className="longtext-input__MAIBtn" onClick={MAIClick}>
              <Image src={robotAvatar} className="longtext-input__MAIBtn__Icon" />
              M.AI帮写
            </View>
          )}
        </View>
        {desc && <Text className="longtext-input__title-tips">{desc}</Text>}
      </View>

      <Textarea
        value={text}
        onInput={onTextareaInput}
        placeholder={inputPlaceholder}
        className="longtext-input__textarea"
        placeholderClass="longtext-input__textarea-placeholder"
        // @ts-ignore
        confirmType="return"
        maxlength={maxLength}
        onKeyboardHeightChange={e => void setKeyboardHeight(e.detail.height)}
        // style={{ height: pageHeight - keyboardHeight }}
        disableDefaultPadding
        // focus
      ></Textarea>

      <FixedButton btnType="primary" disabled={isDisabled} onClick={confirmHandler}>
        保存
      </FixedButton>
    </MainLayout>
  )
}

export default LongTextInput
