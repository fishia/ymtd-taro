import { Input, View } from '@tarojs/components'
import Taro, {
  useRouter,
  getCurrentInstance,
  PageInstance,
  navigateTo,
  switchTab,
  setStorageSync,
  getStorageSync,
} from '@tarojs/taro'
import * as R from 'ramda'
import { useState, useEffect, useMemo, useRef, useCallback, createRef } from 'react'

import { fetchSendCaptcha, fetchSendCaptchaByCode, fetchUserLogin } from '@/apis/user'
import Button, { ButtonType } from '@/components/Button'
import HdInput from '@/components/CustomInput'
import ProtocolCheckBox from '@/components/ProtocolCheckBox'
import { APP_TOKEN_FLAG, APP_IS_OLD_USER } from '@/config'
import { IError } from '@/def/client'
import { ErrorCode } from '@/def/common'
import { useRefreshCurrentResume } from '@/hooks/custom/useResume'
import useToast from '@/hooks/custom/useToast'
import MainLayout from '@/layout/MainLayout'
import { initFetchAndSetUserInfo, isSchoolVersion } from '@/services/AccountService'
import { formatPhone, trimAll } from '@/services/StringService'
import { validatePhone } from '@/services/ValidateService'
import { getVarParam } from '@/utils/dataRangers'

import './index.scss'

const APP_SMS_LENGTH = 6
const APP_SMS_FREQUENCY = 60
let loginKey = ''
let countDown = 60

/**
 * 纯数字验证码校验
 * @param {待校验值} value
 * @param {长度} length
 * @returns boolean
 */
export function validateNumberCode(value: string | number, length: number) {
  // eslint-disable-next-line no-restricted-globals
  if (isFinite(+value) && String(value).length === length) {
    return true
  } else {
    return false
  }
}

const useInterval = (callback, delay: number | null) => {
  const saveCallback = useRef(() => {})
  useEffect(() => {
    saveCallback.current = callback
  })
  useEffect(() => {
    if (delay !== null) {
      const interval = setInterval(() => saveCallback.current(), delay)
      return () => {
        return clearInterval(interval)
      }
    }
    return undefined
  }, [delay])
}

const AliyunCaptchaPluginInterface = Taro.requirePlugin('AliyunCaptcha')

