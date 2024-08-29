import React, { useEffect, useState } from 'react'
import Taro, { setStorageSync } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import c from 'classnames'
import PageBackIcon from '@/assets/imgs/back.svg'
import GoJobHome from '@/assets/imgs/goJobHomeIcon.png'

import './index.scss'

interface IProps {
  type?: string
  title: string
  classNames?
  onBack: () => void
}

const Navbar: React.FC<IProps> = props => {
  const { type, title, classNames, onBack } = props
  const isSharePage = type === "sharePage"
  const [status, setStatus] = useState(0)
  const [navHeights, setNavHeights] = useState(0)
  const [backIcon, setBackIcon] = useState("")
  const [isPageBack, setIsPageBack] = useState(false)

  const setNavSize = () => {
    let sysinfo = Taro.getSystemInfoSync()
    let statusHeight = sysinfo.statusBarHeight
    let isiOS = sysinfo.system.indexOf('iOS') > -1
    let navHeight
    if (!isiOS) {
      navHeight = 48
    } else {
      navHeight = 44
    }
    setStatus(statusHeight)
    setNavHeights(navHeight)
    setStorageSync("navHeight", (statusHeight + navHeight))
  }

  const getIconStyle = () => {
    setBackIcon(isSharePage ? GoJobHome : PageBackIcon)
    setIsPageBack(!isSharePage)
  }

  useEffect(() => {
    setNavSize()
    getIconStyle()
  })

  return (
    <View className={c("nav-boxs", classNames)}>
      <View className="nav" style={{ height: `${status + navHeights}px` }}>
        <View className="status" style={{ height: status + 'px' }}></View>
        <View className="navbar" style={{ height: navHeights + 'px' }}>
          {/* 返回按钮 */}
          <View className={c("back-icon", {"back-icon-home": isSharePage})} onClick={onBack}>
            <Image className={c("back-icon-img", {"back-icon-img-home": isSharePage, "page-back-icon-img": isPageBack})} src={backIcon}></Image>
          </View>
          <View className="nav-title">
            <Text>{title}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default Navbar
