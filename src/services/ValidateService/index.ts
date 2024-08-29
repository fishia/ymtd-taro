import { isValidString, trimAll } from '@/services/StringService'

/**
 * 移动手机号校验 自动去除空格
 * @param val string | number
 * @returns boolean
 */
export function validatePhone(val: string | number) {
  const str = trimAll(val).replace(/\s+/g, '')
  const reg = /^1[3456789]\d{9}$/
  return reg.test(str)
}

// 表单项，手机号码验证
export function checkPhone(phone) {
  if (!phone) {
    return new Error('请输入手机号码')
  }

  if (/^1[3456789]\d{9}$/.test(phone)) {
    return null
  }

  return new Error('请输入正确的手机号码')
}

// 表单项，开始工作年份
export function checkWorkBegin(val: string) {
  return Number(val) > 0 ? null : new Error('请选择开始工作年份')
}

// 表单项，非空文本校验提示
export function checkMessage(message: string) {
  return val => (isValidString(val) ? null : new Error(message))
}

// 表单项，验证日期区间
export function checkDateRange(message: string) {
  return val => (val?.length === 2 ? null : new Error(message))
}

// 表单项，校验邮箱地址
export function checkEmail(email: string = '') {
  return email === '' || /^.+@.+$/.test(email) ? null : new Error('请输入正确的邮箱')
}

// 校验微信号
export function checkWechat(wechat: string = '') {
  let reg = /^[[\x00-\xff]{1,20}]*$/
  return reg.test(wechat)
}
