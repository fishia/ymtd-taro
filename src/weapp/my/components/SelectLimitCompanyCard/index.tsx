import React, { useEffect, useState } from 'react'
import './index.scss'
import { View } from '@tarojs/components'
import LimitCompanyCard from '../LimitCompanyCard'
import Button from '@/components/Button'
import _ from 'lodash'
import ProtocolCheckBox from '@/components/ProtocolCheckBox'
import { ICompany } from '@/apis/shieldingCompany'

interface SelectCardProps {
  list: ICompany[]
  setList?(e: ICompany[]): void
  isShowTitle?: boolean
  isAllShow?: boolean // 未选中状态是否展示 “解除” 按钮
  tipText?: string | React.ReactNode
  btnText?: string
  btnClick: (e?: boolean) => void
  showModal?: () => void
  changeValue?: string
}

const SelectLimitCompanyCard: React.FC<SelectCardProps> = props => {
  const [isSelectType, setIsSelectType] = useState<boolean>(false)
  const [allChecked, setAllChecked] = useState(false)
  const {
    list = [],
    setList,
    isShowTitle = true,
    isAllShow = false,
    tipText = '全选所有公司',
    btnText,
    btnClick,
  } = props

  useEffect(() => {
    const isAllChecked = _.every(isAllShow ? _.filter(list, ['hasShield', false]) : list, [
      'checked',
      true,
    ])
    if (isAllChecked) {
      setAllChecked(true)
    } else {
      setAllChecked(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list])

  useEffect(() => {
    if (isAllShow) {
      setIsSelectType(true)
    }
  }, [isAllShow])

  const changeCheck = (e: boolean) => {
    const arr = list.map(item => {
      return { ...item, checked: item.hasShield ? false : e }
    })
    setList?.(arr)
  }

  const AddCompanyBtn = () => (
    <View className="bottoms" style={{ paddingTop: isSelectType ? 16 : 22 }}>
      {isSelectType ? (
        <ProtocolCheckBox
          isSheidCompany
          className="chooseAll"
          checked={allChecked}
          onCheck={changeCheck}
          text={<View className="allCompanyName">{tipText}</View>}
        />
      ) : null}

      <Button
        className="bottomBtn"
        disabled={isSelectType && !_.some(list, ['checked', true])}
        onClick={() => btnClick(isSelectType)}
      >
        {btnText ? btnText : isSelectType ? '解除屏蔽已选公司' : '添加屏蔽公司'}
      </Button>
    </View>
  )

  return (
    <>
      <View className="SelectLimitCompanyCard" style={{ paddingBottom: isSelectType ? 32 : 0 }}>
        {isShowTitle ? (
          <View className="titles">
            <View className="limited">已屏蔽{_.size(list)}家公司</View>
            <View
              className="manage"
              onClick={() => {
                setIsSelectType(!isSelectType)
                changeCheck(false)
              }}
            >
              {isSelectType ? '完成' : '批量管理'}
            </View>
          </View>
        ) : null}

        {list.map(item => (
          <LimitCompanyCard
            detail={item}
            isSelectType={isSelectType}
            {...props}
            key={item.shieldId}
            disabled={item.hasShield}
          />
        ))}
      </View>
      <AddCompanyBtn />
    </>
  )
}

export default SelectLimitCompanyCard
