import { eventCenter, navigateTo } from '@tarojs/taro'

import { ILocation } from '@/def/common'
import { encodeURLParams } from '@/services/StringService'

export const SelectLocationEventName = 'selectLocation'

export interface SelectLocationOption {
  showAll?: boolean
  mulitMode?: boolean
  limit?: number
  selectionId?: number[]
  required?: boolean
}

function useSelectLocation(route = '/weapp/general/location/index') {
  return <T = ILocation>(onLocationSelected: Func1<T, void>, option: SelectLocationOption) => {
    const { showAll = false, mulitMode = false, required = false, selectionId, limit } = option

    const options = { showAll, required, mulitMode, limit, selection: selectionId }
    const url = `${route}?` + encodeURLParams(options)

    eventCenter.off(SelectLocationEventName)
    eventCenter.once(SelectLocationEventName, city => void onLocationSelected(city))
    navigateTo({ url })
  }
}

export default useSelectLocation
