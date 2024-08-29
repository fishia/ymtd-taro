import { navigateTo, eventCenter } from '@tarojs/taro'

export interface IUseInputLongtextOption {
  pageTitle?: string
  pageNavTitle?: string
  defaultText?: string
  desc?: string
  maxLength?: number
  minLength?: number
  inputPlaceholder?: string
  alertBeforeUnload?: boolean
  alertBeforeUnloadText?: string
  checkSensitive?: boolean
  type?: 'input' | 'textarea'
  route?: string
  rule?: string
  showCount?: boolean
  showClear?: boolean
  showMAIbtn?: boolean
  MAIClick?: (e) => void
}

export const InputTextEventName = 'inputText'
export const InputLongtextEventName = 'inputLongtext'

const inputLongtextOptionRef: Record<'current', IUseInputLongtextOption | null> = {
  current: null,
}

export function getInputLongtextOption(): IUseInputLongtextOption | null {
  return inputLongtextOptionRef.current
}

export function setInputLongtextOption(option: IUseInputLongtextOption) {
  inputLongtextOptionRef.current = option
}

function useInputLongtext() {
  return (onInputConfirm: Func1<string, void>, option: IUseInputLongtextOption) => {
    inputLongtextOptionRef.current = option
    eventCenter.once(
      option.type === 'input' ? InputTextEventName : InputLongtextEventName,
      inputText => void onInputConfirm(inputText)
    )
    navigateTo({ url: option.route || '/weapp/resume/longtext-input/index' })
  }
}

export default useInputLongtext
