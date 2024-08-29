import { View } from '@tarojs/components'
import dayjs from 'dayjs'
import { noop } from 'lodash'
import { useEffect, useMemo, useState } from 'react'

import { checkSensitiveWordsApi } from '@/apis/resume'
import { IResumeBasicInfo } from '@/def/resume'
import { SexType } from '@/def/user'
import useToast from '@/hooks/custom/useToast'
import {
  allDefaultAvatars,
  getRandomFemaleAvatar,
  getRandomMaleAvatar,
  useResumeOptions,
} from '@/services/ResumeService'

import AvatarUploader from '../Avatar'
import DatePicker from '../DatePicker'
import Form, { FormItem, IFormRef } from '../Form'
import Input from '../Input'
import LocationPicker from '../LocationPicker'
import Picker from '../Picker'
import Textarea from '../Textarea'
import Toggle from '../Toggle'

import '../Form/style/normalized.scss'

export interface IStepForm {
  data: IResumeBasicInfo
  formRef: React.RefObject<IFormRef<IResumeBasicInfo>>
  onFieldChange?(field: keyof IResumeBasicInfo, value: any): void
}

const now = new Date()
const birthDateStart = `${now.getFullYear() - 60}-${now.getMonth() + 1}-01`
const birthDateEnd = `${now.getFullYear() - 18}-${now.getMonth() + 1}-01`
const birthDateDefaultSelect = `${now.getFullYear() - 27}-06-01`

const workBeginStart = `${now.getFullYear() - 61}-${now.getMonth() + 1}-01`
const workBeginEnd = dayjs().format('YYYY-MM-01')

const calcWbtDefaultSelct = dateString =>
  dateString ? dayjs(dateString).add(22, 'years').format('YYYY-MM-01') : undefined

const calcWbtStart = dateString =>
  dateString ? dayjs(dateString).subtract(1, 'month').format('YYYY-MM-01') : workBeginStart

export default function EditBasicBlock(props: IStepForm) {
  const { data, formRef, onFieldChange = noop } = props
  const resumeOptions = useResumeOptions()
  const showToast = useToast()

  const [wbtDefaultSelect, setWbtDefaultSelect] = useState<string | undefined>(() =>
    calcWbtDefaultSelct(data.birthDate)
  )
  const [wbtStart, setWbtStart] = useState(() => calcWbtStart(data.birthDate))
  const [sex, setSex] = useState(data.sex)

  const birthDateChange = birthDate => {
    setWbtDefaultSelect(calcWbtDefaultSelct(birthDate))
    setWbtStart(calcWbtStart(birthDate))
  }

  const defaultMaleAvatar = useMemo(
    () => (String(data.sex) !== String(SexType.girl) ? data.avatar : getRandomMaleAvatar()),
    [data]
  )
  const defaultFemaleAvatar = useMemo(
    () => (String(data.sex) === String(SexType.girl) ? data.avatar : getRandomFemaleAvatar()),
    [data]
  )

  useEffect(() => {
    const currentSex = data.sex

    if (currentSex) {
      setSex(currentSex)
    }
  }, [data])

  useEffect(() => {
    const currentAvatar = formRef.current?.data.avatar

    if (!currentAvatar || allDefaultAvatars.includes(currentAvatar)) {
      const newAvatar =
        String(sex) === String(SexType.boy) ? defaultMaleAvatar : defaultFemaleAvatar
      formRef.current?.setField('avatar', newAvatar)
    }
  }, [defaultFemaleAvatar, defaultMaleAvatar, formRef, sex])

  const nameCheckSensitiveHandler = () => {
    const nameString = formRef.current?.data.name || ''
    if (nameString.length < 2) {
      formRef.current?.setFieldError('name', true, '姓名至少输入2个字')
      showToast({ content: '姓名至少输入2个字' })

      return
    }

    checkSensitiveWordsApi(nameString).then(pass => {
      if (!pass) {
        formRef.current?.setFieldError('name', true, '姓名内容包含敏感词，请修改')
        showToast({ content: '姓名内容包含敏感词，请修改' })
      }
    })
  }

  return (
    <Form data={data} ref={formRef}>
      <FormItem field="avatar">
        <AvatarUploader defaultSex={sex} />
      </FormItem>
      <FormItem field="name">
        <Input
          title="姓名"
          placeholder="请填写姓名"
          maxlength={20}
          minLength={2}
          onBlur={nameCheckSensitiveHandler}
          required
        />
      </FormItem>
      <FormItem field="sex">
        <Toggle title="性别" range={resumeOptions.sex} onChange={t => void setSex(t as any)} />
      </FormItem>
      <FormItem field="birthDate">
        <DatePicker
          title="出生年月"
          placeholder="请选择出生年月"
          start={birthDateStart}
          end={birthDateEnd}
          defaultSelect={birthDateDefaultSelect}
          onChange={birthDateChange}
          required
        />
      </FormItem>
      <FormItem field="workBeginTime">
        <DatePicker
          title="首次参加工作时间"
          placeholder="请选择首次参加工作时间"
          start={wbtStart}
          end={workBeginEnd}
          defaultSelect={wbtDefaultSelect}
          upToNowText="我是学生，暂无工作经历"
          onChange={t => void onFieldChange('workBeginTime', t)}
          upToNow
          required
        />
      </FormItem>
      <FormItem field="cityId">
        <LocationPicker
          name={data.cityName || ''}
          title="现居住城市"
          onChangeLocation={loc => void formRef.current?.setField('cityName', loc.name)}
          placeholder="请选择现居住城市"
          required
        />
      </FormItem>
      <View
        style={{
          fontSize: '28rpx',
          color: '#333333',
          lineHeight: '40rpx',
          margin: '48rpx 32rpx 15rpx',
        }}
      >
        以下为选填项
      </View>
      <FormItem field="wechat">
        <Textarea
          title="微信号"
          pageTitle="请填写微信号"
          placeholder="请填写微信号（选填）"
          inputPlaceholder="请填写微信号"
          type="input"
          route="/weapp/resume/inputText/index"
          rule="^[[\x00-\xff]{1,20}]*$"
          alertBeforeUnload
          showNew={!data.wechat}
        />
      </FormItem>
      <FormItem field="marryStatus">
        <Picker
          title="婚姻状况"
          placeholder="请选择婚姻状态（选填）"
          range={resumeOptions.marry_status}
        />
      </FormItem>
      <FormItem field="selfDescription">
        <Textarea
          title="自我评价"
          pageTitle="请填写自我评价"
          placeholder="请填写自我评价（选填）"
          inputPlaceholder="请填写自我评价"
          minLength={5}
          alertBeforeUnload
          checkSensitive
        />
      </FormItem>
    </Form>
  )
}
