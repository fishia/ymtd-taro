import React, { useEffect, useRef, useState } from 'react'

import './index.scss'
import { View, Text } from '@tarojs/components'
import Empty from '@/components/Empty'
import noSearchCompany from '@/assets/imgs/empty/noSearchCompany.png'
import SelectLimitCompanyCard from '../components/SelectLimitCompanyCard'
import { IInputCurrent } from '@/def/common'
import { navigateBack, showToast, hideKeyboard } from '@tarojs/taro'
import SearchBar from '@/components/SearchBar'
import { FixedBottomPopup } from '@/components/Popup'
import { useFixedBottomPopup, useFixedBottomPupupRef } from '@/hooks/custom/usePopup'
import {
  fetchCompanyApi,
  restoreCompanyApi,
  searchCompanyApi,
  ShieldCompany,
  shieldCompanyApi,
} from '@/apis/shieldingCompany'
import _ from 'lodash'
import SubscriptionPopupCard from '@/weapp/pages/message/components/SubscriptionPopupCard'
import { sendHongBaoEvent } from '@/utils/dataRangers'

const Tips = () => (
  <>
    <View className="title">温馨提示</View>
    <View className="content">您可以通过以下方式搜索公司</View>
    <View className="content">公司全称：如“礼来（中国）研发有限公司”</View>
    <View className="content">公司简称：如“礼来”</View>
  </>
)

const AddShieldingCompany: React.FC = () => {
  const inputRef = useRef<IInputCurrent>(null)

  const [list, setList] = useState<ShieldCompany[]>([])

  const [inputValue, setInputValue] = useState<string>('')
  const [changeValue, setChangeValue] = useState<string>('')
  const [selectedList, setSelectedList] = useState<ShieldCompany[]>([])

  const [tipsVisible, setTipsVisible] = useState<Boolean>(false)
  const fixedBottomPopupRef = useFixedBottomPupupRef()
  const { open, close } = useFixedBottomPopup()

  // 发起模糊搜索请求
  const fetchSearch = (keyword: string) => {
    setInputValue(keyword)
    return fetchCompanyApi(keyword)
    // return fetchCollegesApi(keyword, page)
  }

  const searchCompany = (keyword: string) => {
    searchCompanyApi(keyword).then(res => {
      const arr = res.map(item => ({ ...item, checked: item.hasShield ? false : true }))
      setList(arr)
    })
  }

  //确认选择的值
  const fetchConfirm = (keyword: string) => {
    hideKeyboard()
    setChangeValue(keyword)
    searchCompany(keyword)
    inputRef.current?.setItems?.([])
  }

  const shieldingCompany = () => {
    sendHongBaoEvent('AddBlockClick')
    const arr = _.map(selectedList, item => {
      const { checked, shieldId, hasShield, companyShortName, ...other } = item
      return other
    })
    shieldCompanyApi(arr).then(navigateBack)
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

  const restoreCompany = (shieldId?: number) => {
    let arr: (number | undefined)[] = []
    shieldId !== undefined
      ? (arr = [shieldId])
      : (arr = _.map(_.filter(list, ['checked', true]), item => item.shieldId))

    restoreCompanyApi(arr)
      .then(close)
      .then(() => searchCompany(changeValue))
      .then(() => {
        showToast({
          title: '解除屏蔽成功',
          icon: 'none',
          duration: 2000,
        })
      })
  }

  const onClear = () => {
    setInputValue('')
    setChangeValue('')
    setTipsVisible(false)
  }

  useEffect(() => {
    // setList(dataSourse)
    setSelectedList(_.filter(list, ['checked', true]))
    if (list.length > 0) {
      setTipsVisible(false)
    }
  }, [list])

  useEffect(() => {
    setList([])
    setChangeValue('')
  }, [inputValue])

  return (
    <View className="add-shielding_company">
      <View style={{ padding: '0 16px' }}>
        <View className="picker-search__navbar">
          <SearchBar
            ref={inputRef}
            onSearch={fetchSearch}
            onConfrim={fetchConfirm}
            border={false}
            rightBtnText="搜索"
            placeholder="请输入要屏蔽的公司"
            showRightBtn={changeValue ? false : true}
            //onPushNewValueApi={ }
            onClear={onClear}
            renderNoListTips={() => setTipsVisible(true)}
            pagination
            isShowIcon={false}
          />
          <View className="picker-search__navbar-bottom" />
        </View>
      </View>
      {tipsVisible && (
        <Empty text="没有找到您搜索的公司" className="noCompany" picUrl={noSearchCompany} />
      )}
      {!inputValue && !changeValue ? <Tips /> : null}
      {list.length > 0 ? (
        <View className="selectContent">
          <SelectLimitCompanyCard
            list={list}
            setList={setList}
            isShowTitle={false}
            isAllShow
            showModal={showModal}
            tipText={
              <Text>
                所有与<Text className="selectText">{changeValue}</Text>相关的{_.size(selectedList)}
                家公司
              </Text>
            }
            btnText={`屏蔽所选公司（${_.size(selectedList)}）`}
            btnClick={shieldingCompany}
            changeValue={changeValue}
          />
        </View>
      ) : null}
      <FixedBottomPopup ref={fixedBottomPopupRef} />
    </View>
  )
}

export default AddShieldingCompany
