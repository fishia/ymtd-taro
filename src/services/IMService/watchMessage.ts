import { eventCenter } from '@tarojs/taro'
import { IAReceivedMessage } from '@rongcloud/imlib-v4'

import { IMReciveMessageEventPrefix, IReadTagMessage, MessageType } from '@/def/message'
import { dispatchAttachConversationReadStatus } from '@/store'
import { runIMFirstLaunchedDone } from '.'

export default function watchMessage(e: { message: IAReceivedMessage }) {
  if (!runIMFirstLaunchedDone()) {
    return
  }

  const message = e.message

  // 收到已读回执，更新 hr_last_read_time 标记
  if (message.messageType === MessageType.READ_RECEIPT) {
    dispatchAttachConversationReadStatus(message.targetId, {
      hr_last_read_time: (message as IReadTagMessage).content.lastMessageSendTime,
    })
  } else {
    // 触发全局事件
    eventCenter.trigger(IMReciveMessageEventPrefix + e.message.targetId, e.message)
  }

  if (process.env.DEBUG_MESSAGE === 'on') {
    console.log('☆ 收到消息：', message)
  }
}
