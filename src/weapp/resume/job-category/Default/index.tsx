import { View } from '@tarojs/components'
import { FC, useEffect, useState } from 'react'
import cls from 'classnames'
import SecondaryMenu from '@/components/SecondaryMenu'
import { eventCenter, showLoading, hideLoading, navigateBack } from '@tarojs/taro'
import { EFormEvent } from '../../components/Link'
import { IJobCategory, IProps } from '@/def/common'
import './index.scss'
import { fetchJobCategoriesApi } from '@/apis/job-categories'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import { ISelectItem } from '@/def/resume'

export interface IDefault extends IProps { }

const prefixCls = 'resume__job-category--default'

export default function Default(props: IDefault): ReturnType<FC<IDefault>> {
  const { className } = props
  const routerParam = useRouterParam()
  const function_type = routerParam.function_type || ''
  const ai = JSON.parse(decodeURIComponent(routerParam.ai || '[]')) as ISelectItem[]
  const [jobCategories, setJobCategories] = useState<IJobCategory[]>([])

  useEffect(() => {
    showLoading({ title: '加载中...' })
    fetchJobCategoriesApi()
      .then(jobs => {
        setJobCategories(jobs)
        hideLoading()
      })
      .catch(hideLoading)
  }, [])

  const chooseHandler = (v: IJobCategory) => {
    navigateBack().then(() =>
      eventCenter.trigger(EFormEvent.JOB_CATEGORY, { id: v.value, name: v.label })
    )
  }

  const aiClick = (v: ISelectItem) => {
    navigateBack().then(() =>
      eventCenter.trigger(EFormEvent.JOB_CATEGORY, { id: v.value, name: v.label })
    )
  }
  return (
    <View className={cls(prefixCls, className)}>
      {Array.isArray(ai) && ai.length > 0 && (
        <View className={`${prefixCls}__ai`}>
          <View className={`${prefixCls}__title`}>AI推荐您的职位类别可能是：</View>
          {ai.map(v => (
            <View
              className={cls(`${prefixCls}__tag`, {
                [`${prefixCls}__tag--selected`]: v.value === function_type,
              })}
              key={v.value}
              onClick={() => aiClick(v)}
            >
              {v.label}
            </View>
          ))}
        </View>
      )}

      <SecondaryMenu
        className={`${prefixCls}__menu`}
        data={jobCategories}
        onChoose={chooseHandler}
        selected={[function_type]}
      />
    </View>
  )
}
