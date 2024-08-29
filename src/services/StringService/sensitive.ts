// 对用户姓名进行脱敏
export function showSensitiveName(rawText: string) {
  return `${rawText[0]}${rawText.length > 2 ? '**' : '*'}`
}

// 对用户手机号进行脱敏
export function showSensitivePhone(rawText: string, withPhoneFormat?: boolean) {
  return rawText.replace(/(.{3}).+(.{4})/g, withPhoneFormat ? '$1 **** $2' : '$1****$2')
}

// 自动判断并脱敏
export function showSensitiveBothNameAndPhone(rawText: string) {
  // return /^[0-9]{11}$/.test(rawText) ? showSensitivePhone(rawText) : showSensitiveName(rawText)
  return /^[0-9]{11}$/.test(rawText) ? showSensitivePhone(rawText) : rawText
}
