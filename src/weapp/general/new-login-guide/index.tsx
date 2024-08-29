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
import logoIcon from '@/assets/imgs/slogan.svg'
import Button from '@/components/Button'
import { loginPopupEventKey } from '@/components/Popup/loginPopup'
import { STATIC_MP_IMAGE_HOST } from '@/config'
import { IJobCategory, IPair } from '@/def/common'
import { createDefaultIntent, IResumeIntentInfo } from '@/def/resume'
import MainLayout from '@/layout/MainLayout'
import { setNewLoginIntent } from '@/services/AccountService'
import { sendDataRangersEvent, sendDataRangersEventWithUrl } from '@/utils/dataRangers'
import Form, { FormItem, useFormRef } from '@/weapp/resume/components/Form'
import Link, { EFormEvent } from '@/weapp/resume/components/Link'
import LocationPicker from '@/weapp/resume/components/LocationPicker'
import SalaryRangePicker from '@/weapp/resume/components/SalaryRangePicker'

import togglerIcon from './toggler-icon.svg'

import './index.scss'

const pageBg = STATIC_MP_IMAGE_HOST + 'new-login-guide-bg.png'
const pageHeadHeight = getMenuButtonBoundingClientRect().bottom
const pageHeadPaddingTop = getSystemInfoSync().statusBarHeight

type IRecommendItem = Pick<IJobCategory, 'label' | 'value'> & { displayName?: string }
const recommends: IRecommendItem[] = [
  { label: '临床医药销售', value: 'A01-B006-C0017-D0087', displayName: '医药代表' },
  { label: '临床器械销售', value: 'A01-B006-C0018-D0090' },
  { label: '病房护理', value: 'A02-B009-C0025-D0170', displayName: '护士' },
  { label: '临床监查', value: 'A01-B003-C0010-D0036' },
]

export default function NewLoginGuide() {
  const formRef = useFormRef<IResumeIntentInfo>()
  const [formData, setFormData] = useState(createDefaultIntent)
  const [expectPositionName, setExpectPositionName] = useState('')

  const [isActionFixed, setIsActionFixed] = useState(false)

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
    const isCorrect = await formRef.current?.validateAndToast()
    if (!isCorrect) {
      if (isActionFixed) {
        pageScrollTo({ scrollTop: Math.random() })
      }

      sendDataRangersEvent('View_Now_Button_Click', { is_success: '失败' })

      return
    }

    sendDataRangersEvent('View_Now_Button_Click', { is_success: '成功' })
    setNewLoginIntent({ ...formRef.current?.getData()!, expectSalary: [] })
    switchTab({ url: '/weapp/pages/job/index' }).then(() => {
      setTimeout(() => void eventCenter.trigger(loginPopupEventKey), 1000)
    })
  }

  const skipHandler = () => {
    sendDataRangersEvent('Close_Button_Click')
    switchTab({ url: '/weapp/pages/job/index' })
  }

  const goHrPageHandler = () => {
    sendDataRangersEventWithUrl('RecruiterClick')
    navigateTo({ url: '/weapp/landing/hr/index' })
  }

  const recommendHandler = (recommendItem: IRecommendItem) => {
    setExpectPositionName(recommendItem.label)
    formRef.current?.setField('expectPositionName', recommendItem.label)
    formRef.current?.setField('expectPosition', recommendItem.value)
    formRef.current?.setFieldError('expectPosition', false)
  }

  return (
    <MainLayout className="new-login-guide">
      <View
        className="new-login-guide__header"
        style={{ height: pageHeadHeight + 12 + 'px', paddingTop: pageHeadPaddingTop + 4 + 'px' }}
      >
        <Image className="new-login-guide__logo" src={logoIcon} />
      </View>

      <View className="new-login-guide__title">
        <View className="new-login-guide__title__text">
          <View className="new-login-guide__title__text-main">你想找什么工作？</View>
          <View className="new-login-guide__title__text-sub">
            添加以下信息，超多专属热招职位等你来
          </View>
        </View>
        <View onClick={goHrPageHandler} className="new-login-guide__title__toggler">
          我要招人
          <Image className="new-login-guide__title__toggler-icon" src={togglerIcon} />
        </View>
      </View>

      <View className="new-login-guide__form">
        <Form data={formData} ref={formRef}>
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
              placeholder="请选择期望职位"
              required
              checkSensitive
            />
          </FormItem>

          <View className="new-login-guide__recommend">
            为你推荐：
            {recommends.map(item => (
              <View
                key={item.value}
                onClick={() => void recommendHandler(item)}
                className={c(
                  'new-login-guide__recommend-item',
                  expectPositionName === item.label ? 'actived' : ''
                )}
              >
                {item.displayName || item.label}
              </View>
            ))}
          </View>

          <FormItem field="expectSalary">
            <SalaryRangePicker
              title="期望薪资"
              placeholder="请选择期望薪资"
              defaultSelect={[10, 15]}
              required
            />
          </FormItem>

          <FormItem field="cityId">
            <LocationPicker
              title="期望城市"
              placeholder="请选择期望城市"
              name={formData.cityName}
              onChangeLocation={city => void formRef.current?.setField('cityName', city.name)}
              required
            />
          </FormItem>
        </Form>
      </View>

      <View className="new-login-guide__action-wrapper">
        <View className={c('new-login-guide__action', isActionFixed ? 'fixed' : 'relative')}>
          <Button
            onClick={submitHandler}
            className="new-login-guide__action__submit"
            btnType="primary"
            round
          >
            提交并查看热岗
          </Button>

          <View style={{ textAlign: 'center' }}>
            <View onClick={skipHandler} className="new-login-guide__action__skip skip">
              还没想好，先看看
            </View>
          </View>
        </View>
      </View>

      <Image className="new-login-guide__bg" mode="widthFix" src={pageBg} />
    </MainLayout>
  )
}
