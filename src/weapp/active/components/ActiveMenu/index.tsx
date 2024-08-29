import { View } from '@tarojs/components'

import { IProps } from '@/def/common'

import './index.scss'

export interface IActiveMenu extends IProps {
  companyNum?: number
	jobNum?: number
	displayPattern?: number // 1：公司+职位  2：职位列表
}

const prefixCls = 'active-Menu'
const ActiveMenu: React.FC<IActiveMenu> = props => {
  const { className, companyNum = 0, jobNum = 0, displayPattern } = props
  return (
    <View className={`${prefixCls} ${className}`}>
			{ displayPattern!==1 ? <View className={`${prefixCls}__item`}>
				<View className={`${prefixCls}__item__value`}>{companyNum}家</View>
				<View className={`${prefixCls}__item__description`}>参与公司</View>
			</View> : null}
      <View className={`${prefixCls}__item`}>
        <View className={`${prefixCls}__item__value`}>{jobNum}个</View>
        <View className={`${prefixCls}__item__description`}>招聘职位</View>
      </View>
    </View>
  )
}

export default ActiveMenu
