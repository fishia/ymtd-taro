import { JobType } from '@/def/job'

export enum ExpChannelType {
  NEWEST = 'C推最新排序',
  SEARCH = 'C搜综合排序',
  DIAMON1 = '2',
  DIAMON2 = '3',
  DIAMON3 = '8',
  DIAMON4 = '7',
  DIAMON5 = '14',
  HOME = '公司主页',
  HRHOME = 'HR主页',
  INTERTOME = '对我感兴趣',
  SEEME = '看过我',
  NEWPOSITION = '新职位',
  MYSEED = '我看过',
  COLLECT = '我的收藏',
  SERVICETAB = '业务标签聚合',
  SAMEPOSITION = '相似职位',
  DELIVER = '已投递',
}

export const ExpChannel = {
  [JobType.RECOMMAND]: 'C推综合排序',
  [ExpChannelType.NEWEST]: 'C推最新排序',
  [ExpChannelType.SEARCH]: 'C搜综合排序',
  [ExpChannelType.DIAMON1]: '金刚区_1',
  [ExpChannelType.DIAMON2]: '金刚区_2',
  [ExpChannelType.DIAMON3]: '金刚区_3',
  [ExpChannelType.DIAMON4]: '金刚区_4',
  [ExpChannelType.DIAMON5]: '聚合榜单',
  [ExpChannelType.HOME]: '公司主页',
  [ExpChannelType.HRHOME]: ' HR主页',
  [ExpChannelType.INTERTOME]: '对我感兴趣',
  [ExpChannelType.SEEME]: '看过我',
  [ExpChannelType.NEWPOSITION]: '新职位',
  [ExpChannelType.MYSEED]: '我看过',
  [ExpChannelType.COLLECT]: '我的收藏',
  [ExpChannelType.SERVICETAB]: '业务标签聚合',
  [ExpChannelType.SAMEPOSITION]: '相似职位',
  [JobType.PREDICTION]: 'C推冷启动（未登录）',
  [JobType.HOT]: 'C推冷启动（已登录）',
  [ExpChannelType.DELIVER]: '已投递',
}

// C推综合排序：释义 推荐简历列表的默认排序（算法）
// C推最新排序：释义 推荐简历列表的最新排序（算法）
// C搜综合排序：释义 搜索简历列表（算法）
// 金刚区_1：释义 小程序金刚区_聚名企----小程序独有
// 金刚区_2：释义 小程序金刚区_高匹配----小程序独有
// 金刚区_3：释义 小程序金刚区_有薪意----小程序独有
// 金刚区_4：释义 小程序金刚区_快入职----小程序独有
// 公司主页：释义 公司详情页在招职位
// HR主页：释义 hr在招职位页
// 发现公司_1：释义 发现公司_世界500强----小程序独有
// 发现公司_2：释义 发现公司_三甲医院----小程序独有
// 对我感兴趣：释义 互动_对我感兴趣tab
// 看过我：释义 互动_看过我tab
// 新职位：释义 互动_新职位tab
// 我看过：释义 个人中心_我看过
// 我的收藏：释义 个人中心_收藏
// 业务标签聚合：释义 聚合push的落地页面
// 相似职位：释义 职位详情页的相似职位列表
// C推冷启动（未登录）：释义 未登录状态下冷启动列表----小程序独有
// C推冷启动（已登录）：释义 已登录状态下冷启动列表----小程序独有
// 已投递：释义 个人中心投递列表
// 已沟通：释义 个人中心沟通列表
