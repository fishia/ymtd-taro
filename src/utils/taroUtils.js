import Taro from '@tarojs/taro'

const ENV = Taro.getEnv()
function delay(delayTime = 25) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, delayTime)
  })
}
function delayQuerySelector(selectorStr, delayTime = 500) {
  return new Promise(resolve => {
    const selector = Taro.createSelectorQuery()
    delay(delayTime).then(() => {
      selector
        .select(selectorStr)
        .boundingClientRect()
        .exec(res => {
          resolve(res)
        })
    })
  })
}
function delayGetScrollOffset({ delayTime = 500 }) {
  return new Promise(resolve => {
    delay(delayTime).then(() => {
      Taro.createSelectorQuery()
        .selectViewport()
        .scrollOffset()
        .exec(res => {
          resolve(res)
        })
    })
  })
}
function delayGetClientRect({ selectorStr, delayTime = 500 }) {
  const selector = Taro.createSelectorQuery()
  return new Promise(resolve => {
    delay(delayTime).then(() => {
      selector
        .select(selectorStr)
        .boundingClientRect()
        .exec(res => {
          resolve(res)
        })
    })
  })
}
function uuid(len = 8, radix = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  const value = []
  let i = 0
  radix = radix || chars.length
  if (len) {
    // Compact form
    for (i = 0; i < len; i++) value[i] = chars[0 | (Math.random() * radix)]
  } else {
    // rfc4122, version 4 form
    let r
    // rfc4122 requires these characters
    /* eslint-disable-next-line */
    value[8] = value[13] = value[18] = value[23] = '-'
    value[14] = '4'
    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!value[i]) {
        r = 0 | (Math.random() * 16)
        value[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r]
      }
    }
  }
  return value.join('')
}
function getEventDetail(event) {
  let detail
  switch (ENV) {
    case Taro.ENV_TYPE.WEB:
      detail = {
        pageX: event.pageX,
        pageY: event.pageY,
        clientX: event.clientX,
        clientY: event.clientY,
        offsetX: event.offsetX,
        offsetY: event.offsetY,
        x: event.x,
        y: event.y,
      }
      break
    case Taro.ENV_TYPE.WEAPP:
      detail = {
        pageX: event.touches[0].pageX,
        pageY: event.touches[0].pageY,
        clientX: event.touches[0].clientX,
        clientY: event.touches[0].clientY,
        offsetX: event.target.offsetLeft,
        offsetY: event.target.offsetTop,
        x: event.target.x,
        y: event.target.y,
      }
      break
    case Taro.ENV_TYPE.ALIPAY:
      detail = {
        pageX: event.target.pageX,
        pageY: event.target.pageY,
        clientX: event.target.clientX,
        clientY: event.target.clientY,
        offsetX: event.target.offsetLeft,
        offsetY: event.target.offsetTop,
        x: event.target.x,
        y: event.target.y,
      }
      break
    case Taro.ENV_TYPE.SWAN:
      detail = {
        pageX: event.changedTouches[0].pageX,
        pageY: event.changedTouches[0].pageY,
        clientX: event.target.clientX,
        clientY: event.target.clientY,
        offsetX: event.target.offsetLeft,
        offsetY: event.target.offsetTop,
        x: event.detail.x,
        y: event.detail.y,
      }
      break
    default:
      detail = {
        pageX: 0,
        pageY: 0,
        clientX: 0,
        clientY: 0,
        offsetX: 0,
        offsetY: 0,
        x: 0,
        y: 0,
      }
      console.warn('getEventDetail暂未支持该环境')
      break
  }
  return detail
}
function initTestEnv() {
  if (process.env.ENV === 'test') {
    Taro.initPxTransform({
      designWidth: 750,
      deviceRatio: {
        640: 2.34 / 2,
        750: 1,
        828: 1.81 / 2,
      },
    })
  }
}
function isTest() {
  return process.env.ENV === 'test'
}
let scrollTop = 0
function handleTouchScroll(flag) {
  if (ENV !== Taro.ENV_TYPE.WEB) {
    return
  }
  if (flag) {
    scrollTop = document.documentElement.scrollTop
    // 使body脱离文档流
    document.body.classList.add('at-frozen')
    // 把脱离文档流的body拉上去！否则页面会回到顶部！
    document.body.style.top = `${-scrollTop}px`
  } else {
    document.body.style.top = ''
    document.body.classList.remove('at-frozen')
    document.documentElement.scrollTop = scrollTop
  }
}
function pxTransform(size) {
  if (!size) return ''
  const designWidth = 750
  const deviceRatio = {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  }
  return `${size / deviceRatio[designWidth]}rpx`
}
function objectToString(style) {
  if (style && typeof style === 'object') {
    let styleStr = ''
    Object.keys(style).forEach(key => {
      const lowerCaseKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      styleStr += `${lowerCaseKey}:${style[key]};`
    })
    return styleStr
  } else if (style && typeof style === 'string') {
    return style
  }
  return ''
}
/**
 * 合并 style
 * @param {Object|String} style1
 * @param {Object|String} style2
 * @returns {String}
 */
function mergeStyle(style1, style2) {
  if (style1 && typeof style1 === 'object' && style2 && typeof style2 === 'object') {
    return Object.assign({}, style1, style2)
  }
  return objectToString(style1) + objectToString(style2)
}
export {
  delay,
  delayQuerySelector,
  uuid,
  getEventDetail,
  initTestEnv,
  isTest,
  pxTransform,
  handleTouchScroll,
  delayGetClientRect,
  delayGetScrollOffset,
  mergeStyle,
}
//# sourceMappingURL=utils.js.map
