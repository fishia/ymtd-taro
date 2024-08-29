import { navigateTo } from '@tarojs/taro'

export interface IMessageTextInputOption {
  id: number
  defaultText?: string
  mode: 'commonly-word' | 'greeting-word'
}

export const changeCommonlyWordEventKey = 'changeCommonlyWordEventKey'
export const changeGreetingWordEventKey = 'changeGreetingWordEventKey'

const textInputOptionRef: Record<'current', IMessageTextInputOption | null> = {
  current: null,
}

export function getTextInputOption(): IMessageTextInputOption | null {
  return textInputOptionRef.current
}

export function setTextInputOption(option: IMessageTextInputOption) {
  textInputOptionRef.current = option
}

export default function goInputPage(option: IMessageTextInputOption) {
  textInputOptionRef.current = option
  navigateTo({ url: '/weapp/message/text-input/index' })
}
