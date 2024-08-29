import { View, ScrollView } from '@tarojs/components'
import {
  eventCenter,
  hideLoading,
  navigateBack,
  pxTransform,
  showLoading,
  useRouter,
  setNavigationBarTitle,
} from '@tarojs/taro'
import c from 'classnames'
import React, { useCallback, useEffect, useState } from 'react'

import {
  fetchAIforecastJdApi,
  fetchFunctionTypeKeywordApi,
  fetchAddKeywordsApi,
} from '@/apis/resume'
import Button from '@/components/Button'
import { IPair } from '@/def/common'
import { ICurrentKeyword, IKeyword } from '@/def/resume'
import useToast from '@/hooks/custom/useToast'
import MainLayout from '@/layout/MainLayout'

import FixedButtonBar from '../components/FixedButton/FixedButtonBar'
import { EFormEvent, getFormLinkStorageRef } from '../components/Link'
import CustomKeywordButton from './components/CustomKeywordButton'
import KeywordCategoryBlock from './components/KeywordCategoryBlock'
import SelectedList from './components/SelectedList'

import './index.scss'

const EditKeywords: React.FC = () => {
  const showToast = useToast()
  const { params } = useRouter()
  const limit = Number(params.limit) || 5,
    isMulitMode = params.mulitMode || true,
    isRequired = params.required,
    profile_job_id: number = params.profile_job_id ? +params.profile_job_id : 0,
    function_type: string = params.function_type || '', //职位类别
    defaultSelections: IPair[] = params.keywords
      ? JSON.parse(decodeURIComponent(params.keywords))
      : [], //关键词
    isShowAI = JSON.parse(params.isShowAI || 'false')
  const [selections, setSelections] = useState<ICurrentKeyword[]>([])
  const [AIKeyswods, setAIKeywords] = useState<IPair<number>[]>([])
  const [keywordCategories, setKeywordCategories] = useState<IKeyword[]>()
  const [customKeywords, setCustomKeywords] = useState<ICurrentKeyword[]>([])

  const isEnableConfirm = isMulitMode && isRequired ? selections.length > 0 : true

  //获取AI推荐关键词
  useEffect(() => {
    const title = getFormLinkStorageRef()?.title || '职位关键词'
    setNavigationBarTitle({ title })

    if (!profile_job_id || !isShowAI) {
      setAIKeywords([])
      return
    }
    fetchAIforecastJdApi(profile_job_id, 'keyword').then(aiList =>
      setAIKeywords(aiList as IPair<number>[])
    )
  }, [profile_job_id, isShowAI])

  //初始化关键词类型
  useEffect(() => {
    if (!function_type) {
      return
    }
    showLoading({ title: '加载中...' })
    fetchFunctionTypeKeywordApi(function_type)
      .then(functionTypeTree => {
        setKeywordCategories(functionTypeTree?.common)
        setCustomKeywords(functionTypeTree?.custom) //此版本该字段无作用
        // 处理默认已选中元素的情况
        if (isMulitMode && defaultSelections) {
          const mapSelections = defaultSelections
            .filter(item => item.id)
            .map(item => ({ keyword_id: item.id, keyword_name: item.name }))
          setSelections(mapSelections as ICurrentKeyword[])
        }
        hideLoading()
      })
      .catch(hideLoading)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [function_type])
  //判断是不是选中了
  const isKeywordSelected = useCallback(
    (keyword: ICurrentKeyword) => selections.map(t => t.keyword_id).includes(keyword.keyword_id),
    [selections]
  )
  //取消选中
  const deleteSelected = (singleKeyword: ICurrentKeyword) => {
    setSelections(selections.filter(t => t.keyword_id !== singleKeyword.keyword_id))
  }
  //选中
  const addSelected = useCallback(
    (singleKeyword: ICurrentKeyword) => {
      console.log(singleKeyword)

      setSelections([...selections, singleKeyword])
    },
    [selections]
  )
  //选择关键词
  const handleKeywordClick = (singleKeyword: ICurrentKeyword) => {
    //TODO:预留，单选直接赋值回退
    if (!isMulitMode) {
      // eventCenter.trigger(SelectKeywordEventName, singleKeyword)
      // navigateBack()

      return
    }
    if (isKeywordSelected(singleKeyword)) {
      deleteSelected(singleKeyword)
    } else {
      if (selections.length >= limit) {
        showToast({ content: `最多支持选择 ${limit} 个` })

        return
      }
      addSelected(singleKeyword)
    }
  }

  //确认
  const saveClickHandler = () => {
    if (isEnableConfirm) {
      eventCenter.trigger(
        EFormEvent.JOB_KEYWORD,
        selections.map(item => ({ id: item.keyword_id, name: item.keyword_name }))
      )
      navigateBack()
    }
  }

  return (
    <MainLayout className="edit-keyword">
      <View className="edit-keyword__title">
        请选择{getFormLinkStorageRef()?.title || '职位关键词'}
      </View>
      <View className="edit-keyword__tips">选中你的求职喜好，我们将为您更精准地推荐</View>
      {[...selections, ...customKeywords].length ? (
        <SelectedList
          list={[...selections, ...customKeywords].reverse()}
          onDelete={deleteSelected}
        />
      ) : null}
      <ScrollView
        className={c('edit-keyword__group', { 'edit-keyword__group--multi': isMulitMode })}
        scrollY
        style={
          [...selections, ...customKeywords].length
            ? { top: pxTransform(170 + 58) }
            : { top: pxTransform(70 + 58) }
        }
      >
        {AIKeyswods.length ? (
          <KeywordCategoryBlock
            {...{
              id: 0,
              name: 'AI推荐您的职位关键词可能是：',
              keyword: AIKeyswods.map(item => ({ keyword_id: item.id, keyword_name: item.name })),
              handleKeywordClick,
              isKeywordSelected,
            }}
          />
        ) : null}
        {(keywordCategories || []).map(item => (
          <KeywordCategoryBlock
            {...{ ...item, handleKeywordClick, isKeywordSelected }}
            key={item.id}
          />
        ))}
        <CustomKeywordButton
          function_type={function_type}
          profile_job_id={profile_job_id}
          limit={limit}
          disabled={selections.length >= limit}
          fetchAddKeywordApi={fetchAddKeywordsApi}
          callBack={singleKeyword => addSelected(singleKeyword)}
          checkSensitive={getFormLinkStorageRef()?.checkSensitive}
        />
      </ScrollView>
      <FixedButtonBar>
        <Button onClick={saveClickHandler}>确认</Button>
      </FixedButtonBar>
    </MainLayout>
  )
}

export default EditKeywords
