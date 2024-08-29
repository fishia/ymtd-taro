import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import relativeTime from 'dayjs/plugin/relativeTime'
import _ from 'lodash'

dayjs.extend(relativeTime)
dayjs.extend(isBetween)

/**
 * 计算相对时间
 * @param time 时间字符串或时间类型
 * @returns 刚刚 1分钟前  20分钟  1小时 7小时 1天 6天 一周前
 */
export function computeRelativeTime(time: string | Date) {
  if (!time || !dayjs(time).isValid()) {
    return ''
  }
  const interval = dayjs(time).toNow()
  const parseTime = interval.split(' ')
  const len = parseTime.length
  const unit = parseTime[len - 1]
  if (unit.includes('second') || unit.includes('minute') || unit.includes('hour')) {
    return '今天'
  }
  const amount = +parseTime[len - 2]

  const num = _.isNaN(amount) ? 1 : amount
  // if (unit.includes('minute')) {
  //   return `${num}分钟前`
  // }
  // if (unit.includes('hour')) {
  //   return `${num}小时前`
  // }
  if (unit.includes('day') && num < 7) {
    return `${num}天前`
  }
  return '一周前'
}

/**
 * 计算年龄
 */

export function computeAge(time: string): string {
  if (!dayjs(time).isValid()) {
    return '未知'
  }
  const year = dayjs().year() - dayjs(time).year()
  const older = dayjs().month() >= dayjs(time).month() && dayjs().date() >= dayjs(time).date()
  if (older) {
    return `${year}岁`
  }
  return `${year - 1}岁`
}

/**
 * 格式化日期
 * @param time
 * @param format
 * @returns
 */
export function formatDate(time?: string, format: string = 'YYYY-MM-DD HH:mm'): string {
  if (!dayjs(time).isValid()) {
    return ''
  }

  return dayjs(time).format(format)
}

//是否在活动时间内
export function activityStatus(): boolean {
  return dayjs().isBetween('2022-05-01 00:00:00', '2022-06-22 23:59:59', 'ms')
}
// 2周开启省选择
export function validWithinTwoWeeks(): boolean {
  return dayjs().isBetween('2023-04-03 00:00:00', '2023-05-02 23:59:59', 'ms')
}
