import dayjs from 'dayjs'

// 会话列表中的时间格式化显示
export function conversationItemTimeFormat(
  time: number,
  nowTime: number = new Date().getTime()
): string {
  const messageTime = dayjs(time)
  if (!messageTime.isValid()) {
    return ''
  }

  const now = dayjs(nowTime)

  if (now.year() !== messageTime.year()) {
    return messageTime.format('YYYY-MM-DD')
  }

  if (now.month() === now.month() && now.date() === messageTime.date()) {
    return messageTime.format('HH:mm')
  } else {
    return messageTime.format('MM-DD')
  }
}

// 聊天时间格式化显示
export function messageItemTimeFormat(
  time: number,
  nowTime: number = new Date().getTime()
): string {
  const messageTime = dayjs(time)
  if (!messageTime.isValid()) {
    return ''
  }

  const now = dayjs(nowTime)

  if (now.year() !== messageTime.year()) {
    return messageTime.format('YYYY-MM-DD')
  }

  if (now.month() === now.month() && now.date() === messageTime.date()) {
    return messageTime.format('HH:mm')
  } else {
    return messageTime.format('MM-DD HH:mm')
  }
}
