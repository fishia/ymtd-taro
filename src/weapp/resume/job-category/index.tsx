import React, { useMemo, useRef, useState } from 'react'
import { View } from '@tarojs/components'
import { IInputCurrent, PageStatus, TThinkJobCategory } from '@/def/common'
import SearchBar from '@/components/SearchBar'
import { fetchThinkJobCategoriesApi } from '@/apis/job-categories'
import { eventCenter } from '@tarojs/runtime'
import { navigateBack } from '@tarojs/taro'
import { EFormEvent } from '../components/Link'
import './index.scss'
import Empty from './Empty'
import MainLayout from '@/layout/MainLayout'
import Default from './Default'
import { textHighLight } from '@/services/StringService'

const prefixCls = 'resume__job-category'

const JobCategory: React.FC = () => {
  const inputRef = useRef<IInputCurrent>(null)

  const [pageStatus, setPageStatus] = useState<PageStatus>(() => PageStatus.INIT)

  //确认选择的值
  const fetchConfirm = (name: string, id: string) => {
    eventCenter.trigger(EFormEvent.JOB_CATEGORY, { id, name })
    navigateBack()
  }

  const fetchSearch = (keyword: string) => {
    return fetchThinkJobCategoriesApi(keyword).then(data => {
      setPageStatus(PageStatus.OTHERS)
      return data
    })
  }

  const callBack = () => {
    setPageStatus(PageStatus.INIT)
    inputRef.current?.setValue('')
  }

  const Content = useMemo(() => {
    switch (pageStatus) {
      case PageStatus.INIT:
        return <Default />
      case PageStatus.EMPTY:
        return <Empty value={inputRef.current?.value || ''} onCallback={callBack} />
      default:
        return null
    }
  }, [pageStatus])

  const renderItem = (item: TThinkJobCategory, keyword: string) => {
    return (
      <View
        className={`${prefixCls}__item`}
        key={item.value}
        onClick={() => {
          fetchConfirm(item.label, item.value)
        }}
      >
        <View
          className={`${prefixCls}__item__title`}
          dangerouslySetInnerHTML={{
            __html: textHighLight(item.label + (item.hit ? `  (${item.hit})` : ''), keyword),
          }}
        />
        <View className={`${prefixCls}__item__sub`}>{item.parent_labels}</View>
      </View>
    )
  }

  return (
    <MainLayout className={prefixCls}>
      <View className={`${prefixCls}__fixed`}>
        <SearchBar
          className={`${prefixCls}__seachbar`}
          ref={inputRef}
          onSearch={fetchSearch}
          border={false}
          placeholder="搜索职位类别"
          renderThinkItem={renderItem}
          renderNoListTips={() => setPageStatus(PageStatus.EMPTY)}
          onClear={() => setPageStatus(PageStatus.INIT)}
          defaultFocus={false}
          noConfirm
        />
      </View>
      <View className={`${prefixCls}__content`}>{Content}</View>
    </MainLayout>
  )
}

export default JobCategory
