import { Button, ButtonProps } from '@tarojs/components'
import { eventCenter, getStorageSync, login, switchTab, navigateTo, useRouter } from '@tarojs/taro'
import { useSafeState } from 'ahooks'
import c from 'classnames'
import { debounce, noop } from 'lodash'
import { useEffect, useRef } from 'react'

import { initChatApi } from '@/apis/message'
import { NEW_LOGIN_POPUP_APPLY, APP_IS_OLD_USER } from '@/config'
import { IProps } from '@/def/common'
import { IsendRangersData } from '@/def/rangersParams'
import { useShowLoginPopup } from '@/hooks/custom/usePopup'
import { useCurrentUserInfo, useWxLogin } from '@/hooks/custom/useUser'
import { sendDataRangersEvent, sendDataRangersEventWithUrl } from '@/utils/dataRangers'

const loginButtonRecordRef: Record<'current', IRecordJdInfo | undefined> = {
  current: undefined,
}

export async function tryContinueLoginRecordJd(shouldJump?: boolean) {
  if (!loginButtonRecordRef.current) {
    return
  }

  await initChatApi({
    jdId: loginButtonRecordRef.current.id,
    targetUserId: loginButtonRecordRef.current.hrId,
    sendProfile: loginButtonRecordRef.current.mode === 'apply' ? true : undefined,
    exchangeMobile: loginButtonRecordRef.current.mode === 'contactType' ? true : undefined,
  })
  loginButtonRecordRef.current = undefined
  if (shouldJump) {
    switchTab({ url: '/weapp/pages/message/index' })
  }
}

export interface IRecordJdInfo {
  id: number
  hrId: number
  mode: 'greet' | 'apply' | 'contactType'
}

export interface ILoginButtonProps extends Omit<IProps, 'ref'>, ButtonProps {
  onClick?(e: any): void
  autoContinue?: boolean
  recordJdInfo?: IRecordJdInfo
  getPhoneSuccess?: () => void
  confirmText?: string
  sendRangersData?: IsendRangersData
}

export default function LoginButton(props: ILoginButtonProps) {
  const {
    onClick = noop,
    getPhoneSuccess = noop,
    autoContinue = false,
    recordJdInfo,
    style,
    className,
    children,
    sendRangersData,
    ...restProps
  } = props

  const router = useRouter()
  const wxlogin = useWxLogin()
  const showLoginPopup = useShowLoginPopup()
  const isLogined = useCurrentUserInfo()

  const wxCodeRef = useRef('')
  const wxCodeTimeoutRef = useRef(-1)

  const [shouldShowPopup, setShouldShowPopup] = useSafeState(
    () => !Boolean(getStorageSync(NEW_LOGIN_POPUP_APPLY))
  )

  useEffect(() => {
    const callback = () => void setShouldShowPopup(false)
    eventCenter.once(NEW_LOGIN_POPUP_APPLY, callback)

    return () => {
      clearTimeout(wxCodeTimeoutRef.current)
      eventCenter.off(NEW_LOGIN_POPUP_APPLY, callback)
    }
  }, [setShouldShowPopup])

  const ensureWxCode = debounce(
    () => {
      const process = () =>
        login().then(res => {
          wxCodeRef.current = res.code
        })
      process()
      wxCodeTimeoutRef.current = +setTimeout(process, 5 * 60 * 1000)
    },
    1000,
    {
      leading: true,
      trailing: false,
    }
  )

  const clickToLoginHandler = (e: any) => {
    if (props.hoverStopPropagation) {
      e?.stopPropagation?.()
    }

    sendDataRangersEvent('Get_Mobile_Page', { type: '新用户手机号授权' })
    ensureWxCode()
  }

  const showPopupHandler = (e: any) => {
    if (props.hoverStopPropagation) {
      e?.stopPropagation?.()
    }

    if (sendRangersData) {
      sendDataRangersEventWithUrl('register_and_login_click', {
        event_name: '注册登录引导',
        ...sendRangersData,
      })
    }

    loginButtonRecordRef.current = recordJdInfo
    showLoginPopup({
      onConfirm: async () => {
        if (autoContinue) {
          onClick(e)
        }
      },
      confirmText: props.confirmText || '',
      rangersData: {
        type: sendRangersData?.type,
        pageName: sendRangersData?.page_name,
      },
    })
  }

  const getPhoneNumberHandler = (e: any) => {
    if (e?.detail?.encryptedData) {
      sendDataRangersEvent('Click_OK_Button', { is_success: '成功' })
      wxlogin(wxCodeRef.current, e.detail.encryptedData, e.detail.iv, async () => {
        loginButtonRecordRef.current = recordJdInfo

        clearTimeout(wxCodeTimeoutRef.current)
        if (autoContinue) {
          onClick(e)
        }
      }).catch(noop)
    } else {
      sendDataRangersEvent('Cancel_Button_Click')
    }
  }

  return (
    <Button
      {...restProps}
      className={c(className, 'login-button')}
      style={style}
      onClick={isLogined ? onClick : showPopupHandler}
      onGetPhoneNumber={getPhoneNumberHandler}
      // openType={isLogined || shouldShowPopup ? '' : 'getPhoneNumber'}
    >
      {children}
    </Button>
  )
}
