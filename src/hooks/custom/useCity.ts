import { useCallback } from 'react'

import { ILocation } from '@/def/common'
import { dispatchSetCurrentCity, useAppSelector } from '@/store'

export interface IUpdateCurrentCityOption {}

export function useUpdateCurrentCity(
  _option: IUpdateCurrentCityOption = {}
): Func1<ILocation, void> {
  return useCallback(newLocation => {
    dispatchSetCurrentCity(newLocation)
  }, [])
}

// 当前选中的省市区
export function useCurrentCity(): ILocation {
  return useAppSelector(store => store.common.currentCity)
}
