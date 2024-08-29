import React, { useEffect } from 'react'
import _ from 'lodash'
import R from 'ramda'
import { getCurrentPages, redirectTo, switchTab } from '@tarojs/taro'

import { linkToURL, isTabBar } from '@/utils/utils'
import { encodeURLParams } from '@/services/StringService'
import MainLayout from '@/layout/MainLayout'

const Redirect: React.FC = () => {
  useEffect(() => {
    const currentPage = _.last(getCurrentPages())!

    const newURLPath = _.trimEnd(linkToURL(currentPage.route), '?')
    const newURLParam = R.omit(['$taroTimestamp'], currentPage.options)

    const url = newURLPath + '?' + encodeURLParams(newURLParam)

    if (isTabBar(url)) {
      switchTab({ url })
      return
    }

    redirectTo({ url })
  }, [])

  return <MainLayout defaultLoading></MainLayout>
}

export default Redirect
