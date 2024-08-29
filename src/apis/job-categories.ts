import Client from '@/apis/client'
import { IJobCategory, IList, IPair, IRelational, TThinkJobCategory } from '@/def/common'

// 拉取职位类别
export async function fetchJobCategoriesApi(): Promise<IJobCategory[]> {
  return Client<IJobCategory[]>({
    url: '/ymtd-capp/app/profile/job/upgrade/functionTypeTree',
    cacheKey: 'com.ymtd.m.cache.job_categories.7-6-2-0',
  })
}

// 职位类别联想
export async function fetchThinkJobCategoriesApi(value: string): Promise<TThinkJobCategory[]> {
  return Client<TThinkJobCategory[]>({
    url: `/options/function-type-association?function_type_label=${encodeURIComponent(value)}`,
  }).then(res => (res || []).slice(0, 6))
}

// 职位名称联想
export async function fetchPositionThinkApi(value: string) {
  return Client<TThinkJobCategory[]>({
    url: `/options/function-type-association?function_type_label=${encodeURIComponent(value)}`,
  }).then(data => ({ list: (data || []).slice(0, 9), current: 1, total: 9 }))
}

// 拉取学校
export async function fetchCollegesApi(college: string, page?: number): Promise<IList<IPair>> {
  return Client<IList<IRelational<'name_cn', string>>>({
    url: '/options/colleges-search',
    data: { college, page },
  }).then(data => ({ ...data, list: data.list.map(item => ({ id: item.id, name: item.name_cn })) }))
}

// 拉取专业
export async function fetchMajorsApi(major: string, page?: number): Promise<IList<IPair>> {
  return Client<IList<IRelational<'major', string>>>({
    url: '/options/majors-search',
    data: { major, page },
  }).then(data => ({ ...data, list: data.list.map(item => ({ id: item.id, name: item.major })) }))
}

// 拉取公司名联想
export async function fetchCompanyNameApi(companyName: string, page?: number): Promise<any> {
  return Client({
    url: '/ymtd-profile/shield/company/searchAssociation',
    data: { companyName, page },
  }).then(data => ({
    ...data,
    list: (data.list || []).slice(0, 6).map(item => ({
      id: item.companyName,
      name: item.companyName,
      companyFullName: item.companyFullName,
    })),
  }))
}
