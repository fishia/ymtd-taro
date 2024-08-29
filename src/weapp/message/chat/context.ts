import { createContext, useContext } from 'react'

import { IChatContext, IChatExchangeStatus, IMRoleType, MemberLevel } from '@/def/message'

const ChatContext = createContext<IChatContext>({
  chat_id: 0,
  hr_id: 0,
  jd_id: 0,
  hr_name: '',
  hr_avatar: '',
  company_name: '',
  user_id: 0,
  self_avatar: '',
  hr_last_read_time: 0,
  initiator: IMRoleType.HR,
  remain_msg_times: 10,
  phone_status: IChatExchangeStatus.ENABLE,
  profile_status: IChatExchangeStatus.ENABLE,
  wechat_status: IChatExchangeStatus.ENABLE,
  requestProfileStatus: IChatExchangeStatus.ENABLE,
  is_profile_applied: false,
  md_profile_id: '',
  jd_name: '',
  is_priority_jd: 0,
  onlineJdNum: 0,
  is_free: MemberLevel.NORMAL,
  onClickExchangePhone: () => Promise.resolve(false),
  onClickSendResume: () => Promise.resolve(false),
  onClickSendProfileFile: () => Promise.resolve(false),
  submitExchangeRequest: () => Promise.resolve(),
  confirmSendProfileFile: () => Promise.resolve(false),
  onClickExchangeWechat: () => Promise.resolve(false),
  isActive: 0,
})

export default ChatContext

export function useChatContext(): IChatContext {
  return useContext<IChatContext>(ChatContext)
}
