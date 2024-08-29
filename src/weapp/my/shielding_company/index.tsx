import React, { useState } from 'react'
import MainLayout from '@/layout/MainLayout'

import './index.scss'
import { View } from '@tarojs/components'
import Empty from '@/components/Empty'
import emptyImageUrl from '@/assets/imgs/empty/no-company.png'
import SelectLimitCompanyCard from '../components/SelectLimitCompanyCard'
import { FixedBottomPopup } from '@/components/Popup'
import { useFixedBottomPopup, useFixedBottomPupupRef } from '@/hooks/custom/usePopup'
import SubscriptionPopupCard from '@/weapp/pages/message/components/SubscriptionPopupCard'
import { fetchShieldingCompanyApi, ICompany, restoreCompanyApi } from '@/apis/shieldingCompany'
import Button from '@/components/Button'
import { navigateTo, useDidShow, showToast } from '@tarojs/taro'
import _ from 'lodash'
import { sendHongBaoEvent } from '@/utils/dataRangers'

export interface listProps {
  title: string
  checked: boolean
  id: number
}

const Title = () => (
  <>
    <View className="title">屏蔽公司</View>
    <View className="content">
      添加屏蔽公司后，这些公司无法在平台上查看您的简历，您的查看行为也不会告知对方
    </View>
  </>
)

const ShieldingCompany: React.FC = () => {
  const [list, setList] = useState<ICompany[]>([])
  const fixedBottomPopupRef = useFixedBottomPupupRef()
  const { open, close } = useFixedBottomPopup()

  // useEffect(() => {
  //   getCompanyList()
  //   // setList(dataSourse)
  // }, [])

  useDidShow(() => {
    getCompanyList()
  })

  const getCompanyList = () => {
    fetchShieldingCompanyApi().then(res => setList(res))
  }

  const showModal = (shieldId?: number) => {
    open({
      key: 'followwx',
      children: (
        <SubscriptionPopupCard
          title="温馨提示"
          primaryButtonText="解除屏蔽"
          subButtonText="取消"
          tipText="确定解除屏蔽已选公司？"
          onPrimaryButtonClick={() => restoreCompany(shieldId)}
          onSubButtonClick={close}
          className="shieldingCompany"
        />
      ),
    })
  }

  const btnClick = e => {
    if (e) {
      sendHongBaoEvent('UnblockClick', { is_block_company: true })
      showModal()
    } else {
      navigateTo({ url: '/weapp/my/add_shielding_company/index' })
    }
  }

  const restoreCompany = (shieldId?: number) => {
    sendHongBaoEvent('UnblockClick', { is_block_company: true })
    let arr: (number | undefined)[] = []
    shieldId
      ? (arr = [shieldId])
      : (arr = _.map(_.filter(list, ['checked', true]), item => item.shieldId))

    restoreCompanyApi(arr)
      .then(close)
      .then(getCompanyList)
      .then(() => {
        showToast({
          title: '解除屏蔽成功',
          icon: 'none',
          duration: 2000,
        })
      })
  }

  return (
    <MainLayout className="my-shielding_company">
      <Title />
      {list.length ? (
        <SelectLimitCompanyCard
          list={list}
          setList={setList}
          showModal={showModal}
          btnClick={btnClick}
        />
      ) : (
        <>
          <Empty text="暂无屏蔽公司" className="noCompany" picUrl={emptyImageUrl} />
          <View className="bottoms" style={{ paddingTop: 22 }}>
            <Button className="bottomBtn" onClick={() => btnClick(false)}>
              添加屏蔽公司
            </Button>
          </View>
        </>
      )}
      <FixedBottomPopup ref={fixedBottomPopupRef} />
    </MainLayout>
  )
}

export default ShieldingCompany
