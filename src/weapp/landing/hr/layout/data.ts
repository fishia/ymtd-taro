export interface ICompany {
  logo: string
  name: string
  anonymousName?: string
  job: string
  salary: string
  tags: string[]
}
export const companyData: ICompany[] = [
  {
    logo: require('../../imgs/company/msd.png'),
    name: '默沙东',
    anonymousName: '某全球制药巨头',
    job: '医学联络官MSL免疫',
    salary: '20-40k',
    tags: ['创新药', '核心市场', '对接KA'],
  },
  {
    logo: require('../../imgs/company/snf.png'),
    name: '赛诺菲',
    anonymousName: '某全球制药巨头',
    job: '医学信息沟通专员',
    salary: '15-30k',
    tags: ['外资', 'OTC', '学术推广'],
  },
  {
    logo: require('../../imgs/company/bjsz.png'),
    name: '百济神州',
    anonymousName: '某国内创新药企',
    job: '细胞培养工程师',
    salary: '10-15k',
    tags: ['创新药研发', '上游', '靶向药'],
  },
  {
    logo: require('../../imgs/company/bdyy.png'),
    name: '贝达药业',
    anonymousName: '某国内创新药企',
    job: '蛋白纯化研究员',
    salary: '10-15k',
    tags: ['创新药研发', '下游', '靶向药'],
  },
  {
    logo: require('../../imgs/company/cysw.png'),
    name: '创元生物',
    anonymousName: '某CXO生物医药公司',
    job: '研发中心负责人',
    salary: '60-100k',
    tags: ['创新药', '化学药', '新药注册'],
  },
  {
    logo: require('../../imgs/company/sld.png'),
    name: '思路迪',
    anonymousName: '某智能医疗器械公司',
    job: '分子诊断试剂高级研究员（PCR）',
    salary: '20-22k',
    tags: ['创新药企', '分子诊断', '医药设备'],
  },
  {
    logo: require('../../imgs/company/wcyy.png'),
    name: '卫材药业',
    anonymousName: '某大型外资制药公司',
    job: 'QA工程师',
    salary: '10-17k',
    tags: ['外资', 'QA', 'GMP'],
  },
  {
    logo: require('../../imgs/company/hszy.png'),
    name: '翰森制药',
    anonymousName: '某创新生物医药公司',
    job: 'QC—液相质量工程师',
    salary: '面议',
    tags: ['下游', '单抗', 'QC'],
  },
  {
    logo: require('../../imgs/company/ymsj.png'),
    name: '药明生基',
    anonymousName: '某细胞和基因疗法CTDMO',
    job: '上游工程师',
    salary: '10-20k',
    tags: ['创新药企', '细胞基因治疗', 'GMP'],
  },
  {
    logo: require('../../imgs/company/fhhl.png'),
    name: '复宏汉霖',
    anonymousName: '某创新生物制药公司',
    job: '生产支持工程师-制剂',
    salary: '15-18k',
    tags: ['免疫', '生物药', '制剂'],
  },
  {
    logo: require('../../imgs/company/plyy.png'),
    name: '普莱医药',
    anonymousName: '某高科技生物医药企业',
    job: '药物代谢研究员',
    salary: '9-18k',
    tags: ['靶向药', '化药', '专利申请'],
  },
  {
    logo: require('../../imgs/company/ynwsw.png'),
    name: '优宁维生物',
    anonymousName: '某国内抗体供应商',
    job: '蛋白研发主管',
    salary: '18-23k',
    tags: ['免疫', '化药', 'CMC'],
  },
]

export interface IJob extends ICompany {
  time: string
  school: string
}

export const jobData: IJob[] = [
  {
    logo: require('../../imgs/avatar/ynjj.png'),
    name: '王女士',
    time: '3年',
    school: '硕士',
    salary: '15-20k',
    job: '药物化学研究员',
    tags: ['化药', '下游', '药物合成'],
  },
  {
    logo: require('../../imgs/avatar/avatar7.png'),
    name: '张先生',
    time: '5年',
    school: '博士',
    salary: '20-25k',
    job: '药理研究员',
    tags: ['创新药研发', '肿瘤', '上游'],
  },
  {
    logo: require('../../imgs/avatar/avatar5.png'),
    name: '杨女士',
    time: '3年',
    school: '硕士',
    salary: '15-20k',
    job: '药物安全专员',
    tags: ['执业药师', 'GCP', '肿瘤'],
  },
  {
    logo: require('../../imgs/avatar/avatar6.png'),
    name: '周先生',
    time: '3年',
    school: '硕士',
    salary: '10-15k',
    job: '理化分析研究员',
    tags: ['创新药研发', '上游', 'SOP'],
  },
  {
    logo: require('../../imgs/avatar/avatar8.png'),
    name: '孙先生',
    time: '4年',
    school: '博士',
    salary: '25k以上',
    job: '上游工艺开发',
    tags: ['抗体发现', '上游', '生物药'],
  },
  {
    logo: require('../../imgs/avatar/avatar12.png'),
    name: '毛女士',
    time: '5年',
    school: '博士',
    salary: '15-25k',
    job: '工艺工程师',
    tags: ['单抗', '下游', '工艺验证'],
  },
  {
    logo: require('../../imgs/avatar/avatar10.png'),
    name: '金女士',
    time: '6年',
    school: '硕士',
    salary: '15-20k',
    job: '合成研究员',
    tags: ['化药', '下游', '仿制药申请'],
  },
  {
    logo: require('../../imgs/avatar/avatar9.png'),
    name: '赵先生',
    time: '5年',
    school: '硕士',
    salary: '10-20k',
    job: '化学分析测试员',
    tags: ['化药', '设备验证', 'ISO9001'],
  },
  {
    logo: require('../../imgs/avatar/avatar11.png'),
    name: '冯先生',
    time: '5年',
    school: '硕士',
    salary: '10-15k',
    job: '研发工程师',
    tags: ['体外诊断', '手术器械研究', '工艺验证'],
  },
  {
    logo: require('../../imgs/avatar/avatar2.png'),
    name: '蒋先生',
    time: '5年',
    school: '硕士',
    salary: '10-15k',
    job: '医药信息沟通员',
    tags: ['抗肿瘤药', '学术推广', '处方药'],
  },
  {
    logo: require('../../imgs/avatar/avatar3.png'),
    name: '陈先生',
    time: '10年',
    school: '硕士',
    salary: '10-15k',
    job: '资深客户专员',
    tags: ['器械耗材', '核心市场', '骨科'],
  },
  {
    logo: require('../../imgs/avatar/avatar4.png'),
    name: '邱女士',
    time: '6年',
    school: '本科',
    salary: '10-15k',
    job: '医药代表',
    tags: ['非处方药', '进集采', '普药'],
  },
]

export const randomManAvatar = [
  require('../../imgs/avatar/manBusiness.svg'),
  require('../../imgs/avatar/manClassic.svg'),
  require('../../imgs/avatar/manFreely.svg'),
  require('../../imgs/avatar/manLively.svg'),
]

export const randomwoManAvatar = [
  require('../../imgs/avatar/womanCapable.svg'),
  require('../../imgs/avatar/womanElegance.svg'),
  require('../../imgs/avatar/womanGentle.svg'),
  require('../../imgs/avatar/womanLovely.svg'),
]

export const randomIntNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min)

export const randomAvatar = (name: string) => {
  const isMan = name.includes('先生')
  return isMan
    ? randomManAvatar[randomIntNumber(0, randomManAvatar.length - 1)]
    : randomwoManAvatar[randomIntNumber(0, randomwoManAvatar.length - 1)]
}
