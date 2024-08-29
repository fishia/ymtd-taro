import { IExpansionListenerData } from '@rongcloud/imlib-v4'
import { eventCenter } from '@tarojs/taro'

import { IMReciveUpdateExpansion } from '@/def/message'

export default function watchExpansion(e: IExpansionListenerData) {
  const message = e.updatedExpansion!
  eventCenter.trigger(IMReciveUpdateExpansion, message)

  if (process.env.DEBUG_MESSAGE === 'on') {
    console.log('☆ 收到更新扩展消息：', message)
  }
}
