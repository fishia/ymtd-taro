import { Image, ScrollView, Textarea, View } from '@tarojs/components'
import {
  eventCenter,
  getSystemInfoSync,
  hideKeyboard,
  navigateTo,
  setStorage,
  usePageScroll,
} from '@tarojs/taro'
import c from 'classnames'
import _ from 'lodash'
import React, { useEffect, useMemo, useState } from 'react'

import { IM_COMMONLY_WORDS_TIPS_SHOW } from '@/config'
import useToast from '@/hooks/custom/useToast'
import { useCommonlyWords } from '@/hooks/message'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import goInputPage, { changeCommonlyWordEventKey } from '../../text-input/textInputContext'
import CommonlyWordItem from './CommonlyWordItem'
import CommonlyWordsTips from './CommonlyWordsTips'
import addButtonIcon from './add-icon.png'
import manageButtonIcon from './manage-icon.png'

import './index.scss'

export interface IInputBarProps {
  onSendText?(text: string): boolean
  onHeightChange?(height: number): void
  onInputOpen?(): void
}

const systemInfo = getSystemInfoSync()

const screenHeight = systemInfo.screenHeight
const safeAreaBottom = systemInfo.safeArea?.bottom ?? screenHeight

// 任何 PC 端开启小程序时，均无键盘高度
const isPCNoKeyboardHeight = ['devtools', 'mac', 'windows'].includes(systemInfo.platform)
// 非开发工具的 PC 端开启小程序时，页面底部高度强制为 0，因为 PC 端有 bug，安全区底部高度和页面高度不相等
// 如果是开发工具，需要考虑模拟全面屏的情况，因此不能强制设为 0
const pageBottomHeight = ['mac', 'windows'].includes(systemInfo.platform)
  ? 0
  : screenHeight - safeAreaBottom

