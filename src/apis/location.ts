import Client from '@/apis/client'
import { ICityOption } from '@/def/common'

// 城市信息
export const getCitiesApi = () =>
  Client({ url: '/options/cities', cacheKey: 'com.ymtd.m.cache.cities' })

// 根据当前经纬度获取城市
export const getCurrentApi = (lon: number, lat: number) =>
  Client({
    url: '/area/location',
    cacheKey: 'com.ymtd.m.cache.current_city',
    throttle: 10000,
    data: { location: `${lat},${lon}` },
  })

// 城市信息
export const getCitieListApi = () =>
  Client<ICityOption[]>({
    url: '/options/cityList',
    cacheKey: 'com.ymtd.m.cache.cityOptions',
    throttle: 100000,
  })