const LoginForm: React.FC<ICaptchaProps> = () => {
  const showToast = useToast()

  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState<boolean>(false)
  const [tipsVisible, setTipsVisible] = useState<boolean>(false)
  const [phone, setPhone] = useState<any>(undefined)
  const [opt, setOpt] = useState<any>(undefined)
  const [phoneError, setPhoneError] = useState(false)
  const [optError, setOptError] = useState(false)
  const [waitText, setWaitText] = useState('获取验证码')
  const [isWaiting, setIsWaiting] = useState(false)
  const [btnType, setBtnType] = useState<ButtonType>('disabled')
  const refreshResume = useRefreshCurrentResume()
  const sendPhone = useRef(null);
  const router = useRouter()

  useEffect(() => {
    if (validatePhone(phone) && validateNumberCode(opt, APP_SMS_LENGTH) && checked) {
      setBtnType('primary')
    } else {
      setBtnType('disabled')
    }
  }, [phone, opt, checked])

  // 按钮倒计时
  useInterval(
    () => {
      setWaitText(`重新发送 (${countDown--}s)`)
      if (countDown === -1) {
        setIsWaiting(false)
        setWaitText('获取验证码')
      }
    },
    isWaiting ? 1000 : null
  )

  const handleOpt = () => {
    if (isWaiting) {
      showToast({ content: '请勿频繁获取验证码' })
      return
    }
    if (validatePhone(phone)) {
      sendPhone.current = phone;
      onShowCaptcha()
      // setIsWaiting(true)
      // fetchSendCaptcha(trimAll(phone))
      //   .then((key: string) => {
      //     loginKey = key
      //     countDown = APP_SMS_FREQUENCY
      //   })
      //   .catch(errorMessage => {
      //     countDown = APP_SMS_FREQUENCY
      //     showToast({ content: errorMessage })
      //   })
    } else {
      setPhoneError(true)
      showToast({ content: '请填写正确的手机号码' })
    }
  }

  const handleLogin = () => {
    if (loading) {
      return
    }
    if (!validatePhone(phone)) {
      setPhoneError(true)
      showToast({ content: '请填写正确的手机号码' })
      return
    }
    if (!validateNumberCode(opt, APP_SMS_LENGTH)) {
      setOptError(true)
      showToast({ content: '请填写正确的验证码' })
      return
    }
    if (!checked) {
      showToast({ content: '请先同意协议' })
      return
    }

    setLoading(true)

    const ab_sdk_version = getVarParam('ab_sdk_version')
    const userLoginData = {
      phone: trimAll(phone),
      captcha: opt,
    }

    const isSchool = isSchoolVersion()
    if (ab_sdk_version) Object.assign(userLoginData, { mpVersion: isSchool ? '校园版' : '社招版' })

    const isOldUser = getStorageSync(APP_IS_OLD_USER)
    if (isOldUser) Object.assign(userLoginData, { oldUserLoseLoginStats: isOldUser ? 1 : 0 })

    const { type, pageName } = router.params
    if (type && type != 'undefined') Object.assign(userLoginData, { type: type })
    if (pageName && pageName != 'undefined') Object.assign(userLoginData, { pageName: pageName })

    fetchUserLogin(userLoginData)
      .then(async res => {
        try {
          setLoading(false)
          showToast({ content: '登录成功' })
          setStorageSync(APP_TOKEN_FLAG, res.jwtToken)
          await initFetchAndSetUserInfo(true)
          refreshResume()

          setTimeout(() => {
            switchTab({ url: '/weapp/pages/job/index' })
          }, 400)
        } catch {
          console.error('登录重定向传参错误')
        }
      })
      .catch((error: IError) => {
        setLoading(false)
        showToast({ content: error.message })
      })
  }

  const handlePhone = (value: string | number) => {
    const format = formatPhone(value)
    setPhone(format)
  }

  const checkHandler = (value: boolean) => {
    if (tipsVisible && value) {
      setTipsVisible(false)
    }
    setChecked(value)
  }

  const captchaVerifyCallback = async (captchaVerifyParam) => {
    const result = await fetchSendCaptchaByCode(captchaVerifyParam, trimAll(sendPhone.current || ''))
      .then((res) => {
        countDown = APP_SMS_FREQUENCY
        return res;
      })
      .catch(errorMessage => {
        countDown = APP_SMS_FREQUENCY
        showToast({ content: errorMessage })
      })

    if (result) {
      setIsWaiting(true)
      return {
        captchaResult: true, // 验证码验证是否通过，boolean类型，必选
        bizResult: true, // 业务验证是否通过，boolean类型，可选；若为无业务验证结果的场景，bizResult可以为空
      }
    }

    return {
      captchaResult: false, // 验证码验证是否通过，boolean类型，必选
      bizResult: false, // 业务验证是否通过，boolean类型，可选；若为无业务验证结果的场景，bizResult可以为空
    }
  }

  const pluginProps = {
    SceneId: '1voc1dpi',
    mode: 'popup',
    captchaVerifyCallback,
    onBizResultCallback: () => {},
    slideStyle: {
      width: 540, // 宽度默认为540rpx
      height: 60, // 高度默认为60rpx
    },
    language: 'cn',
    region: 'cn',
  }

  const onShowCaptcha = () => {
    AliyunCaptchaPluginInterface.show()
  }

  return (
    <MainLayout className="login-form">
      <HdInput
        name="phone"
        // @ts-ignore
        type="tel"
        maxlength={13}
        error={phoneError}
        placeholder="请填写您的手机号"
        value={phone}
        onFocus={() => setPhoneError(false)}
        onChange={handlePhone}
      />
      <HdInput
        required
        name="opt"
        type="number"
        maxlength={APP_SMS_LENGTH}
        placeholder="请填写短信验证码"
        error={optError}
        value={opt}
        onFocus={() => setOptError(false)}
        onChange={setOpt}
      >
        <Button
          btnType="text"
          id="captcha-button"
          onClick={handleOpt}
          className="login-form__button--otp"
        >
          {waitText}
        </Button>
      </HdInput>

      <View className="login-form__protocol">
        <ProtocolCheckBox checked={checked} tipsVisible={tipsVisible} onCheck={checkHandler} />
      </View>
      <Button
        btnType={btnType}
        onClick={checked ? handleLogin : () => setTipsVisible(true)}
        loading={loading}
        className="login-form__button--submit"
      >
        注册/登录
      </Button>
      <aliyun-captcha id="captcha-element" props={pluginProps} />
    </MainLayout>
  )
}

export default LoginForm
