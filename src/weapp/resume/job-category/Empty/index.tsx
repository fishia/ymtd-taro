import Button from '@/components/Button'
import { View } from '@tarojs/components'
import { FC } from 'react'
import cls from 'classnames'
import './index.scss'
import useToast from '@/hooks/custom/useToast'
import { fetchFeedbackFunctionTypeApi } from '@/apis/resume'

export type TEmpty = {
  value: string
  onCallback(): void
}

const prefixCls = 'resume__job-category--empty'
export default function Empty(props: TEmpty): ReturnType<FC<TEmpty>> {
  const { value, onCallback } = props
  const showToast = useToast()
  const clickHandler = () => {
    if (value.trim()) {
      fetchFeedbackFunctionTypeApi(value)
      showToast({ content: '您已完成反馈，我们会尽快完善' })
      onCallback()
    }
  }
  return (
    <View className={prefixCls}>
      <View className={cls(`${prefixCls}__line`, `${prefixCls}--black`)}>
        暂未搜索到相关的职位类别
      </View>
      <View className={cls(`${prefixCls}__line`, `${prefixCls}--grey`)}>
        欢迎您反馈想要的职位类别，我们会尽快完善
      </View>
      <Button
        className={cls(`${prefixCls}__line`, `${prefixCls}__btn`)}
        btnType="primary"
        onClick={clickHandler}
      >
        立即反馈
      </Button>
    </View>
  )
}
