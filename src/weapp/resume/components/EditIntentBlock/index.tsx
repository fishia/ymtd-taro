import { navigateTo } from '@tarojs/taro'
import { useEffect, useState } from 'react'

import { IPair } from '@/def/common'
import { IntentWorkTypeEnum, IResumeIntentInfo } from '@/def/resume'
import { useResumeOptions } from '@/hooks/custom/useResume'
import { useCurrentUserInfo } from '@/hooks/custom/useUser'

import Form, { FormItem, IFormRef } from '../Form'
import Link, { EFormEvent } from '../Link'
import LocationPicker from '../LocationPicker'
import Picker from '../Picker'
import SalaryRangePicker from '../SalaryRangePicker'
import Toggle from '../Toggle'

export interface IStepForm {
  data: IResumeIntentInfo
  formRef: React.RefObject<IFormRef<IResumeIntentInfo>>
}

export const workTypeRange = [
  { id: IntentWorkTypeEnum.FULL_TIME, value: IntentWorkTypeEnum.FULL_TIME, label: '全职' },
  { id: IntentWorkTypeEnum.PART_TIME, value: IntentWorkTypeEnum.PART_TIME, label: '兼职' },
]

export default function EditIntentBlock(props: IStepForm) {
  const { data, formRef } = props
  const resumeOptions = useResumeOptions()
  const userInfo = useCurrentUserInfo()

  const [exceptPositionName, setExceptPositionName] = useState(() => data.expectPositionName)
  const [keywords, setKeywords] = useState(() => data.keywords || [])

  useEffect(() => {
    setExceptPositionName(data.expectPositionName)
    setKeywords(data.keywords)
  }, [data.expectPositionName, data.keywords])

  const categoryClick = () => {
    const functionType = formRef.current?.data.expectPosition || 0

    navigateTo({
      url: `/weapp/resume/job-category/index?function_type=${functionType}`,
    })
  }

  const categoryCallback = (callback: IPair<string>) => {
    setExceptPositionName(callback.name)
    formRef.current?.setField('expectPositionName', callback.name)

    setKeywords([])
    formRef.current?.setField('keywords', [])

    return callback.id
  }

  const keywordClick = () => {
    const expectPosition = formRef.current?.data.expectPosition || 0
    navigateTo({
      url: `/weapp/resume/edit-keywords/index?function_type=${expectPosition}&keywords=${encodeURIComponent(
        JSON.stringify(keywords)
      )}`,
    })
  }

  const keywordCallback = (callback: IPair<number>[]) => {
    formRef.current?.setField('keywords', callback)
    setKeywords(callback)

    return callback
  }

  return (
    <Form data={data} ref={formRef}>
      <FormItem field="workType">
        <Toggle title="求职类型" range={workTypeRange} />
      </FormItem>

      <FormItem field="expectPosition">
        <Link
          text={exceptPositionName}
          onClick={categoryClick}
          onCallback={categoryCallback}
          event={EFormEvent.JOB_CATEGORY}
          title="期望职位"
          placeholder="请选择期望职位"
          required
          checkSensitive
        />
      </FormItem>

      <FormItem field="cityId">
        <LocationPicker
          title="工作城市"
          placeholder="请选择工作城市"
          name={data.cityName}
          onChangeLocation={city => void formRef.current?.setField('cityName', city.name)}
          required
        />
      </FormItem>

      <FormItem field="expectSalary">
        <SalaryRangePicker
          title="薪资要求"
          placeholder="请选择薪资要求"
          defaultSelect={[10, 15]}
          required
        />
      </FormItem>

      {exceptPositionName && (
        <FormItem field="keywords">
          <Link
            event={EFormEvent.JOB_KEYWORD}
            text={keywords && keywords.map(v => v.name).join('、')}
            onClick={keywordClick}
            onCallback={keywordCallback}
            title="职位偏好"
            placeholder="请选择职位偏好"
            checkSensitive
          />
        </FormItem>
      )}

      {userInfo?.status ? null : (
        <FormItem field="userStatus">
          <Picker
            title="求职状态"
            placeholder="请选择求职状态"
            range={resumeOptions.mpc_status}
            defaultSelectValue={4}
            required
          />
        </FormItem>
      )}
    </Form>
  )
}
