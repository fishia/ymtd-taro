import MainLayout from '@/layout/MainLayout'
import { useState } from 'react'
import { AtTabs, AtTabsPane } from 'taro-ui'
import UserProtocol from './components/userProtocol'
import PrivacyProtocol from './components/privacyProtocol'
import './index.scss'
import { useRouterParam } from '@/hooks/custom/useRouterParam'

const tabList = [{ title: '医脉同道用户协议' }, { title: '用户隐私政策' }]

const Protocol = () => {
  const routerParams = useRouterParam()
  const seletecTabIndex = +routerParams?.current || 0
  const [current, setCurrent] = useState<number>(seletecTabIndex)
  return (
    <MainLayout navBarTitle="信用条款" className="my-protocol">
      <AtTabs current={current} tabList={tabList} onClick={setCurrent}>
        <AtTabsPane current={current} index={0}>
          <UserProtocol />
        </AtTabsPane>
        <AtTabsPane current={current} index={1}>
          <PrivacyProtocol />
        </AtTabsPane>
      </AtTabs>
    </MainLayout>
  )
}

export default Protocol
