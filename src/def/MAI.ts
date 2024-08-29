import { OSS_STATIC_HOST } from '@/config'
import { senceData } from '@/hooks/message/maiSocket'

export enum MaiInputBarBtnType {
  Input = 'input',
  Stop = 'stop',
  Refrash = 'refrash',
}

export enum MaiSourceType {
  TEXT = 'text', // 普通文本
  GREETING = 'greeting', // 招呼语
  GREETING_N = 'greeting_n', // 新版招呼语，卡片形式
  GUIDANCE = 'guidance', // 引导语
  TIP = 'tip', // 提示语
  CONCLUSION = 'conclusion', // 结束语
  EXTRA = 'extra', // 扩展消息
  PROFILE = 'profile', // 简历
  WORK = 'work', // 工作经历
  EDUCATION = 'education', // 校园经历
  GUIDANCE_PROFILE_MANUAL = 'profile_manual', // 引导语-简历其他创建方式
  GUIDANCE_IDENTITY = 'guidance_identity', // 引导语-身份确认
  GUIDANCE_WORK_MANUAL = 'work_manual', // 引导语-手动创建工作内容
  GUIDANCE_EDUCATION_MANUAL = 'education_manual', // 引导语-手动创建校园经历
  GUIDANCE_SEND_EXAMPLE_CMD = 'guidance_send_example_cmd', // 点击发送指令机器人文本
  EXAMPLE_CMD = 'example_cmd', // 点击发送指令用户文本
  EXAMPLE_PROFILE = 'example_profile', // 发送指令后收到的文本
  GUIDANCE_SEND_CMD = 'guidance_send_cmd', // 点击创建之旅机器人文本
  GUIDANCE_CMD_SELECT = 'guidance_cmd_select', // 点击创建之旅后机器人返回文本
  RECEIVE_AWARD = 'receive_award', // 领取奖励
}

// 静态Mai落地页
export enum MaiCardType {

  APPLY_RESUME = 'apply_resume', // 求完整简历
  QUALITY_POSITION = 'quality_position', // 精选优质职位
  AVOCATION_CARD = 'avocation_card', // 副业广告
}

const sendText = `${OSS_STATIC_HOST}/mp/MAI/sendText.png`
const openProfile = `${OSS_STATIC_HOST}/mp/MAI/openProfile.png`

export interface chatListProps {
  tCreated: string
  scene?: string
  pageSize?: number
}

export interface chatListResult {
  list: chatListItem[]
  hasMore: boolean
}

export interface chatListItem {
  code?: number
  uuid: string
  role: string
  type: MaiSourceType
  content: string
  extraContent: any
  status: string
  tcreated?: string
  stream?: boolean
  time?: string
}

export interface existsProfileRes {
  hasMaiProfile: boolean
  uuid: string
}

interface MaiSourceTypeDataProps {
  [key: string]: {
    firstShow: boolean // 是否首次展示
    showBtn: boolean // 是否展示通用底部按钮
    showAllContent: boolean // 是否一次性展示所有content
    isShowExitBtn?: boolean // 聊天下的额外按钮
    btnText?: string
    exitBtnText?: string
    usedDisabled?: boolean // 已使用状态是否为禁用，true是，false为消失状态
    clickContent?: string // 内容可被点击的文字
    exitBtnColor?: string
    showInputBar: boolean // 展示下方输入框
    sence?: string // 在哪个场景下可以点击
    btnBg?: string // 下方按钮的背景图，若果有，则默认真实有背景图的按钮
    showTitle?: boolean // 聊天卡片是否有title样式
    sendType?: string // 发送的type
    header?: string // 默认头像
    isNoApiRemoveBtn?: boolean // 是否不需要直接调接口删除对应按钮
  }
}

const userAvatar = `${OSS_STATIC_HOST}/mp/MAI/userHead.png`

export const fixedText =
  '【示例】我是张三，2023年毕业于苏州大学，药理学本科，现在想找一份苏州的OTC代表工作，期望薪资15K，肿瘤药方向'

