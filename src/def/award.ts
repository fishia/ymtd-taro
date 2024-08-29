export enum AwardType {
  TALEND = 1,
  COFFEE,
  OPTIMIZE,
  BOOK,
  INTERVIEW,
  PHONE,
}

export interface cardResult {
  title: string
  awardType: number // 奖品类别（0：回复奖励金、1：1888元现金、2：简历置顶专享、3：定制笔记本、4：定制台历、5：8.8元开门红包、6：大健康资讯行业白皮书）
  awardName: string
  status: number // 奖品状态（0：去领取 1：去使用 2: 使用中 3：已使用 4：已失效 5：去提现 ）
  worth: string
  oldPrice: string
  currentPrice: string
  id: number
  userId: number
  source: string //来源（新用户创建简历赠送、2024升职季抽奖获取、活动期间投递简历累积(满10元可提现)
  raffleDate: string
  raffleKind: string
  add_time: string
  dueTime: string
  bpsUrl: string // 白皮书url
}
