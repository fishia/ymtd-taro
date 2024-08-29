import { View, Text } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import dayjs from 'dayjs'
import { noop } from 'lodash'
import { useEffect, useMemo, useState } from 'react'

import { fetchCompanyNameApi, fetchPositionThinkApi } from '@/apis/job-categories'
import { fetchAIforecastJdApi } from '@/apis/resume'
import { IPair } from '@/def/common'
import { IFunctionType, IJobExp, JobExpSecretEnum } from '@/def/resume'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import { senceData } from '@/hooks/message/maiSocket'
import { sendDataRangersEvent } from '@/utils/dataRangers'
import { jsonToUrl } from '@/utils/utils'

import DateRangePicker from '../DateRangePicker'
import Form, { FormItem, IFormRef } from '../Form'
import InputAutofill from '../InputWithAutofill'
import Link, { EFormEvent } from '../Link'
import Switch from '../Switch'
import Textarea from '../Textarea'
import renderItem from './renderThinkItem'

import '../Form/style/normalized.scss'
import './index.scss'

export interface IStepForm {
  data: IJobExp
  formRef: React.RefObject<IFormRef<IJobExp>>
  isCreate?: boolean
  onFieldChange?(field: keyof IJobExp, value: any): void
}

const currentDay = dayjs().format('YYYY-MM-DD')
const defaultWorkEndDate = dayjs().subtract(1, 'year').format('YYYY-MM-DD')

// const workDescPlaceholder =
//   '我主要负责XXX等工作，取得了XXX结果\n具体工作为：\n1.负责XXX\n2.参与XXX\n3.完成XXX'

const workDescPlaceholder = '请输入工作内容'

