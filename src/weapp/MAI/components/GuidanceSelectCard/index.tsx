import { View, Text } from '@tarojs/components'

import Button from '@/components/Button'
import useShowModal, { useHideModal } from '@/hooks/custom/useShowModal'
import { sendDataRangersEvent } from '@/utils/dataRangers'

import { Message } from '../../chat'
import { ItemProps } from '../ChatItem'

import './index.scss'

const GuidanceSelectCard: React.FC<ItemProps> = props => {
  const {
    uuid,
    role,
    content,
    extraContent,
    inputRef,
    setShowInputBar,
    chooseIdenity,
    interceptBtn,
    type,
    showEdit,
  } = props
  const showModal = useShowModal({ mode: 'thenCatch' })
  const hideModal = useHideModal()

  const firstBtn = extraContent?.buttonsList[0]

  const secondBtn = extraContent?.buttonsList[1]

  const rangersEvent = (types: string) => {
    sendDataRangersEvent('Button_click', {
      page_name: 'M.AI_IM页',
      button_type: types,
    })
  }

  const rangersModalEvent = (types: string, popup_name) => {
    sendDataRangersEvent('Button_click', {
      page_name: 'M.AI_IM页',
      button_type: types,
      popup_name,
    })
  }

  const awakeInput = async (e, text?: string) => {
    await chooseIdenity({ uuid, type } as Message, false, true, text ? 'all' : 1)
    setShowInputBar(true)
    setTimeout(() => {
      inputRef.current.inputClickHandler(e)
      if (text) {
        inputRef.current.setMessageText(text)
      }
    }, 300)
  }

  const firstClick = e => {
    if (interceptBtn({ type } as Message)) {
      return
    }

    rangersEvent('导入示例指令')
    if (inputRef.current?.messageText.trim()) {
      sendDataRangersEvent('EventExpose', {
        page_name: 'M.AI_IM页',
        event_name: '内容被替换温馨提示弹窗',
      })
      showModal({
        title: '温馨提示',
        content: '导入示例指令后当前手动输入的内容将被替换成示例指令，是否继续导入？',
        confirmText: '取消导入',
        cancelText: '继续导入',
        closeOnClickOverlay: false,
        closeNoCancel: true,
        showClear: false,
      })
        .then(() => {
          rangersModalEvent('取消导入', '内容被替换温馨提示弹窗')
          hideModal()
        })
        .catch(res => {
          if (res) {
            rangersModalEvent('继续导入', '内容被替换温馨提示弹窗')
            awakeInput(e, extraContent?.content)
          }
        })
      return
    }

    awakeInput(e, extraContent?.content)
  }

  const secondClick = e => {
    if (interceptBtn({ type } as Message)) {
      return
    }
    rangersEvent('手动输入')
    awakeInput(e)
  }

  return (
    <>
      {/* <View className="message-content-title">
        <View className="title">现在让我们开启创建简历之旅吧！</View>
        <View className="subContent">
          首先，请发送一条「指令」给我，我为你提供了A.B两种方法来生成「指令」，请选择
        </View>
      </View> */}
      <View className="message-content-title borderNone">
        {/* <View className="title">A.导入示例指令</View>
        <View className="subContent">仅需修改几个关键信息即可生成</View> */}
        <Text className="text">
          {content}
          {showEdit && role === 'assistant' && <Text className="icon iconfont iconMAIedit" />}
        </Text>

        {/* <View className="newBottomLine"></View>
        <View className="title">B.完全手动输入</View>
        <View className="subContent">需要输入个人信息、求职期望、工作经历、教育经历等</View> */}
        {firstBtn && !firstBtn.used && (
          <Button className="newBottomBtn" round onClick={firstClick}>
            {firstBtn.title}
          </Button>
        )}

        {secondBtn && !secondBtn.used && (
          <Button className="newBottomBtn hd-button--borderAndBg" onClick={secondClick}>
            {secondBtn.title}
          </Button>
        )}
      </View>
    </>
  )
}

export default GuidanceSelectCard
