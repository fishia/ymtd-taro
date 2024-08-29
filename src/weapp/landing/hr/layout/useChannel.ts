import { useRouterParam } from '@/hooks/custom/useRouterParam'
import { parseEncodeParams } from '@/services/StringService'
import { IDataReport, sendDataRangersEvent } from '@/utils/dataRangers'
import { useRouter } from '@tarojs/taro'

// 一定要在之前调用 useChannel   reportStore才能拿到数据，坑点！
export const reportStore: IDataReport = {
  landingPage: '',
  channelId: '',
  channelLaunch: '',
  activId: '',
  activName: '',
  trParam1: '',
}

const useChannel = () => {
  const param = useRouterParam()
  const decodeParam = parseEncodeParams(param)
  const router = useRouter()

  if (!reportStore.landingPage) {
    reportStore.landingPage = decodeParam.landingpage_url || router.path
    reportStore.channelId = decodeParam.channel_id || ''
    reportStore.channelLaunch = decodeParam.channel_name || decodeParam.channel_id || ''
    reportStore.activId = decodeParam.activ_id || ''
    reportStore.activName = decodeParam.activ_name || ''
    reportStore.trParam1 = decodeParam.tr_param1 || ''
  }

  return reportStore
}

export const reportLandingData = (event: string, body?: Record<string, string>) => {
  const data = { ...reportStore, ...body }

  const postData = {
    landingpage_url: data.landingPage,
    channel_id: data.channelId,
    channel_name: data.channelLaunch,
    activ_id: data.activId,
    activ_name: data.activName,
    tr_param1: data.trParam1,
  }

  if (postData.landingpage_url) {
    // @ts-ignore
    sendDataRangersEvent(event, postData)
  }
}

export default useChannel