const InputBar: React.FC<IInputBarProps> = props => {
  const { onInputOpen = _.noop, onHeightChange = _.noop, onSendText } = props

  const showToast = useToast()

  const [inputDisabled, setInputDisabled] = useState<boolean>(false)
  const [messageText, setMessageText] = useState<string>('')
  const [inputFocus, setInputFocus] = useState<boolean>(false)
  const [lineCount, setLineCount] = useState<number>(1)

  const [cyyScrollTop, setCyyScrollTop] = useState<number>(0)
  const [showCyy, setShowCyy] = useState<boolean>(false)

  const [kbHeight, setKeyboardHeight] = useState<number>(0)
  const [kbDuration, setKeyboardDuration] = useState<number>()
  const keyboardHeight = Math.max(kbHeight, pageBottomHeight)
  const keyboardDuration = isPCNoKeyboardHeight || kbDuration === undefined ? 0.25 : kbDuration

  const commonlyWords = useCommonlyWords()

  const cyyHeight = pageBottomHeight + 160 + 120 / 2

  const inputBottom = useMemo(() => {
    return inputFocus
      ? kbDuration === undefined && !isPCNoKeyboardHeight
        ? cyyHeight
        : keyboardHeight
      : showCyy
      ? cyyHeight
      : pageBottomHeight
  }, [inputFocus, keyboardHeight, showCyy, kbDuration, cyyHeight])

  useEffect(() => {
    onHeightChange(inputBottom + (90 + 30 * lineCount) / 2)
  }, [inputBottom, lineCount, onHeightChange, showCyy])

  // 编辑常用语后，自动滚动到顶部
  useEffect(() => {
    const callback = () => void setCyyScrollTop(t => (t ? 0 : 1))
    eventCenter.on(changeCommonlyWordEventKey, callback)

    return () => void eventCenter.off(changeCommonlyWordEventKey, callback)
  }, [])

  // 页面滚动
  usePageScroll(
    _.debounce(
      () => {
        if (!showCyy && inputFocus) {
          setShowCyy(false)
          setInputFocus(false)
          setInputDisabled(true)
          setTimeout(() => void setInputDisabled(false), 50)
          hideKeyboard()
        }
      },
      250,
      { leading: true, trailing: false }
    )
  )

  // 行高改变时，设置变量以提高输入区域高度
  const lineChangeHandler = (e: { detail: { lineCount: any } }) => {
    const newLineCount = Math.min(e?.detail?.lineCount || 1, 3)
    if (newLineCount !== lineCount) {
      setLineCount(newLineCount)
    }
  }

  // 点击输入框
  const inputClickHandler = () => {
    if (!inputFocus) {
      setInputFocus(true)
      setShowCyy(false)
      onInputOpen()
    }
  }

  // 输入框获取焦点
  const inputFocusHandler = e => {
    if (e.detail.height > 0 && keyboardHeight <= 0) {
      setKeyboardHeight(e.detail.height)
    }
  }

  // 输入框失去焦点
  const inputBlurHandler = () => {
    setInputFocus(false)
  }

  // 点击常用语按钮
  const cyyClickHandler = useMemo(
    () =>
      _.debounce(
        () => {
          setStorage({ key: IM_COMMONLY_WORDS_TIPS_SHOW, data: true })
          if (!showCyy) {
            if (!inputFocus) {
              onInputOpen()
            }
            setCyyScrollTop(t => (t ? 0 : 1))
            setShowCyy(true)
            setInputFocus(false)

            setInputDisabled(true)
            setTimeout(() => void setInputDisabled(false), 50)
            hideKeyboard()
          } else {
            setInputFocus(true)
            setShowCyy(false)
          }
        },
        300,
        { trailing: false, leading: true }
      ),
    [inputFocus, onInputOpen, showCyy]
  )

  // 点击常用语项
  const inputCyyHandler = (cyyStr: React.SetStateAction<string>) => {
    setMessageText(cyyStr)
    setInputFocus(true)

    if (isPCNoKeyboardHeight) {
      setShowCyy(false)
      setTimeout(() => void onInputOpen(), keyboardDuration * 1000)
    } else {
      setTimeout(() => {
        setShowCyy(false)
        onInputOpen()
      }, keyboardDuration * 1000)
    }
  }

  // 点击发送消息按钮
  const sendClickHandler = () => {
    // 展示常用语时点发送按钮，切换到输入模式，并不直接发送
    if (showCyy) {
      onInputOpen()
      setInputFocus(true)
      setTimeout(() => void setShowCyy(false), keyboardDuration * 1000)
      return
    }

    if (messageText.length <= 0) {
      showToast({ content: '请输入内容' })
      return
    }

    const isSuccess = onSendText && onSendText(messageText)
    if (isSuccess) {
      setMessageText('')
    }
  }

  // 键盘高度变化时，记录键盘信息
  const keyboardHeightChangeHandler = e => {
    if (e.detail.height > 50) {
      setKeyboardHeight(e.detail.height || 0)
      setKeyboardDuration(e.detail.duration || 0)
    }
  }

  // 添加常用语
  const addCommonlyWordHanlder = () => {
    if (commonlyWords.length >= 20) {
      showToast({ content: '常用语已达上限' })
      return
    }

    goInputPage({ mode: 'commonly-word', id: 0 })
  }

  // 管理常用语
  const manageCommonlyWordHanlder = () => {
    navigateTo({ url: '/weapp/message/commonly-word/index' })
  }

  return (
    <>
      <View
        className={c('chat__input-bar', {
          l2: lineCount >= 2,
          l3: lineCount >= 3,
        })}
        style={{
          bottom: inputBottom,
          transition: `bottom ${keyboardDuration}s ease`,
        }}
      >
        {showCyy ? (
          <View onClick={cyyClickHandler} className="kb-button chat__input-button">
            <View className="icon iconfont iconjianpan"></View>
          </View>
        ) : (
          <View onClick={cyyClickHandler} className="cyy-button chat__input-button">
            <CommonlyWordsTips />
            常用语
          </View>
        )}

        <Textarea
          className="chat__input"
          value={messageText}
          focus={inputFocus}
          onClick={inputClickHandler}
          onLineChange={lineChangeHandler}
          onInput={e => void setMessageText(e.detail.value)}
          placeholder="请输入消息内容"
          placeholderClass="chat-input__placeholder"
          adjustPosition={false}
          showConfirmBar={false}
          cursorSpacing={32}
          onKeyboardHeightChange={keyboardHeightChangeHandler}
          onFocus={inputFocusHandler}
          onBlur={inputBlurHandler}
          disabled={inputDisabled}
          maxlength={500}
          // @ts-ignore
          confirmType="return"
          autoHeight
          // @ts-ignore
          confirmHold
          holdKeyboard
        />
        <View
          onClick={sendClickHandler}
          className={c('send_button chat__input-button', { disabled: messageText.length <= 0 })}
        >
          发送
        </View>
      </View>
      <View
        className="chat__cyy-wrapper"
        style={{
          height: showCyy ? cyyHeight - pageBottomHeight : 0,
          transition: `all ${keyboardDuration}s ease`,
        }}
      >
        <ScrollView className="chat__cyy" style={{ height: 160 }} scrollTop={cyyScrollTop} scrollY>
          <View style={{ overflow: 'hidden' }}>
            {commonlyWords.map(item => (
              <CommonlyWordItem
                onClick={() => {
                  sendDataRangersEventWithUrl('TemplateMsgClick')
                  inputCyyHandler(item.content)
                }}
                item={item}
                key={item.commonWordsId}
              />
            ))}
          </View>
        </ScrollView>
        <View className="chat__cyy-action" style={{ height: 120 / 2 }}>
          <View
            onClick={addCommonlyWordHanlder}
            className="chat__cyy-action__button"
            hoverClass="hover"
          >
            <Image className="button-icon" src={addButtonIcon} />
            添加
          </View>
          <View
            onClick={manageCommonlyWordHanlder}
            className="chat__cyy-action__button"
            hoverClass="hover"
          >
            <Image className="button-icon" src={manageButtonIcon} />
            管理
          </View>
        </View>
      </View>

      <View className="chat__safearea"></View>
    </>
  )
}

export default InputBar