export const MaiSourceTypeData: MaiSourceTypeDataProps = {
  [MaiSourceType.TEXT]: {
    firstShow: false, // 是否首次展示
    showBtn: false, // 是否展示通用底部按钮
    showAllContent: true, // 是否一次性展示所有content
    isShowExitBtn: false, // 聊天下的额外按钮
    showInputBar: true, // 展示下方输入框
    sence: senceData.PROFILE, // 在哪个场景下可以点击
  },
  [MaiSourceType.GREETING]: {
    firstShow: true,
    showBtn: false,
    showAllContent: true,
    isShowExitBtn: false,
    usedDisabled: false,
    showInputBar: true,
  },
  [MaiSourceType.GREETING_N]: {
    firstShow: true,
    showBtn: false,
    showAllContent: true,
    isShowExitBtn: false,
    usedDisabled: false,
    showInputBar: false,
  },
  [MaiSourceType.GUIDANCE]: {
    firstShow: false,
    showBtn: false,
    showAllContent: false,
    isShowExitBtn: false,
    showInputBar: true,
  },
  [MaiSourceType.TIP]: {
    firstShow: false,
    showBtn: false,
    showAllContent: false,
    isShowExitBtn: false,
    showInputBar: true,
  },
  [MaiSourceType.CONCLUSION]: {
    firstShow: true,
    showBtn: false,
    showAllContent: false,
    isShowExitBtn: false,
    showInputBar: true,
  },
  [MaiSourceType.EXTRA]: {
    firstShow: false,
    showBtn: false,
    showAllContent: false,
    isShowExitBtn: false,
    showInputBar: true,
  },
  [MaiSourceType.PROFILE]: {
    firstShow: false,
    showBtn: true,
    showAllContent: false,
    isShowExitBtn: true,
    showInputBar: true,
    btnText: '确认使用',
    exitBtnText: '手动修改',
    exitBtnColor: '#474C66',
    sence: senceData.PROFILE,
  },
  [MaiSourceType.WORK]: {
    firstShow: false,
    showBtn: true,
    showAllContent: false,
    isShowExitBtn: false,
    showInputBar: true,
    btnText: '确认使用',
    usedDisabled: true,
    sence: senceData.WORK,
  },
  [MaiSourceType.EDUCATION]: {
    firstShow: false,
    showBtn: true,
    showAllContent: false,
    isShowExitBtn: false,
    showInputBar: true,
    btnText: '确认使用',
    usedDisabled: true,
    sence: senceData.EDUCATION,
  },
  [MaiSourceType.GUIDANCE_PROFILE_MANUAL]: {
    firstShow: true,
    showBtn: false,
    showAllContent: false,
    isShowExitBtn: false,
    showInputBar: true,
  },
  [MaiSourceType.GUIDANCE_IDENTITY]: {
    firstShow: false,
    showBtn: true,
    showAllContent: true,
    isShowExitBtn: true,
    showInputBar: false,
    btnText: '我是学生',
    exitBtnText: '我是职场人',
    exitBtnColor: '#4256DC',
    sence: senceData.PROFILE,
  },
  [MaiSourceType.GUIDANCE_WORK_MANUAL]: {
    firstShow: true,
    showBtn: false,
    showAllContent: false,
    isShowExitBtn: false,
    showInputBar: true,
    clickContent: '手动填写工作内容',
    sence: senceData.WORK,
  },
  [MaiSourceType.GUIDANCE_EDUCATION_MANUAL]: {
    firstShow: true,
    showBtn: false,
    showAllContent: false,
    isShowExitBtn: false,
    showInputBar: true,
    clickContent: '手动填写校园经历',
    sence: senceData.EDUCATION,
  },
  [MaiSourceType.GUIDANCE_SEND_EXAMPLE_CMD]: {
    firstShow: true,
    showBtn: true,
    showAllContent: false,
    isShowExitBtn: false,
    showInputBar: false,
    sence: senceData.PROFILE,
    btnBg: sendText,
    header: userAvatar,
  },
  [MaiSourceType.EXAMPLE_CMD]: {
    firstShow: false,
    showBtn: false,
    showAllContent: false,
    isShowExitBtn: false,
    showInputBar: false,
    sendType: MaiSourceType.EXAMPLE_CMD,
    header: userAvatar,
  },
  [MaiSourceType.EXAMPLE_PROFILE]: {
    firstShow: false,
    showBtn: false,
    showAllContent: false,
    isShowExitBtn: false,
    showInputBar: false,
    showTitle: true,
    header: userAvatar,
  },
  [MaiSourceType.GUIDANCE_SEND_CMD]: {
    firstShow: true,
    showBtn: true,
    showAllContent: false,
    isShowExitBtn: false,
    showInputBar: false,
    sence: senceData.PROFILE,
    btnBg: openProfile,
    header: userAvatar,
  },
  [MaiSourceType.GUIDANCE_CMD_SELECT]: {
    firstShow: true,
    showBtn: true,
    showAllContent: false,
    isShowExitBtn: false,
    showInputBar: false,
    sence: senceData.PROFILE,
    showTitle: true,
    header: userAvatar,
    isNoApiRemoveBtn: true,
  },
}
