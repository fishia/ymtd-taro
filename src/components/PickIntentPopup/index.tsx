import { Image, View } from '@tarojs/components'
import {
  eventCenter,
  getSystemInfoSync,
  hideLoading,
  showLoading,
  showToast,
  useRouter,
} from '@tarojs/taro'
import c from 'classnames'
import { last } from 'lodash'
import { useEffect, useMemo, useState } from 'react'

import {
  appendUserIntentApi,
  deleteUserIntentInfoApi,
  fetchUserIntentsApi,
  updateUserIntentInfoApi,
} from '@/apis/resume'
import { REFRESH_INTENTS_LIST } from '@/config'
import { IntentWorkTypeEnum, IResumeIntentInfo } from '@/def/resume'
import useModalState from '@/hooks/custom/useModalState'
import { useRefreshCurrentResume } from '@/hooks/custom/useResume'
import { getNewLoginIntent, setNewLoginIntent } from '@/services/AccountService'

import closeIcon from './close.svg'

import './index.scss'

const platform = getSystemInfoSync().platform
const isIOS = platform === 'ios' || platform === 'mac'

export const showPickIntentPopupEventKey = 'pickintentpopup'

export async function showPickIntentPopup() {
  const path = '/' + last(getCurrentPages())?.route
  eventCenter.trigger(path + showPickIntentPopupEventKey)
}

export default function PickIntentPopup() {
  const router = useRouter()
  const refreshResume = useRefreshCurrentResume()
  const [intents, setIntents] = useState<IResumeIntentInfo[]>([])

  const { alive, active, setModal } = useModalState(300)

  const loginIntent = getNewLoginIntent()

  useEffect(() => {
    const callback = () => {
      fetchUserIntentsApi().then(setIntents)
      setModal(true)
    }
    eventCenter.on(router.path + showPickIntentPopupEventKey, callback)

    return () => {
      eventCenter.off(router.path + showPickIntentPopupEventKey, callback)
    }
  }, [router.path, setModal])

  const replaceHandler = async (intent: IResumeIntentInfo) => {
    showLoading({ title: '替换中...' })

    try {
      if (!loginIntent) {
        return
      }
      await updateUserIntentInfoApi({
        ...loginIntent,
        id: intent.id,
      })

      // await deleteUserIntentInfoApi(intent.id!)
      // await appendUserIntentApi(loginIntent)

      refreshResume()
      eventCenter.trigger(REFRESH_INTENTS_LIST)

      setTimeout(() => {
        hideLoading()
        setNewLoginIntent(null)
        setModal(false)
      }, 250)
    } catch (err) {
      hideLoading()
      setTimeout(() => {
        showToast({
          title: err.errorMessage,
          icon: 'none',
        })
      }, 250)
    }
  }

  const closeHandler = () => {
    setNewLoginIntent(null)
    setModal(false)
  }

  const renderIntent = (intent?: IResumeIntentInfo) => {
    if (!intent) return

    const isCurrent = intent === loginIntent
    const text = [
      `${intent.expectSalaryFrom}-${intent.expectSalaryTo}K`,
      intent.cityName,
      ...(intent.keywords || []).map(t => t.name).slice(0, 2),
    ]
    const displayText = text.join(' ')

    return (
      <View
        key={intent.id || 'default'}
        className={c('pick-intent-popup__item', isCurrent ? 'current' : '')}
      >
        <View className="pick-intent-popup__item__title">
          <View
            className={c(
              'pick-intent-popup__item__main-title line-ellipsis',
              isIOS ? 'fw500' : 'fw600'
            )}
          >
            {intent.expectPositionName}
          </View>

          <View className="pick-intent-popup__item__sub-title">
            {intent.workType === IntentWorkTypeEnum.PART_TIME ? '兼职' : '全职'}
          </View>
        </View>
        <View className="pick-intent-popup__item__intro line-ellipsis">{displayText}</View>

        {isCurrent ? null : (
          <View
            onClick={() => void replaceHandler(intent)}
            className="pick-intent-popup__item__button"
          >
            替换
          </View>
        )}
      </View>
    )
  }

  if (!alive) {
    return null
  }

  return (
    <View className={c('pick-intent-popup-mask', active ? 'actived' : '')}>
      <View className={c('pick-intent-popup', active ? 'actived' : '')}>
        <Image onClick={closeHandler} className="pick-intent-popup__close" src={closeIcon} />
        <View className="pick-intent-popup__title">
          当前账号的求职意向（<View className="pick-intent-popup__title__hl">3</View>/3）
        </View>
        <View className="pick-intent-popup__sub-title">点击「替换」可替换对应的求职意向至最新</View>
        {renderIntent(loginIntent)}

        <View className="pick-intent-popup__tips">选择要替换的求职意向</View>
        <View className="pick-intent-popup__intents">{intents.map(renderIntent)}</View>
      </View>
    </View>
  )
}
