import { eventCenter, navigateTo } from '@tarojs/taro'

import { ILocation } from '@/def/common'
import { encodeURLParams } from '@/services/StringService'

export const SelectJobCategoryEventName = 'selectJobCategory'

const selectJobCategoryPagePath =
  process.env.TARO_ENV === 'h5' ? '/h5/job-categories/index' : '/weapp/general/job-categories/index'

export interface SelectJobCategoryOption {
  mulitMode?: boolean
  limit?: number
  selectionValues?: string[]
  required?: boolean
}

function useSelectJobCategory() {
  return <T = ILocation>(
    onJobCategorySelected: Func1<T, void>,
    option: SelectJobCategoryOption
  ) => {
    const { mulitMode = false, required = false, selectionValues: selectionId = [], limit } = option

    const options = { mulitMode, required, limit, selection: selectionId }
    const url = selectJobCategoryPagePath + '?' + encodeURLParams(options)

    eventCenter.once(SelectJobCategoryEventName, jobs => void onJobCategorySelected(jobs))
    navigateTo({ url })
  }
}

export default useSelectJobCategory
