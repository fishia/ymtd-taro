import { Image, Input, Text, View } from '@tarojs/components'
import { setNavigationBarTitle, eventCenter, navigateBack } from '@tarojs/taro'
import c from 'classnames'
import React, { useEffect, useState } from 'react'

import useAlertBeforeUnload from '@/hooks/custom/useAlertBeforeUnload'
import useToast from '@/hooks/custom/useToast'
import MainLayout from '@/layout/MainLayout'

import FixedButton from '../components/FixedButton'
import {
  getInputLongtextOption,
  InputLongtextEventName,
  InputTextEventName,
} from '../components/Textarea/useInputLongtext'
import ClearIcon from './clear.png'

import './index.scss'

const InputText: React.FC = () => {
  const {
    pageNavTitle = '',
    inputPlaceholder,
    minLength = 0,
    maxLength = 20,
    defaultText,
    alertBeforeUnload = false,
    alertBeforeUnloadText = '填写内容未保存，是否退出？',
    rule,
    showCount = true,
    showClear = true,
  } = getInputLongtextOption()!

  const showToast = useToast()
  const { enableAlertBeforeUnload, disableAlertBeforeUnload } = useAlertBeforeUnload()

  const [text, setText] = useState(() => defaultText || '')
  const [error, setError] = useState(false)

  useEffect(
    () => {
      if (alertBeforeUnload) {
        enableAlertBeforeUnload(alertBeforeUnloadText)
      }
      setNavigationBarTitle({ title: pageNavTitle })

      return () => void eventCenter.off(InputLongtextEventName)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const validatorValue = value => {
    if (value.length <= 0) {
      setError(true)
      showToast({ content: `请先输入你的${pageNavTitle}` })
      return false
    }
    if (value.length < minLength) {
      setError(true)
      showToast({ content: `${pageNavTitle}至少输入${minLength}个字` })
      return false
    }

    if (rule && !new RegExp(rule).test(value)) {
      setError(true)
      showToast({
        content: pageNavTitle === '微信号' ? '微信号不支持中文汉字' : `请输入正确的${pageNavTitle}`,
      })

      return false
    }

    return true
  }
  const confirmHandler = async () => {
    if (validatorValue(text)) {
      eventCenter.trigger(InputTextEventName, text)
      if (alertBeforeUnload) {
        disableAlertBeforeUnload()
      }
      navigateBack()
    }
  }

  const onTextareaInput = e => {
    const inputText = e.detail.value.trim()
    setText(inputText)
    if (validatorValue(inputText)) {
      setError(false)
      return inputText
    }
  }

  return (
    <MainLayout>
      <View className={c('form__inputText', error ? 'form__inputText--error' : '')}>
        <Input
          value={text}
          onInput={onTextareaInput}
          onConfirm={confirmHandler}
          placeholder={inputPlaceholder}
          // @ts-ignore
          confirmType="done"
          maxlength={maxLength}
          focus
          className="form__inputText__input"
          placeholderClass="form__inputText__input-placeholder"
        />
        <View className={c(showClear || showCount ? 'form__inputText__lengthCount' : 'dis-n')}>
          {showClear && text.length ? (
            <View>
              <Image src={ClearIcon} onClick={() => setText('')} />
            </View>
          ) : null}
          {showCount && (
            <View>
              <Text className={c(text.length ? 'form__inputText__lengthCount--hl' : '')}>
                {text.length}
              </Text>
              /{maxLength}
            </View>
          )}
        </View>
      </View>
      <FixedButton btnType="primary" onClick={confirmHandler}>
        保存
      </FixedButton>
    </MainLayout>
  )
}

export default InputText
