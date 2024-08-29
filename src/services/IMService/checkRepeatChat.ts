import { getCurrentPages } from '@tarojs/taro'

type IChattingRepeatInfo = {
  targetId: string
  jobId: number
}

type IChattingRepeatRecord = Record<number, IChattingRepeatInfo>

type IChattingRepeatCheckResult = {
  isRepeat: boolean
  delta: number
  repeatJobId: number
}

const chattingRepeatRecords: IChattingRepeatRecord = []

export function checkIsRepeat(hrId: number): IChattingRepeatCheckResult {
  const repeatInfo = chattingRepeatRecords[hrId]
  if (!repeatInfo) {
    return { isRepeat: false, delta: -1, repeatJobId: -1 }
  }

  const currentPages = getCurrentPages()

  const chattingPagePosition = currentPages.findIndex(
    page => decodeURIComponent(page?.options?.targetId) === repeatInfo.targetId
  )

  const delta = currentPages.length - chattingPagePosition - 1

  return { isRepeat: true, delta, repeatJobId: repeatInfo.jobId }
}

export function entryChatting(hrId: number, chattingRepeatInfo: IChattingRepeatInfo) {
  chattingRepeatRecords[hrId] = chattingRepeatInfo
}

export function leaveChatting(hrId: number) {
  chattingRepeatRecords[hrId] = undefined as any
}
