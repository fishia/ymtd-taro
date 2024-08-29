import { View } from '@tarojs/components'

import { IProps } from '@/def/common'
import { ICompany } from '@/def/job'
import Company from '@/weapp/job/components/Company'

import './index.scss'

export interface ISimpleCompanyCard extends IProps {
  companyData: ICompany
}

const prefixCls = 'active-companyCard'
const SimpleCompanyCard: React.FC<ISimpleCompanyCard> = props => {
  const { className, companyData } = props
  return (
    <View className={`${prefixCls} ${className}`}>
      <Company detail data={companyData} isLink={false} />
    </View>
  )
}

export default SimpleCompanyCard
