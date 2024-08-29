import { ITouchEvent } from '@tarojs/components'
import { eventCenter, navigateTo } from '@tarojs/taro'

import { itemProps } from '@/components/ThinkInput'

export interface IUseInputAutofillOption {
  fetcher(keyword: string, page?: number): any
  pageNavTitle?: string
  tips?: string
  checkSensitive?: boolean
  maxLength?: number
  minLength?: number
  renderThinkItem?: (
    item: any,
    keyword: string,
    handleItemClick?: (e: ITouchEvent, data: itemProps) => any
  ) => React.ReactNode
}

export const InputAutofillEventName = 'inputAutofill'

const inputAutofillOptionRef: Record<'current', IUseInputAutofillOption | null> = {
  current: null,
}

export function getInputAutofillOption(): IUseInputAutofillOption | null {
  return inputAutofillOptionRef.current
}

export function setInputAutofillOption(option: IUseInputAutofillOption) {
  inputAutofillOptionRef.current = option
}

export default function useInputAutofill() {
  return (onInputConfirm: Func2<string, any, void>, option: IUseInputAutofillOption) => {
    inputAutofillOptionRef.current = option
    eventCenter.once(
      InputAutofillEventName,
      (inputText, obj) => void onInputConfirm(inputText, obj)
    )
    navigateTo({ url: '/weapp/resume/input-autofill/index' })
  }
}
