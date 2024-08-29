import { navigateTo } from '@tarojs/taro'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import { fetchCollegesApi, fetchMajorsApi } from '@/apis/job-categories'
import { IEducationExp } from '@/def/resume'
import { useCurrentResume } from '@/hooks/custom/useResume'
import { senceData } from '@/hooks/message/maiSocket'
import { useResumeOptions } from '@/services/ResumeService'
import { sendDataRangersEvent } from '@/utils/dataRangers'

import Form, { FormItem, IFormRef } from '../Form'
import InputAutofill from '../InputWithAutofill'
import Picker from '../Picker'
import Textarea from '../Textarea'
import YearRangePicker from '../YearRangePicker'

import '../Form/style/normalized.scss'

export interface IStepForm {
  data: IEducationExp
  isStudent: boolean
  formRef: React.RefObject<IFormRef<IEducationExp>>
}

// const campusExperiencePlaceholder = '我在学校参加过XXX等活动，取得了XXX结果\n具体内容为：\n'

const campusExperiencePlaceholder = '请输入校园经历'

export default function EditEduBlock(props: IStepForm) {
  const { data, formRef, isStudent } = props
  const resumeOptions = useResumeOptions()
  const currentResume = useCurrentResume()

  const [education, setEducation] = useState(data.education)

  useEffect(() => {
    setEducation(data.education)
  }, [data])

  // 中专及以上
  const isEducationOverT2School = education && Number(education) >= 3
  // 大专及以上
  const isEducationOverT3School = education && Number(education) >= 4

  // 是本科
  const isEducationUndergraduate = education && Number(education) === 5
  const subYears = isEducationUndergraduate ? 4 : 3

  const defaultStartYear = currentResume?.workBeginTime
    ? dayjs(currentResume.workBeginTime).year() - subYears
    : undefined
  const defaultEndYear = currentResume?.workBeginTime
    ? dayjs(currentResume.workBeginTime).year()
    : undefined

  const startYear = currentResume?.birthDate
    ? dayjs(currentResume.birthDate).year()
    : dayjs().year() - 27
  const endYear = dayjs().year() + 5

  const yearRangeVlidate = val => {
    if (!val?.[0]) {
      return new Error('请选择入学时间')
    } else if (!val?.[1]) {
      return new Error('请选择毕业时间')
    } else {
      if (val[1].startsWith('0000')) {
        return null
      }

      return dayjs(val[1]).valueOf() >= dayjs(val[0]).valueOf()
        ? null
        : new Error('毕业时间不能早于开学时间')
    }
  }

  const workDescClick = e => {
    sendDataRangersEvent('Button_click', {
      button_name: 'M.AI帮写',
      page_name: '校园经历',
    })
    const paramsData = formRef.current?.data
    const params = {
      sence: senceData.EDUCATION,
      education: {
        school: paramsData?.school,
        major: paramsData?.major,
        schoolExperience: paramsData?.schoolExperience,
      },
    }
    navigateTo({
      url: `/weapp/MAI/chat/index?params=${encodeURIComponent(JSON.stringify(params))}`,
    })
  }

  return (
    <Form data={data} ref={formRef}>
      <FormItem field="education">
        <Picker
          title="最高学历"
          placeholder="请选择最高学历"
          range={resumeOptions.education}
          onChange={val => void setEducation(String(val))}
          defaultSelectValue="5"
          required
        />
      </FormItem>

      {isEducationOverT3School ? (
        <>
          <FormItem field="school">
            <InputAutofill
              title="学校名称"
              placeholder="请输入学校名称"
              fetcher={fetchCollegesApi}
              tips="学校"
              maxLength={20}
              minLength={2}
              required
              checkSensitive
            />
          </FormItem>

          <FormItem field="major">
            <InputAutofill
              title="专业名称"
              placeholder="请输入专业名称"
              fetcher={fetchMajorsApi}
              tips="专业"
              maxLength={20}
              minLength={2}
              required
              checkSensitive
            />
          </FormItem>
        </>
      ) : null}

      {education ? (
        <FormItem field="duringDate" validation={yearRangeVlidate}>
          <YearRangePicker
            title="在校时间"
            startPlaceholder="入学时间"
            endPlaceholder="毕业时间"
            defaultStartYear={defaultStartYear}
            defaultEndYear={defaultEndYear}
            startYear={startYear}
            endYear={endYear}
          />
        </FormItem>
      ) : null}
      {isStudent && isEducationOverT3School ? (
        <FormItem field="schoolExperience">
          <Textarea
            title="校园经历"
            desc="我在学校参加过的活动，取得了什么结果"
            placeholder="请填写校园经历"
            inputPlaceholder={campusExperiencePlaceholder}
            pageTitle="请输入校园经历"
            minLength={5}
            alertBeforeUnload
            required
            checkSensitive
            showMAIbtn
            MAIClick={workDescClick}
          />
        </FormItem>
      ) : null}
    </Form>
  )
}
