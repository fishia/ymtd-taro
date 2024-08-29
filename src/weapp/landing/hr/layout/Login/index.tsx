import {
  View,
  Image,
  Button,
  ButtonProps,
  BaseEventOrig,
  ITouchEvent,
  Text,
} from '@tarojs/components'
import { login, switchTab, navigateTo, makePhoneCall } from '@tarojs/taro'
import c from 'classnames'
import { debounce } from 'lodash'
import { FC, useRef, useState } from 'react'

import { signUpForHRApi } from '@/apis/user'
import handler from '@/assets/imgs/handler.png'
import ProtocolCheckBox from '@/components/ProtocolCheckBox'
import { APP_DOWNLOAD, YMTD_PHONE } from '@/config'
import { IError } from '@/def/client'
import useToast from '@/hooks/custom/useToast'
import { jumpToWebviewPage } from '@/utils/utils'

import { reportLandingData, reportStore } from '../useChannel'

import './index.scss'

export interface ILogin {
  className?: string
  fixed?: boolean
}

export interface ILatestPhoneDetail extends ButtonProps.onGetPhoneNumberEventDetail {
  code: string
}

const Login: FC<ILogin> = props => {
  const prefixCls = 'landing-loginHR'
  const { className, fixed = false } = props
  const [checked, setChecked] = useState(false)
  const [tipVisibility, setTipVisibility] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const codeRef = useRef('')
  const showToast = useToast()

  const onCheck = (value: boolean) => {
    setChecked(value)
    tipVisibility && setTipVisibility(false)
  }

  const fetchRegisterHR = (e: BaseEventOrig<ILatestPhoneDetail>) => {
    if (e.detail.encryptedData) {
      signUpForHRApi({ loginCode: codeRef.current, ...e.detail, ...reportStore })
        .then(() => {
          setIsPending(false)
          // navigateTo({ url:  })
          jumpToWebviewPage(APP_DOWNLOAD)
        })
        .catch((error: IError) => {
          setIsPending(false)
          showToast({ content: error.errorMessage || '注册失败请重试' })
        })
    } else {
      setIsPending(false)
    }
  }

  const loginHandler = (e: ITouchEvent) => {
    if (isPending) {
      e.stopPropagation()
      e.preventDefault()
      return
    }
    reportLandingData('RegisterClick')
    if (checked) {
      setIsPending(true)
      loginDebounce()
    } else {
      setTipVisibility(true)
    }
  }

  const loginDebounce = debounce(
    () => {
      console.log(234)

      login().then(res => {
        codeRef.current = res.code
      })
    },
    1000,
    {
      leading: true,
      trailing: false,
    }
  )

  const goHome = () => {
    switchTab({ url: '/weapp/pages/job/index' })
  }

  return (
    <View className={c(className, prefixCls, { [`${prefixCls}--fixed`]: fixed })}>
      <ProtocolCheckBox checked={checked} tipsVisible={tipVisibility} onCheck={onCheck} />
      <View className={`${prefixCls}__btnBlock`}>
        <Button
          onGetPhoneNumber={fetchRegisterHR}
          className={`${prefixCls}__btn`}
          openType={checked ? 'getPhoneNumber' : ''}
          onClick={loginHandler}
        >
          {isPending ? '登录中...' : '微信极速注册为招聘者'}
        </Button>
        <Image src={handler} className={`${prefixCls}__handler`} />
        <View className={`${prefixCls}__bubble`} />
        <View className={`${prefixCls}__bubble2`} />
      </View>

      {/* <View className={`${prefixCls}__btn--text`} onClick={goHome}>
        我是求职者，我要求职
      </View> */}

      {/* <View className={`${prefixCls}__tel`}>
        <Text>注册/登录有问题请打：</Text>
        <Text className="phone" onClick={() => void makePhoneCall({ phoneNumber: YMTD_PHONE })}>
          0512-6262-6030
        </Text>
      </View> */}
    </View>
  )
}

export default Login
