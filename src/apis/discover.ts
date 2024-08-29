import Client from '@/apis/client'
import { IPager } from '@/def/common'
import { IDiscoverSearch, IDiscoverList, IDiscoverArticle, ICompanyLabel } from '@/def/discover'

// 搜索文章
export const listDiscoversApi = (data: IDiscoverSearch) =>
  Client<IDiscoverList>({ url: `/ymtd-user/api/articles`, data })

// 文章详情
export const detailArticleApi = (id: number, source: string) =>
  Client<IDiscoverArticle>({
    url: source === 'my' ? `/articles/${id}/show-collect` : `/ymtd-user/api/articles/${id}`,
  })

// 收藏文章 articleId
export const favoriteArticleApi = (id: number) =>
  Client({ url: `/ymtd-user/api/article/collect`, method: 'POST', data: { id } })

// 取消收藏文章 articleId
export const deleteArticleFavoriteApi = (id: number) =>
  Client({ url: `/ymtd-user/api/article/collect/${id}`, method: 'DELETE' })

// 获取公司标签
export const findCompanyLabelApi = () =>
  Client<ICompanyLabel[]>({ url: `/ymtd-capp/app/interact/findCompanyLabel` })

//根据标签获取公司和职位
export const findCompanyListApi = (params: IPager & { type: string }) =>
  Client({ url: `/ymtd-capp/interact/findCompanyList`, method: 'POST', data: params })
