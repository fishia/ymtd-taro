import { IList, IPager } from './common'

export enum ArticleStatus {
  TOP = 'top',
  HOT = 'hot',
  NORMAL = 'normal',
}

//文章列表
export interface IDiscover {
  id: number
  title: string
  type?: string
  cover_image: Array<string>
  updated_at: string
  cover_type: number
}

export interface IDiscoverList extends IList<IDiscover> {}

enum SearchType {
  m = 'm',
  es = 'es', //后端通过es查询
}
// 搜索文章查询条件
export interface IDiscoverSearch extends IPager {
  user_id?: number
  type?: SearchType | number
  page: number
}

//文章详情
export interface IDiscoverArticle {
  body: string
  title: string
  updated_at: string
  attachments?: IArticleAttachment[]
  appTitle?: string
  appLogo?: string
  mpTitle?: string
  mpPreviewImage?: string
}

export interface ICompanyLabel {
  companyLabel: string
  companyCount?: number
  companyJdCount?: number
  source?: unknown
}

// 文章附件
export interface IArticleAttachment {
  name: string
  size: number
  url: string
}
