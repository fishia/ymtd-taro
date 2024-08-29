import dayjs from 'dayjs'

import { IResumeExp } from '@/def/resume'

const formatDate = (date: string) =>
  date.startsWith('0000') ? '至今' : dayjs(date).format('YYYY.MM')

const formatYearDate = (date: string) =>
  date.startsWith('0000') ? '至今' : dayjs(date).format('YYYY')

export const renderDate = (expItem: IResumeExp) => {
  if (expItem.startDate && expItem.endDate) {
    return [formatDate(expItem.startDate), formatDate(expItem.endDate)].join('-')
  }

  return ''
}

export const renderYearDate = (expItem: IResumeExp) => {
  if (expItem.startDate && expItem.endDate) {
    return [formatYearDate(expItem.startDate), formatYearDate(expItem.endDate)].join('-')
  }

  return ''
}
