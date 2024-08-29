import { Textarea, View } from '@tarojs/components'
import { getSystemInfoSync, hideKeyboard, usePageScroll } from '@tarojs/taro'
import c from 'classnames'
import _, { find, last } from 'lodash'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { AtButton } from 'taro-ui'

import Button from '@/components/Button'
import ToastTips from '@/components/ToastTips'
import { MaiInputBarBtnType, MaiSourceType, chatListItem } from '@/def/MAI'
import useShowModal, { useHideModal } from '@/hooks/custom/useShowModal'
import useToast from '@/hooks/custom/useToast'
import { senceDataText } from '@/hooks/message/maiSocket'
import { sendDataRangersEvent } from '@/utils/dataRangers'

import './index.scss'

export interface IInputBarProps {
  onSendText?(text: string): boolean
  onHeightChange?(height: number): void
  onInputOpen?(): void
  type?: MaiInputBarBtnType
  stopClick?: () => void
  refrashClick?: () => void
  setInputBarType: (e: MaiInputBarBtnType) => void
  toastOpen: boolean
  close: () => void
  sence: string
  messageList: chatListItem[]
  isSendMessage: boolean
}

export interface IMAIInputRef {
  messageText: string
  inputClickHandler: (e) => void
  setMessageText: (e: string) => void
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

const InputBar = (props: IInputBarProps, ref) => {
  const {
    onInputOpen = _.noop,
    onHeightChange = _.noop,
    onSendText,
    type = MaiInputBarBtnType.Input,
    stopClick = _.noop,
    refrashClick = _.noop,
    setInputBarType,
    toastOpen,
    close,
    sence,
    messageList = [],
    isSendMessage,
  } = props

  const showToast = useToast()

  const [inputDisabled, setInputDisabled] = useState<boolean>(false)
  const [messageText, setMessageText] = useState<string>('')
  const [inputFocus, setInputFocus] = useState<boolean>(false)
  const [lineCount, setLineCount] = useState<number>(1)

  const [showCyy, setShowCyy] = useState<boolean>(false)

  const [kbHeight, setKeyboardHeight] = useState<number>(0)
  const [kbDuration, setKeyboardDuration] = useState<number>()
  const keyboardHeight = Math.max(kbHeight, pageBottomHeight)
  const keyboardDuration = isPCNoKeyboardHeight || kbDuration === undefined ? 0.25 : kbDuration
  const [btnDisabled, setBtnDisabled] = useState<boolean>(true)
  const showModal = useShowModal({ mode: 'thenCatch' })
  const hideModal = useHideModal()

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
    onHeightChange(inputBottom + (92 + 42 * lineCount) / 2)
  }, [inputBottom, lineCount, onHeightChange, showCyy])

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

  useImperativeHandle<any, IMAIInputRef>(ref, () => ({
    messageText,
    inputClickHandler,
    setMessageText,
  }))

  // 行高改变时，设置变量以提高输入区域高度
  const lineChangeHandler = (e: { detail: { lineCount: any } }) => {
    const newLineCount = Math.min(e?.detail?.lineCount || 1, 8)
    if (newLineCount !== lineCount) {
      setLineCount(newLineCount)
    }
  }

  // 点击输入框
  const inputClickHandler = e => {
    e.stopPropagation()
    if (!inputFocus && !inputDisabled) {
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

  const sendClickMsg = () => {
    setInputBarType(MaiInputBarBtnType.Stop)
    setBtnDisabled(true)
    const isSuccess = onSendText && onSendText(messageText)
    if (isSuccess) {
      setMessageText('')
    }
    hideKeyboard()
  }

  const rangersModalEvent = (button_type: string, popup_name) => {
    sendDataRangersEvent('Button_click', {
      page_name: 'M.AI_IM页',
      button_type,
      popup_name,
    })
  }

  // 点击发送消息按钮
  const sendClickHandler = () => {
    setInputFocus(false)

    if (messageText.trim().length <= 0) {
      showToast({ content: '请输入内容' })
      setMessageText('')
      return
    }

    // 判断，如果最后一条消息是点击创建之旅后机器人返回文本，并且输入框里的消息没有改动，则弹窗提示
    const lastItem = last(messageList)
    if (
      lastItem?.type === MaiSourceType.GUIDANCE_CMD_SELECT &&
      lastItem.extraContent?.content === messageText
    ) {
      sendDataRangersEvent('EventExpose', {
        page_name: 'M.AI_IM页',
        event_name: '内容未修改温馨提示弹窗',
      })
      showModal({
        title: '温馨提示',
        content: '指令示例内容未修改，直接使用会生成示例对应的简历，是否返回修改？',
        confirmText: '去修改',
        cancelText: '直接使用',
        closeOnClickOverlay: false,
        closeNoCancel: true,
        showClear: false,
      })
        .then(() => {
          rangersModalEvent('去修改', '内容未修改温馨提示弹窗')
          hideModal()
        })
        .catch(res => {
          if (res) {
            rangersModalEvent('直接使用', '内容未修改温馨提示弹窗')
            sendClickMsg()
          }
        })
      return
    }

    sendClickMsg()
  }

  const exitBtnClick = () => {
    if (type === MaiInputBarBtnType.Stop) {
      stopClick()
      return
    }
    refrashClick()
  }

  // 键盘高度变化时，记录键盘信息
  const keyboardHeightChangeHandler = e => {
    if (e.detail.height > 50) {
      setKeyboardHeight(e.detail.height || 0)
      setKeyboardDuration(e.detail.duration || 0)
    }
  }

  useEffect(() => {
    setBtnDisabled(messageText ? false : true)
    if (messageText) {
      setInputBarType(MaiInputBarBtnType.Input)
    }
  }, [messageText])

  useEffect(() => {
    const hasLoading = find(messageList, ['loading', true])

    // 机器人回复中不可输入
    if (type === MaiInputBarBtnType.Stop) {
      setInputDisabled(true)
      setBtnDisabled(hasLoading ? true : false)
      return
    }
    // 列表有loading对话是不可输入
    if (hasLoading) {
      setInputDisabled(true)
      return
    }
    setInputDisabled(false)
  }, [type, messageList])

  return (
    <>
      <View
        className={c('chat__input-bar', {
          // l2: lineCount >= 2,
          // l3: lineCount >= 3,
          // l4: lineCount >= 4,
          // l5: lineCount >= 5,
        })}
        style={{
          bottom: inputBottom,
          transition: `bottom ${keyboardDuration}s ease`,
        }}
      >
        <View className="chat-bottom-wrap">
          <ToastTips
            visible={toastOpen}
            onClose={close}
            className="chat-bottom-wrap__toastTips"
            content={
              <View className="chat-bottom-wrap__toastTips__text">
                对结果不满意？继续输入，我能为你优化 {senceDataText[sence].text}
              </View>
            }
          />
          <Textarea
            className="chat__input"
            value={messageText}
            focus={inputFocus}
            onClick={inputClickHandler}
            onLineChange={lineChangeHandler}
            onInput={e => void setMessageText(e.detail.value)}
            placeholder={isSendMessage ? '输入你想优化的内容' : senceDataText[sence].placeHolder}
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
        </View>

        <View className="chatBtnCss">
          {type === MaiInputBarBtnType.Input ? (
            <Button disabled={btnDisabled} className="send-button-input" onClick={sendClickHandler}>
              发送
            </Button>
          ) : (
            <AtButton
              disabled={btnDisabled}
              type="primary"
              className="send-button"
              onClick={exitBtnClick}
            >
              {type === MaiInputBarBtnType.Refrash && (
                <View className="icon iconfont iconcontinueMsg default" />
              )}
              {type === MaiInputBarBtnType.Stop && (
                <View
                  className={`"icon iconfont iconstopMessage ${
                    btnDisabled ? 'disabled' : 'default'
                  }"`}
                />
              )}
            </AtButton>
          )}
        </View>
      </View>

      <View className="chat__safearea"></View>
    </>
  )
}

export default forwardRef(InputBar)
