import { getLocation } from '@tarojs/taro'

import { getCitiesApi, getCurrentApi } from '@/apis/location'
import { IError } from '@/def/client'

// 获取城市信息
export const fetchCities = () => getCitiesApi()

// 获取城市信息
export const fetchCurrent = (lon: number, lat: number) => getCurrentApi(lon, lat)

// 获取当前位置信息
export const getCurrentCity = (successFunc, errorFunc) => {
  getLocation({
    type: 'wgs84',
    success: res => {
      const lat = res.latitude // 纬度
      const lon = res.longitude // 经度

      fetchCurrent(lon, lat)
        .then(data => {
          successFunc(data)
          return data
        })
        .catch(({ errorMessage }: IError) => {
          errorFunc(errorMessage)
        })
    },
    fail: res => {
      errorFunc(res)
    },
  })
}
