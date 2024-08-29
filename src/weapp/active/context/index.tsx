import { createContext, useContext } from 'react'

import { IActiveEventParams } from '@/def/active'

const ActiveEventParamsContext = createContext<IActiveEventParams>({
  event_name: '',
  event_rank: '',
})

export default ActiveEventParamsContext

export function useActiveEventParams(): IActiveEventParams {
  return useContext<IActiveEventParams>(ActiveEventParamsContext)
}
