import { IConversationStatus, IMessage } from '@/def/message'

interface IChatPrepareData {
  chatStatus: IConversationStatus
  messageList: IMessage[]
  isNoMore: boolean
  earliestMessageTime: number
}

const initialChatPrepareData: IChatPrepareData = {
  chatStatus: {} as IConversationStatus,
  messageList: [],
  isNoMore: false,
  earliestMessageTime: Infinity,
}

const currentPrepareData = {
  value: initialChatPrepareData,
}

export function setChatPrepareData(newData: IChatPrepareData) {
  currentPrepareData.value = newData
}

export function popChatPrepareData(): IChatPrepareData {
  const result = currentPrepareData.value
  Object.assign(currentPrepareData, { value: initialChatPrepareData })

  return result
}
