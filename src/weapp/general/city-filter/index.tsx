import { ScrollView, View } from '@tarojs/components'
import {
  eventCenter,
  getStorageSync,
  hideLoading,
  navigateBack,
  showLoading,
  useDidHide,
} from '@tarojs/taro'
import { pickBy } from 'lodash'
import React, { useEffect, useState } from 'react'

import { getCitieListApi } from '@/apis/location'
import { APP_TOKEN_FLAG } from '@/config'
import { ILocation, ICityOption } from '@/def/common'
import { useCurrentCity } from '@/hooks/custom/useCity'
import { SelectLocationEventName } from '@/hooks/custom/useSelectLocation'
import MainLayout from '@/layout/MainLayout'
import { getCurrentCity } from '@/services/LocationService'

import AreaTag from './components/areaTag'

import './index.scss'

const defaultLocation = { id: -1, name: '定位城市' }
const errorLocation = { id: -1, name: '定位失败，点击重新获取' }
const currentDefaultLocation = { id: -1, name: '正在定位' }

const CityFilter: React.FC = () => {
  const isLogined = getStorageSync(APP_TOKEN_FLAG)
  const defaultCityFilter = useCurrentCity()
  const [cityTreeData, setCityTreeData] = useState<ICityOption[]>([]) //可遍历最外层的省、热门
  const [cityList, setCityList] = useState<ICityOption[]>([]) // 市
  const [regionList, setRegionList] = useState<ICityOption[]>([]) // 区
  const [filterObj, setFilterObj] = useState<ILocation>(defaultCityFilter) // 省市区选中的id集合
  const [openWatch, setOpenWatch] = useState(false) // 是否开启筛选项结果监听，默认初始化不监听

  useEffect(() => {
    showLoading({ title: '加载中...' })
    getCitieListApi()
      .then(async citys => {
        // 请求地理位置 API 拉取当前城市
        if (isLogined) {
          setCityTreeData([{ ...defaultLocation, list: [currentDefaultLocation] }, ...citys])
          let latestTreeData = await getCurrentLocation(citys)
          await initComponentSelections(latestTreeData)
        } else {
          setCityTreeData(citys)
        }
      })
      .finally(hideLoading)
  }, [isLogined])

  // 获取实时定位
  const getCurrentLocation: (citys: ICityOption[]) => Promise<ICityOption[]> = citys => {
    return new Promise(resolve => {
      getCurrentCity(
        current => {
          let options = [{ ...defaultLocation, list: [current] }, ...citys]
          setCityTreeData(options)
          resolve(options)
        },
        () => {
          let options = [{ ...defaultLocation, list: [errorLocation] }, ...citys]
          setCityTreeData(options)
          resolve(options)
        }
      )
    })
  }

  // 判断改选项是选中还是反选
  const isCitySlected = (key: string, value: number) => {
    return filterObj[`${key}`] === value
  }

  // 反选组件选中状态
  const initComponentSelections = (treeData: ICityOption[]) => {
    let citys: ICityOption[] = []
    let regions: ICityOption[] = []
    citys =
      treeData.filter(item =>
        defaultCityFilter.provinceId ? item.id === defaultCityFilter.provinceId : !item.id
      )[0]?.list || []
    if (defaultCityFilter.city_id) {
      regions = citys.filter(item => item.id === defaultCityFilter.city_id)[0]?.list || []
    }
    if (citys.length) setCityList(citys)
    if (regions.length) setRegionList(regions)
  }

  function getCityName(list: ICityOption[], city_id: number) {
    let name
    // 递归各自的值
    const deepRrecursionNameById = (arr: ICityOption[], id: number) => {
      if (Array.isArray(arr) && arr.length) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].id === id) {
            name = arr[i].name
            break
          } else if (arr[i].list) {
            deepRrecursionNameById(arr[i].list as ICityOption[], id)
          }
        }
      }
    }
    deepRrecursionNameById(list, city_id)
    return name
  }

  // 递归各自的值
  const recursionValueByLevel = (key: string, value?: number) => {
    // 省，清空市，区，市、区默认选中全部，市，清空区，以此类推
    let keys = Object.keys(filterObj)
    let currentKeyIndex = Object.keys(filterObj).indexOf(key)
    let newfilters = { ...filterObj }
    for (let i = 0; i < keys.length; i++) {
      if (i <= currentKeyIndex) {
        if (keys[i] === key) newfilters[`${key}`] = value
      } else {
        newfilters[`${keys[i]}`] = undefined
      }
    }
    return newfilters
  }
  // 更新选择的值
  const updateCityFilterObj = (obj: Partial<ILocation>) => {
    setFilterObj({
      ...filterObj,
      ...obj,
    })
  }

  // 省市区选中赋值
  const handleCityClick = (
    key: string,
    value = 0,
    citys?: ICityOption[],
    regions?: ICityOption[]
  ) => {
    setOpenWatch(true)
    if (isCitySlected(key, value)) {
      updateCityFilterObj({ [`${key}`]: value })
    } else {
      setFilterObj({ ...recursionValueByLevel(key, value) })
    }
    if (citys) setCityList(citys)
    setRegionList(regions || [])
  }

  useEffect(() => {
    if (openWatch) {
      // 当选择定位城市、全部或者区时则默认用户已选择完毕
      if (
        (filterObj.provinceId === -1 && filterObj.city_id) ||
        filterObj.regionId ||
        filterObj.city_id === 0 ||
        filterObj.regionId === 0
      ) {
        backToPrePage()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterObj, openWatch])

  useDidHide(() => {
    eventCenter.off(SelectLocationEventName)
  })

  // 选择完毕，存值回到上一页
  const backToPrePage = async () => {
    // 去除value小于等于0的key
    let finalFilterObj = pickBy(filterObj, function (value: any) {
      return (
        value !== '' &&
        value !== undefined &&
        value !== null &&
        value.toString().length &&
        value > 0
      )
    })
    console.log(finalFilterObj)
    let name = getCityName(cityTreeData, Object.values(finalFilterObj).pop() as number)
    let cityName = finalFilterObj.city_id ? getCityName(cityTreeData, finalFilterObj.city_id) : ''
    await eventCenter.trigger(SelectLocationEventName, {
      ...filterObj,
      id: filterObj.city_id || 1,
      name,
      cityName,
    })
    navigateBack()
  }

  return (
    <MainLayout className="cityFilter-index">
      <View className="cityFilter-index__menusWrapper">
        <ScrollView className="cityFilter-index__menu" scrollY>
          {cityTreeData.map(item => (
            <AreaTag
              {...item}
              key={item.id}
              levelKey="provinceId"
              selected={filterObj.provinceId === item.id}
              onClick={(paramsKey, value) =>
                handleCityClick(paramsKey, value, item.list, undefined)
              }
            />
          ))}
        </ScrollView>
        {cityList.length ? (
          <ScrollView className="cityFilter-index__menu" scrollY>
            {cityList.map(item => (
              <AreaTag
                {...item}
                key={item.id}
                levelKey="city_id"
                selected={filterObj.city_id === item.id}
                disabled={item.name === '定位失败，点击重新获取'}
                onDisableClick={() => getCurrentLocation(cityTreeData.slice(1))}
                onClick={(paramsKey, value) =>
                  handleCityClick(paramsKey, value, undefined, item.list)
                }
              />
            ))}
          </ScrollView>
        ) : null}
        {regionList.length ? (
          <ScrollView className="cityFilter-index__menu" scrollY>
            {regionList.map(item => (
              <AreaTag
                {...item}
                key={item.id}
                levelKey="regionId"
                selected={filterObj.regionId === item.id}
                onClick={(paramsKey, value) => handleCityClick(paramsKey, value)}
              />
            ))}
          </ScrollView>
        ) : null}
      </View>
    </MainLayout>
  )
}

export default CityFilter
