import React, { useCallback, useEffect, useState } from 'react'
import {
  eventCenter,
  hideLoading,
  navigateBack,
  showLoading,
  useDidHide,
  useRouter,
} from '@tarojs/taro'
import { View } from '@tarojs/components'
import c from 'classnames'

import { ILocation } from '@/def/common'
import { fetchCities, getCurrentCity } from '@/services/LocationService'
import useToast from '@/hooks/custom/useToast'
import { SelectLocationEventName } from '@/hooks/custom/useSelectLocation'
import { useIsLogin } from '@/hooks/custom/useUser'
import MainLayout from '@/layout/MainLayout'
import Button from '@/components/Button'

import AtIndexes from './components/Indexes'
import CityButton from './components/CityButton'

import './index.scss'

interface ICitiesIndex {
  title: string
  key: string
  items: ILocation[]
}

const defaultLocation = { id: -1, name: '正在定位' }
const errorLocation = { id: -2, name: '定位失败' }

const Location: React.FC = () => {
  const showToast = useToast()

  const router = useRouter()
  const isShowAll = router.params.showAll
  const isMulitMode = router.params.mulitMode
  const limit = Number(router.params.limit) || 5
  const defaultSelection = router.params.selection || ''
  const isRequired = router.params.required

  const [cities, setCities] = useState<ICitiesIndex[]>([])
  const [hotCities, setHotCities] = useState<ILocation[]>([])
  const [current, setCurrent] = useState<ILocation>(defaultLocation)
  const [selections, setSelections] = useState<ILocation[]>([])

  const isEnableConfirm = isMulitMode && isRequired ? selections.length > 0 : true

  const isLogin = useIsLogin()

  useEffect(() => {
    // 回显已选择的城市
    const selectionIds = defaultSelection.split(',').filter(Boolean).map(Number)
    const allSelections: ILocation[] = []

    cities.forEach(cityGroup => {
      cityGroup.items.forEach(city => {
        if (selectionIds.includes(city.id)) {
          allSelections.push({ name: city.name, id: city.id })
        }
      })
    })

    // “全国” 此选项属于特殊项，仅存在于 “热门” 之中
    hotCities.forEach(city => {
      if (selectionIds.includes(city.id) && !allSelections.map(item => item.id).includes(city.id)) {
        allSelections.push({ name: city.name, id: city.id })
      }
    })

    setSelections(allSelections)
  }, [cities, defaultSelection, hotCities])

  useEffect(() => {
    showLoading({ title: '加载中...' })

    // 请求地理位置 API 拉取当前城市
    if (isLogin) {
      getCurrentCity(setCurrent, () => void setCurrent(errorLocation))
    }

    // 拉取城市列表
    fetchCities()
      .then(res => {
        const allCities = Object.entries((res.pinyin as Record<string, ILocation[]>) || {})
          .sort((a, b) => (a[0] >= b[0] ? 0 : 1))
          .map(([pinyin, cityList]) => ({
            title: pinyin,
            key: pinyin,
            items: cityList.filter(city => isShowAll || city.jds !== false),
          }))

        setHotCities(res.hots || [])
        setCities(allCities)

        hideLoading()
      })
      .catch(() => void hideLoading())
  }, [isLogin, isShowAll, showToast])

  useDidHide(() => {
    eventCenter.off(SelectLocationEventName)
  })

  // 该城市是否被选中
  const isCitySelected = useCallback(
    (city: ILocation) => selections.map(t => t.id).includes(city.id),
    [selections]
  )

  // 点击
  const handleCityClick = (item: ILocation) => {
    if (isMulitMode) {
      handleSelected(item)
      return
    }

    eventCenter.trigger(SelectLocationEventName, item)
    navigateBack()
  }

  // 选中或反选
  const handleSelected = (city: ILocation) => {
    const isSelected = isCitySelected(city)
    if (isSelected) {
      setSelections(selections.filter(t => t.id !== city.id))
    } else {
      if (selections.length >= limit) {
        showToast({ content: `最多支持选择 ${limit} 个` })
        return
      }

      setSelections([...selections, city])
    }
  }

  // 点击提交按钮
  const handleConfirm = () => {
    if (isEnableConfirm) {
      eventCenter.trigger(SelectLocationEventName, selections)
      navigateBack()
    }
  }

  return (
    <MainLayout className="select-location">
      <AtIndexes
        topKey="#"
        className={c('hd-location select-location__indexes', {
          'select-location__indexes--multi': isMulitMode,
        })}
        list={cities}
        onClick={handleCityClick}
        selectionIds={selections.map(item => item.id)}
      >
        {isLogin ? (
          <View className="at-indexes__list">
            <View className="at-indexes__list-title">定位城市</View>
            <CityButton
              disabled={current.id <= 0}
              selected={isCitySelected(current)}
              onClick={() => void handleCityClick(current)}
            >
              {current.name}
            </CityButton>
          </View>
        ) : null}

        <View className="at-indexes__list">
          <View className="at-indexes__list-title">热门城市</View>
          <View>
            {hotCities.map(item => (
              <CityButton
                key={item.id}
                selected={isCitySelected(item)}
                onClick={() => void handleCityClick(item)}
              >
                {item.name}
              </CityButton>
            ))}
          </View>
        </View>
      </AtIndexes>

      {isMulitMode ? (
        <View className="select-location__multi-bar">
          <View className="select-location__multi-bar__tip">
            <View className="icon iconfont icongouxuan"></View>
            已选 {selections.length}/{limit}
          </View>
          <Button
            onClick={handleConfirm}
            btnType={isEnableConfirm ? 'primary' : 'disabled'}
            className="select-location__multi-bar__confirm"
          >
            确 定
          </Button>
        </View>
      ) : null}
    </MainLayout>
  )
}

export default Location
