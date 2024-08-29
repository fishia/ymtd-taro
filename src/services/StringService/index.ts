export * from './sensitive'

/**
 * 文本字符串转HTML  \n --> <br />>
 * @param str str
 * @returns 格式化的字符串
 */
export const formatStringToHtml = (str: string) => {
  return str.replace(/\n/g, '<br />')
}

/**
 * 字符串去除所有空格
 * @param val string
 * @returns string
 */
export function trimAll(val: string | number) {
  return String(val).replace(/\s+/g, '')
}

/**
 * 返回格式化手机号 自动去除空格截取前11位
 * @param val string | number
 * @returns string
 */
export function formatPhone(val: string | number) {
  const str = trimAll(val).slice(0, 11)
  return [str.slice(0, 3), str.slice(3, 7), str.slice(7, 11)].join(' ').trim()
}

/**
 * 判断是否为有效字符串，'' ' '为无效字符串
 * @param key
 * @returns
 */
export function isValidString(key) {
  return key && typeof key === 'string' && key.trim().length > 0
}

/**
 * 文本高亮，第一版。采用HTML实现
 * @param val 待格式化字符串
 * @param key 关键字
 * @returns dangerouslySetInnerHTML
 */
export function textHighLight(val: string, key: string) {
  if (val && key) {
    return `<text class="hl">${val.replace(
      key,
      `<text class="text--emphasize">${key}</text>`
    )}</text>`
  }
  return val
}

/**
 * 生成随机数
 * @returns
 */
export function uuid() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  const value: string[] = []

  let i = 0
  let r

  value[8] = value[13] = value[18] = value[23] = '-'
  value[14] = '4'

  for (i = 0; i < 36; i++) {
    if (!value[i]) {
      r = 0 | (Math.random() * 16)
      value[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r]
    }
  }

  return value.join('')
}

/**
 * 将对象编码成不含问号的 URL 参数
 * @param obj 要编码的对象（falsy 的值不会被编码）
 * @returns 编码后不含问号的 URL
 */
export function encodeURLParams(obj: object = {}): string {
  const handleValue = val => (Array.isArray(val) ? val.map(String).join(',') : String(val))
  const handleEncode = process.env.TARO_ENV === 'h5' ? encodeURIComponent : t => String(t)

  const params: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    if (value) {
      params.push(key + '=' + handleEncode(handleValue(value)))
    }
  }

  return params.join('&')
}

/**
 * 自编码后的 URL 参数字符串中解析出参数
 * @param str 要解码的 URL 参数
 * @returns 解析出的参数键值对对象
 */
export function decodeURLParam(str = ''): any {
  const reg = /([^=&\s]+)[=\s]*([^&\s]*)/g
  const obj = {}

  let matchItem: string[] | null = null
  while ((matchItem = reg.exec(str)) !== null) {
    obj[matchItem[1]] = matchItem[2]
  }

  return obj
}

/**
 * 对象转url参数
 * @param obj
 * @returns
 */
export function generateUrlParams(obj: Record<string, string> = {}): string {
  const params: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    params.push(key + '=' + encodeURIComponent(value))
  }

  return params.join('&')
}

/**
 * url参数编码对象解码
 * @param obj
 * @returns
 */
export function parseEncodeParams(params: Record<string, string> = {}) {
  const decode: Record<string, any> = {}
  Object.entries(params).forEach(it => {
    decode[it[0]] = decodeURIComponent(it[1])
  })
  return decode
}

/**
 * PC 扫码登录时用于解析二维码
 * @param str 要解析的二维码结果字符串
 * @returns 提取出 sign 字段，非法的字符串返回 undefined
 */
export function checkQRCode(str: string): string | undefined {
  // 二维码内容形如： geebox://login?sign=wm5nfE1BHOwjELIYt3yCwn8g-Gl6QkJO
  const reg = /geebox:\/\/login\?sign=([^&]+)/

  return str?.match(reg)?.[1]
}

/**
 * 将对象拼接为url参数
 * @param obj
 * @returns
 */
export const objectToUrl = (obj: object) => {
  const arr: string[] = []
  for (let p in obj) {
    arr.push(`${p}=${decodeURIComponent(obj[p])}`)
  }
  return arr.join('&')
}

// 高亮或者加粗文本（春战弹窗使用）
export function taroHighLightOrStrongText(
  val: string,
  highlightText?: string,
  strongText?: string
) {
  if (highlightText && val.includes(highlightText)) {
    return `<text>${val.replace(
      highlightText,
      `<text class="highlightText">${highlightText}</text>`
    )}</text>`
  }
  if (strongText && val.includes(strongText)) {
    return `<text>${val.replace(
      strongText,
      `<text class="strongText">${strongText}</text>`
    )}</text>`
  }
  return val
}