export default function EditJobBlock(props: IStepForm) {
  const { data, formRef, onFieldChange = noop } = props
  const routerParam = useRouterParam()
  const jobExpId = Number(routerParam.id) || 0

  const [category, setCategory] = useState(() => data.functionTypeName)
  const [keywords, setKeywords] = useState(() => data.keywords || [])

  const [aiCategory, setAICategory] = useState<IFunctionType>()
  const [aiKeyword, setAIKeyword] = useState<IPair<string>[]>([])

  useEffect(() => {
    if (jobExpId) {
      fetchAIforecastJdApi(jobExpId, 'function_type').then((res: IFunctionType) => {
        setAICategory(res)
      })
    }
  }, [jobExpId])

  useEffect(() => {
    setCategory(data.functionTypeName)
    setKeywords(data.keywords)
  }, [data])

  const categoryClick = () => {
    const function_type = formRef.current?.data.functionType || ''
    const ai = encodeURIComponent(JSON.stringify(aiCategory?.function_type_all || []))

    navigateTo({
      url: `/weapp/resume/job-category/index?jobExpId=${jobExpId}&function_type=${function_type}&ai=${ai}`,
    })
  }

  const categoryCallback = (callback: IPair<string>) => {
    setCategory(callback.name)
    setKeywords([])
    formRef.current?.setField('functionTypeName', callback.name)

    formRef.current?.setField('keywords', [])
    const isFetchKey =
      aiCategory?.function_type_all.map(v => v.value).includes(callback.id) || false

    if (isFetchKey) {
      fetchAIforecastJdApi(jobExpId, 'keyword').then((res: IPair<string>[]) => {
        setAIKeyword(res)
      })
    }
    return callback.id
  }

  const aiCategoryClick = e => {
    e.stopPropagation()
    formRef.current?.setField('functionType', aiCategory?.function_type_top.value)
    formRef.current?.setField('functionTypeName', aiCategory?.function_type_top.label)
    setCategory(aiCategory?.function_type_top.label || '')

    setKeywords([])
    formRef.current?.setField('keywords', [])

    fetchAIforecastJdApi(jobExpId, 'keyword').then((res: IPair<string>[]) => {
      setAIKeyword(res)
    })
  }

  const keywordClick = () => {
    const functionType = formRef.current?.data.functionType || ''
    navigateTo({
      url: `/weapp/resume/edit-keywords/index?profile_job_id=${jobExpId}&function_type=${functionType}&isShowAI=${showAiKeyWord}&keywords=${encodeURIComponent(
        JSON.stringify(keywords)
      )}`,
    })
  }

  const keywordCallback = (callback: IPair<number>[]) => {
    formRef.current?.setField('keywords', callback)
    setKeywords(callback)

    return callback
  }

  const aiKeywordClick = e => {
    e.stopPropagation()

    formRef.current?.setField('keywords', aiKeyword.slice(0, 1))
    setKeywords(aiKeyword.slice(0, 1))
  }

  const showAiKeyWord = useMemo(() => {
    return (
      category &&
      aiKeyword.length > 0 &&
      keywords.length === 0 &&
      aiCategory?.function_type_top?.label === category
    )
  }, [aiKeyword, keywords, category, aiCategory])

  const dateRangeVlidate = val => {
    if (!val?.[0]) {
      return new Error('请选择入职时间')
    } else if (!val?.[1]) {
      return new Error('请选择离职时间')
    } else {
      if (val[1].startsWith('0000')) {
        return null
      }

      return dayjs(val[1]).valueOf() >= dayjs(val[0]).valueOf()
        ? null
        : new Error('毕业时间不能早于开学时间')
    }
  }

 //const keywordsVlidate = kw => (!kw || kw.length <= 0 ? new Error('请选择职位关键词') : null)

  const workDescClick = e => {
    sendDataRangersEvent('Button_click', {
      button_name: 'M.AI帮写',
      page_name: '工作经历',
    })
    const paramsData = formRef.current?.data
    console.log(paramsData)
    const params = {
      sence: senceData.WORK,
      work: {
        company: paramsData?.company,
        jobName: paramsData?.position,
        functionType: paramsData?.functionTypeName || '',
        workDesc: paramsData?.workDesc,
      },
    }
    console.log(params)
    navigateTo({
      url: `/weapp/MAI/chat/index?params=${encodeURIComponent(JSON.stringify(params))}`,
    })
  }

  return (
    <View className="edit-job-block">
      <Form data={data} ref={formRef}>
        <FormItem field="company">
          <InputAutofill
            title="公司名称"
            placeholder="请填写公司名称"
            tips="公司"
            fetcher={fetchCompanyNameApi}
            maxLength={30}
            minLength={2}
            required
            checkSensitive
          />
        </FormItem>

        <FormItem field="duringDate" validation={dateRangeVlidate}>
          <DateRangePicker
            title="在职时间"
            end={currentDay}
            placeholderStart="入职时间"
            placeholderEnd="离职时间"
            startDefaultSelect={defaultWorkEndDate}
            endDefaultSelect="0000-00-00"
            required
          />
        </FormItem>

        <FormItem field="position">
          <InputAutofill
            title="职位名称"
            placeholder="请填写职位名称"
            tips="职位"
            fetcher={fetchPositionThinkApi}
            maxLength={20}
            minLength={2}
            renderThinkItem={renderItem}
            handleValue={(text, selectPosition) => {
              if (selectPosition) {
                formRef.current?.setField('functionType', selectPosition.value)
                formRef.current?.setField('functionTypeName', selectPosition.label)
                setCategory(selectPosition.label)
              }

              return text
            }}
            required
            checkSensitive
          />
        </FormItem>

        <FormItem field="functionType">
          <Link
            text={category}
            onClick={categoryClick}
            onCallback={categoryCallback}
            event={EFormEvent.JOB_CATEGORY}
            title="职位类别"
            placeholder="请选择职位类别"
            className="edit-job-block__link"
            checkSensitive
            required
          >
            {!category && aiCategory?.function_type_top.label && (
              <View className="edit-job-block__link-bubble" onClick={aiCategoryClick}>
                <Text style={{ fontWeight: 400 }}>AI推荐：</Text>
                <Text>{aiCategory.function_type_top.label}</Text>
              </View>
            )}
          </Link>
        </FormItem>

        {category && (
          <FormItem field="keywords">
            <Link
              event={EFormEvent.JOB_KEYWORD}
              text={keywords && keywords.map(v => v.name).join('、')}
              onClick={keywordClick}
              onCallback={keywordCallback}
              title="职位关键词"
              placeholder="请选择职位关键词"
              className="edit-job-block__link"
              checkSensitive
            >
              {showAiKeyWord && (
                <View className="edit-job-block__link-bubble" onClick={aiKeywordClick}>
                  <Text style={{ fontWeight: 400 }}>AI推荐：</Text>
                  <Text>{aiKeyword[0].name}</Text>
                </View>
              )}
            </Link>
          </FormItem>
        )}

        <FormItem field="workDesc">
          <Textarea
            title="工作内容"
            placeholder="请输入工作内容"
            desc="清晰简洁的描述更受招聘者青睐"
            inputPlaceholder={workDescPlaceholder}
            pageTitle="请输入工作内容"
            minLength={5}
            alertBeforeUnload
            required
            checkSensitive
            showMAIbtn
            MAIClick={workDescClick}
          />
        </FormItem>

        <FormItem field="isShieldCompany">
          <Switch
            title="对这家公司隐藏我的简历"
            trueValue={JobExpSecretEnum.HIDE}
            falseValue={JobExpSecretEnum.VISIBLE}
            onChange={t => void onFieldChange('isShieldCompany', t)}
          />
        </FormItem>
      </Form>
    </View>
  )
}
