import { getMenuButtonBoundingClientRect, getSystemInfoSync } from '@tarojs/taro'

let capsulePos = { tipsWrapRight: 0, arrowRight: 0, top: 20 }
let isInit = false

// 获取菜单按钮（右上角胶囊按钮）的布局位置信息。坐标信息以屏幕左上角为原点和系统信息屏幕宽度
const computedCapsulePos = (customNav = false) => {
  if (isInit) {
    return capsulePos
  }

  const capsuleReact = getMenuButtonBoundingClientRect()
  const { screenWidth } = getSystemInfoSync()

  const tipsWrapRight = screenWidth - capsuleReact.right
  const arrowRight = screenWidth - capsuleReact.left - capsuleReact.width / 4 - 10

  capsulePos = {
    tipsWrapRight,
    arrowRight,
    top: customNav ? capsuleReact.top + capsuleReact.height : 0,
  }
  isInit = true

  return capsulePos
}

export default computedCapsulePos
