import { Image, View } from '@tarojs/components'
import {
  eventCenter,
  getMenuButtonBoundingClientRect,
  getSystemInfoSync,
  navigateTo,
  pageScrollTo,
  showToast,
  switchTab,
  usePageScroll,
} from '@tarojs/taro'
import c from 'classnames'
import { useEffect, useState } from 'react'

import { fetchCityByIpApi } from '@/apis/user'
import Button from '@/components/Button'
import LoginButton from '@/components/LoginButton'
import { loginPopupEventKey } from '@/components/Popup/loginPopup'
import { IPair } from '@/def/common'
import { createDefaultIntent, IResumeIntentInfo } from '@/def/resume'
import { useRefreshHomePage } from '@/hooks/custom/useJob'
import { useShowLoginPopup } from '@/hooks/custom/usePopup'
import MainLayout from '@/layout/MainLayout'
import { setNewLoginIntent } from '@/services/AccountService'
import { sendDataRangersEvent, sendDataRangersEventWithUrl } from '@/utils/dataRangers'
import { workTypeRange } from '@/weapp/resume/components/EditIntentBlock'
import Form, { FormItem, useFormRef } from '@/weapp/resume/components/Form'
import Link, { EFormEvent } from '@/weapp/resume/components/Link'
import LocationPicker from '@/weapp/resume/components/LocationPicker'
import SalaryRangePicker from '@/weapp/resume/components/SalaryRangePicker'
import Toggle from '@/weapp/resume/components/Toggle'

import './index.scss'

export default function MyRecommend() {
  const formRef = useFormRef<IResumeIntentInfo>()
  const [formData, setFormData] = useState(createDefaultIntent)
  const [expectPositionName, setExpectPositionName] = useState('')
  const showLoginPopup = useShowLoginPopup()
  const [isActionFixed, setIsActionFixed] = useState(false)
  const refreshHomepageJobList = useRefreshHomePage()

  usePageScroll(({ scrollTop }) => {
    setIsActionFixed(scrollTop > 550)
  })

  useEffect(() => {
    sendDataRangersEvent('Job_Intention_Page', { type: '新用户求职意向落地页' })

    fetchCityByIpApi()
      .then(cityInfo => {
        formRef.current?.setField('cityId', cityInfo.id)
        formRef.current?.setField('cityName', cityInfo.name)
        setFormData(data => ({ ...data, cityId: cityInfo.id, cityName: cityInfo.name }))
      })
      .catch(() => {
        showToast({ title: '获取当前所在地失败，请手动选择' })
      })
  }, [formRef])

  const submitHandler = async () => {
    sendDataRangersEvent('register_and_login_click', {
      event_name: '注册登录引导',
      type: '添加求职意向',
      page_name: '我的页面',
      button_name: '保存并登录',
    })

    const isCorrect = await formRef.current?.validateAndToast()
    if (!isCorrect) {
      if (isActionFixed) {
        pageScrollTo({ scrollTop: Math.random() })
      }
      return
    }
    setNewLoginIntent({ ...formRef.current?.getData()!, expectSalary: [] })
    refreshHomepageJobList()

    showLoginPopup()
    // switchTab({ url: '/weapp/pages/job/index' }).then(() => {
    //   setTimeout(() => void eventCenter.trigger(loginPopupEventKey), 1000)
    // })
  }

  return (
    <View className="my_recommend">
      <View className="my_recommend__header">
        <View className="my_recommend__header-title">添加求职意向</View>
        <View className="my_recommend__header-desc">求职意向越完善，推荐的岗位越精确</View>
      </View>
      <View className="my_recommend__form">
        <Form data={formData} ref={formRef}>
          <FormItem field="workType">
            <Toggle title="工作性质" range={workTypeRange} />
          </FormItem>
          <FormItem field="expectPosition">
            <Link
              text={expectPositionName}
              onClick={() => {
                const functionType = formRef.current?.data.expectPosition || ''
                navigateTo({
                  url: `/weapp/resume/job-category/index?function_type=${functionType}`,
                })
              }}
              onCallback={(result: IPair<string>) => {
                formRef.current?.setField('expectPositionName', result.name)
                setExpectPositionName(result.name)

                return result.id
              }}
              event={EFormEvent.JOB_CATEGORY}
              title="期望职位"
              placeholder="如：销售经理/研究员"
              required
              checkSensitive
            />
          </FormItem>
          <FormItem field="cityId">
            <LocationPicker
              title="工作城市"
              placeholder="如：北京"
              name={formData.cityName}
              onChangeLocation={city => void formRef.current?.setField('cityName', city.name)}
              required
            />
          </FormItem>
          <FormItem field="expectSalary">
            <SalaryRangePicker
              title="薪资要求"
              placeholder="如：1-2万"
              defaultSelect={[10, 15]}
              required
            />
          </FormItem>
        </Form>
      </View>
      <View className="my_recommend__action-wrapper">
        <View className={c('my_recommend__action', isActionFixed ? 'fixed' : 'relative')}>
          <Button onClick={submitHandler} className="my_recommend__action__submit">
            保存并登录
          </Button>
        </View>
      </View>
    </View>
  )
}
