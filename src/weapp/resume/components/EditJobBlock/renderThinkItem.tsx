import { eventCenter, navigateBack } from '@tarojs/taro'
import { View } from '@tarojs/components'

import { TThinkJobCategory } from '@/def/common'
import { textHighLight } from '@/services/StringService'
import { InputAutofillEventName } from '../InputWithAutofill/useInputAutofill'

import './renderThinkItem.scss'

const prefixCls = 'resume__position-input'

const renderItem = (item: TThinkJobCategory, keyword: string) => {
  return (
    <View
      className={`${prefixCls}__item`}
      key={item.value}
      onClick={() => {
        eventCenter.trigger(InputAutofillEventName, item.fillName, item)
        navigateBack()
      }}
    >
      <View
        className={`${prefixCls}__item__title`}
        dangerouslySetInnerHTML={{
          __html: textHighLight(item.topLabel || '', keyword),
        }}
      />
      <View className={`${prefixCls}__item__sub`}>{item.parent_labels}</View>
    </View>
  )
}

export default renderItem
