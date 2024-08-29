import { Text, Textarea, View } from '@tarojs/components'
import {
  setNavigationBarTitle,
  navigateBack,
  showLoading,
  hideLoading,
  onKeyboardHeightChange,
  offKeyboardHeightChange,
  eventCenter,
} from '@tarojs/taro'
import React, { useEffect, useState } from 'react'

import {
  addCommonlyWordApi,
  addGreetingWordApi,
  updateCommonlyWordApi,
  updateGreetingWordApi,
} from '@/apis/message'
import Button from '@/components/Button'
import useAlertBeforeUnload from '@/hooks/custom/useAlertBeforeUnload'
import useToast from '@/hooks/custom/useToast'
import MainLayout from '@/layout/MainLayout'
import { dispatchAddCommonlyWord, dispatchUpdateCommonlyWord } from '@/store/message'

import {
  changeCommonlyWordEventKey,
  changeGreetingWordEventKey,
  getTextInputOption,
} from './textInputContext'

import './index.scss'

const TextInputPage: React.FC = () => {
  const { defaultText = '', id = 0, mode } = getTextInputOption()!

  const showToast = useToast()
  const { enableAlertBeforeUnload, disableAlertBeforeUnload } = useAlertBeforeUnload()

  const [text, setText] = useState('')
  const [isEdit, setIsEdit] = useState(false)

  const [kbHeight, setKbHeight] = useState(0)

  const isNew = id === 0
  const modeText = mode === 'commonly-word' ? '常用语' : '招呼语'
  const isDisabled = text.length <= 0

  useEffect(() => {
    setText(defaultText)
    setNavigationBarTitle({ title: `${isNew ? '新建' : '编辑'}${modeText}` })

    const keyboarChangeHandler = info => {
      setKbHeight(info.height)
    }

    onKeyboardHeightChange(keyboarChangeHandler)

    return () => void offKeyboardHeightChange(keyboarChangeHandler)
  }, [defaultText, isNew, modeText])

  useEffect(() => {
    if (isEdit) {
      enableAlertBeforeUnload('填写内容未保存，是否退出？')
    }
  }, [enableAlertBeforeUnload, isEdit])

  const commonlyWordConfirmHandler = () => {
    const apiFn = isNew ? addCommonlyWordApi : updateCommonlyWordApi
    showLoading({ title: '提交中...' })
    apiFn(text, id)
      .then(res => {
        if (isNew) {
          dispatchAddCommonlyWord(res)
        } else {
          dispatchUpdateCommonlyWord({ commonWordsId: id, content: text })
        }
        eventCenter.trigger(changeCommonlyWordEventKey)
        disableAlertBeforeUnload()
        hideLoading()
        navigateBack()
      })
      .catch(error => {
        hideLoading()
        showToast({ content: error.errorMessage || '提交失败，请稍后再试' })
      })
  }

  const greetingWordConfirmHandler = () => {
    const apiFn = isNew ? addGreetingWordApi : updateGreetingWordApi
    showLoading({ title: '提交中...' })
    apiFn(text, id)
      .then(() => {
        eventCenter.trigger(changeGreetingWordEventKey)
        disableAlertBeforeUnload()
        hideLoading()
        navigateBack()
      })
      .catch(error => {
        hideLoading()
        showToast({ content: error.errorMessage || '提交失败，请稍后再试' })
      })
  }

  const confirmHandler = () => {
    if (mode === 'commonly-word') {
      commonlyWordConfirmHandler()
    } else {
      greetingWordConfirmHandler()
    }
  }

  const inputHandler = e => {
    setIsEdit(true)
    const inputValue: string = e.detail.value
    if (inputValue.length > 200) {
      showToast({ content: '最多可输入200字' })
    }

    setText(inputValue.substring(0, 200))

    return inputValue.substring(0, 200)
  }

  return (
    <MainLayout className="text-input">
      <Textarea
        value={text}
        onInput={inputHandler}
        placeholder={`请输入${modeText}，勿填写手机号、微信、QQ、邮箱等联系方式`}
        className="text-input__textarea"
        placeholderClass="text-input__textarea-placeholder"
        // @ts-ignore
        confirmType="return"
        showConfirmBar={false}
        cursorSpacing={108}
        disableDefaultPadding
        style="min-height: 400px;max-height: 500px"
        maxlength={210}
        autoHeight
        focus
      >
      </Textarea>
      {/* <View className="text-input__border"></View> */}

      <View className="text-input__toolbar" style={{ bottom: kbHeight > 0 ? kbHeight : undefined }}>
        <Text className={'text-input__toolbar-tips ' + (text.length > 0 ? 'strong' : '')}>
          {text.length}
        </Text>
        /200
        {kbHeight > 0 ? (
          <View onClick={confirmHandler} className="text-input__toolbar-submit">
            完成
          </View>
        ) : null}
      </View>

      <View className="text-input__action">
        <Button
          onClick={confirmHandler}
          className="text-input__confirm"
          disabled={isDisabled}
          btnType="primary"
        >
          完成
        </Button>
      </View>
    </MainLayout>
  )
}

export default TextInputPage
