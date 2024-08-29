import {
  getCurrentInstance,
  getStorageSync,
  getUpdateManager,
  removeStorageSync,
  showModal,
} from '@tarojs/taro'
import { Component } from 'react'

import { APP_OPENID_KEY, RONGCLOUD_APP_KEY, APP_TOKEN_FLAG } from '@/config'
import {
  initFetchAndSetUserInfo,
  tryJumpToNewLoginPage,
  registerOpenId,
  getOldUserToMyPage,
} from '@/services/AccountService'
import { initRongIM } from '@/services/IMService'
import { StoreProvider } from '@/store'
import { initDataRangers } from '@/utils/dataRangers'
import { jumpOldUrl } from '@/utils/utils'

import './app.scss'

require('../src/utils/encodeDecoder.js')

// 初始化融云
initRongIM(RONGCLOUD_APP_KEY)

if (process.env.ENV === 'production' || process.env.DEBUG_REPORT === 'on') {
  initDataRangers()
}

/*
 * sop1: 打开小程序，简历不完善需要创建简历
 * sop2: 打开后老用户，没有登录去创建简历
 * 一下路由不走上面sop的
 */
const sopBlackList = [
  'weapp/resume/app-upload-resume/index',
  'weapp/resume/app-upload-resume-file/index',
  'weapp/general/webview/index',
  'weapp/general/infoStation/index',
]
const isSopBlackListFn = path => {
  if (path) {
    return sopBlackList.includes(path)
  }
  return false
}

class App extends Component {
  onPageNotFound({ path }) {
    jumpOldUrl(path)
  }

  onLaunch(current) {
    console.log(current);
    
    removeStorageSync(APP_OPENID_KEY)
    // 小程序更新管理
    const updateManager = getUpdateManager()
    updateManager.onCheckForUpdate(res => {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(() => {
          showModal({
            title: '更新提示',
            content: '新版本已经准备好，点击确定以更新',
            complete: void updateManager.applyUpdate(),
            showCancel: false,
          })
        })
      }
    })

    if (!isSopBlackListFn(current?.path) && getStorageSync(APP_TOKEN_FLAG)) {
      initFetchAndSetUserInfo()
    } else {
      tryJumpToNewLoginPage()
    }
  }

  componentDidShow() {
    const current = getCurrentInstance().router

    if (!isSopBlackListFn(current?.path)) {
      registerOpenId().then(openId => {
        !getStorageSync(APP_TOKEN_FLAG) && getOldUserToMyPage(openId)
      })
    }
  }

  render() {
    return <StoreProvider>{this.props.children}</StoreProvider>
  }
}

export default App
