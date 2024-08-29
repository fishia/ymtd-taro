import React from 'react'
import _ from 'lodash'
import './index.scss'
import { View } from '@tarojs/components'
import Button from '@/components/Button'
import ProtocolCheckBox from '@/components/ProtocolCheckBox'
import { ICompany } from '@/apis/shieldingCompany'

interface LimitCompanyCardProps {
  isSelectType: boolean
  detail: ICompany
  list?: ICompany[]
  setList?(e: ICompany[]): void
  isAllShow?: boolean // 未选中状态是否展示 “解除” 按钮
  showModal?: (shieldId?: number) => void
  disabled?: boolean
  changeValue?: string
}

const LimitCompanyCard: React.FC<LimitCompanyCardProps> = props => {
  const {
    detail,
    isSelectType,
    setList,
    list = [],
    isAllShow = false,
    showModal,
    disabled = false,
    changeValue,
  } = props
  const { companyName, checked, companyShortName, shieldId } = detail

  const checkedCard = (e: boolean) => {
    let arr = [...list]
    const index = _.findIndex(list, detail)
    arr[index].checked = e
    setList?.(arr)
  }

  const replaceCompanr = (companyNames: string, inputName: string) => {
    const str = companyNames.replace(inputName, `<text style="color: #4773FF" >${inputName}</text>`)
    const html = str

    return <View className="taro_html" dangerouslySetInnerHTML={{ __html: html }}></View>
  }

  return (
    <View className="LimitCompanyCard">
      {isSelectType ? (
        <>
          <ProtocolCheckBox
            isSheidCompany={!disabled}
            checked={checked || false}
            onCheck={!disabled ? checkedCard : () => {}}
            text={
              <View>
                <View
                  className={
                    isAllShow && disabled
                      ? 'companyNameAll'
                      : isSelectType
                      ? 'companyNameThree'
                      : 'companyName'
                  }
                >
                  {/* {companyName} */}
                  {changeValue ? replaceCompanr(companyName, changeValue) : companyName}
                </View>
                {isAllShow && companyShortName ? (
                  <View className="shortName">
                    简称：
                    {changeValue && companyShortName
                      ? replaceCompanr(companyShortName, changeValue)
                      : companyShortName}
                  </View>
                ) : null}
              </View>
            }
          />
          {disabled && !checked ? (
            <>
              {/* <View className="companyName">{title}</View> */}
              <Button className="relieveBtn" btnType="border" onClick={() => showModal?.(shieldId)}>
                解除
              </Button>
            </>
          ) : null}
        </>
      ) : (
        <>
          <View className="companyName">{companyName}</View>
          <Button className="relieveBtn" btnType="border" onClick={() => showModal?.(shieldId)}>
            解除
          </Button>
        </>
      )}
    </View>
  )
}

export default LimitCompanyCard
