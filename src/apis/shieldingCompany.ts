import { showLoading, showToast, hideLoading } from '@tarojs/taro'

import { IList } from '@/def/common'

import Client from './client'

export interface ICompany {
  companyName: string
  shieldId?: number
  companyId: number
  hasShield?: boolean
  companyShortName?: string
  checked?: boolean
}

export interface ShieldCompany extends ICompany {
  qiXinCompanyCreditNo?: any
  qiXinCompanyId?: any
  qiXinCompanyOperName?: any
  qiXinCompanyRegNo?: any
  qiXinCompanyStartDate?: any
  qiXinCompanyStatus?: any
}

// 用户已屏蔽公司列表
export function fetchShieldingCompanyApi(): Promise<ICompany[]> {
  showLoading({ title: '加载中...' })

  return Client({ url: '/ymtd-profile/shield/company/shieldList' })
    .then(res => res.map(item => ({ ...item, checked: false })))
    .catch(res => void showToast({ title: res.errorMessage, icon: 'none' }))
    .finally(() => void hideLoading())
}

// 公司名称联想
export function fetchCompanyApi(companyName: string): Promise<IList<any>> {
  showLoading({ title: '加载中...' })

  return Client({ url: '/ymtd-profile/shield/company/searchAssociation', data: { companyName } })
    .then(data => ({
      ...data,
      list: data.list.map(item => ({
        id: item.id,
        name: item.companyName,
        companyFullName: item.companyFullName,
      })),
    }))
    .catch(res => void showToast({ title: res.errorMessage, icon: 'none' }))
    .finally(() => void hideLoading())
}

// 公司名称搜索
export function searchCompanyApi(companyName: string): Promise<ShieldCompany[]> {
  showLoading({ title: '加载中...' })

  return Client({ url: '/ymtd-profile/shield/company/searchList', data: { companyName } })
    .catch(res => void showToast({ title: res.errorMessage, icon: 'none' }))
    .finally(() => void hideLoading())
}

// 屏蔽公司
export const shieldCompanyApi = (shieldList: ShieldCompany[]) => {
  showLoading({ title: '加载中...' })

  return Client({
    url: '/ymtd-profile/shield/company/action',
    method: 'POST',
    data: { shieldList },
  })
    .catch(res => void showToast({ title: res.errorMessage, icon: 'none' }))
    .finally(() => void hideLoading())
}

// 解除已屏蔽公司
export const restoreCompanyApi = (shieldIdList: (number | undefined)[]) => {
  showLoading({ title: '加载中...' })

  return Client({
    url: '/ymtd-profile/shield/company/restore',
    method: 'PUT',
    data: { shieldIdList },
  })
    .catch(res => void showToast({ title: res.errorMessage, icon: 'none' }))
    .finally(() => void hideLoading())
}
