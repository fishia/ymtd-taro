import { View } from '@tarojs/components'
import { setNavigationBarTitle } from '@tarojs/taro'
import c from 'classnames'
import React, { useEffect, useState } from 'react'

import { IJobSearch, mpcFunctionTag } from '@/def/job'
import { useRouterParam } from '@/hooks/custom/useRouterParam'
import MainLayout from '@/layout/MainLayout'

import ZonesList from './compnents/ZonesList'

import './index.scss'

const Zones: React.FC = () => {
  const pageParam = useRouterParam()
  const type = pageParam.type ? +pageParam.type : 0
  const pageTitle = pageParam.title ? pageParam.title : '职位专区'
  const functionName = decodeURIComponent(pageParam?.functionName || '')
  const tabList = JSON.parse(
    decodeURIComponent(pageParam?.mpc_function_tags || '[]')
  ) as mpcFunctionTag[]

  const title = pageTitle.includes('%')
    ? unescape(decodeURIComponent(pageTitle).replace(/\\/g, '%'))
    : pageTitle

  const [jobFilters, setJobFilters] = useState<IJobSearch>({ page: 1, keyword: functionName })

  useEffect(() => {
    setNavigationBarTitle({ title })
  }, [title])

  //更新过滤项
  const updateJobFilters = obj => {
    setJobFilters({
      ...jobFilters,
      ...obj,
    })
  }

  return (
    <MainLayout className="zones-index">
      {tabList.length ? (
        <View className="zones-index__tabs">
          {tabList.map((item, i) => (
            <View
              className={c('zones-index__tabItem', {
                'tabItem--active': item.functionName === jobFilters.keyword,
              })}
              key={i}
              onClick={() => updateJobFilters({ keyword: item.functionName, page: 1 })}
            >
              {item.functionName}
            </View>
          ))}
        </View>
      ) : null}
      <ZonesList
        title={title}
        type={type}
        functionName={functionName}
        jobFilters={jobFilters}
        changeJobFilters={setJobFilters}
        className="zones-index"
      />
    </MainLayout>
  )
}

export default Zones
