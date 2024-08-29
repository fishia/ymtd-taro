import { MessageDirection } from '@rongcloud/imlib-v4'
import { FC, ReactNode } from 'react'

import {
  IMessageItem,
  IMRoleType,
  INewOnlineNoticeMessage,
  IVerifyNotice,
  MessageType,
} from '@/def/message'

import ExchangePhoneRequest from '../ExchangePhoneRequest'
import AgreeExchangePhone from '../ExchangePhoneRequest/Agree'
import ExchangeWechatRequest from '../ExchangeWechatRequest'
import AgreeExchangeWechat from '../ExchangeWechatRequest/Agree'
import JobCardMessage, { IJobCardMessageProps } from '../JobCardMessage'
import NotificationMessage, {
  displayNotification,
  INotificationMessageProps,
} from '../NotificationMessage'
import SendProfileFileRequest from '../SendProfileFileRequest'
import SendProfileFileDisableNotification from '../SendProfileFileRequest/DisableNotification'
import SendResumeRequest from '../SendResumeRequest'
import AgreeSendResume from '../SendResumeRequest/Agree'
import SendResumeTipsCard from '../SendResumeTipsCard'
import SwitchJobNotification, { ISwitchJobNotificationProps } from '../SwitchJobNotification'
import TextMessage, { ITextMessageProps } from '../TextMessage'

interface IMessageDisplay {
  chatDisplay: Nullable<FC<IMessageItem>>
  listDisplayText: Func1<IMessageItem, ReactNode>
}

const MessageDisplayMap: Record<MessageType, Nullable<IMessageDisplay>> = {
  [MessageType.TEXT_MESSAGE]: {
    chatDisplay: TextMessage,
    listDisplayText: (message: ITextMessageProps) => message.content.content || '',
  },

  [MessageType.INFO_NOTICE]: {
    chatDisplay: NotificationMessage,
    listDisplayText: (message: INotificationMessageProps) => message.content.message || '',
  },

  [MessageType.VERIFY_NOTICE]: {
    chatDisplay: null,
    listDisplayText: (message: IVerifyNotice) => `[发送失败] ${message.content.messageText}`,
  },

  [MessageType.JOB_CARD]: {
    chatDisplay: JobCardMessage,
    listDisplayText: (message: IJobCardMessageProps) =>
      `正在沟通【${message.content.jd_name}】职位`,
  },

  [MessageType.SWITCH_JOB]: {
    chatDisplay: SwitchJobNotification,
    listDisplayText: (message: ISwitchJobNotificationProps) =>
      message.content.initiator === IMRoleType.HR
        ? '对方更换了和您沟通的职位'
        : '您更换了和对方沟通的职位',
  },

  [MessageType.ONLINE_NOTICE]: {
    chatDisplay: displayNotification('该职位已重新上线'),
    listDisplayText: () => '该职位已重新上线',
  },

  [MessageType.OFFLINE_NOTICE]: {
    chatDisplay: displayNotification('当前沟通的职位已被下线'),
    listDisplayText: () => '当前沟通的职位已被下线',
  },

  [MessageType.NEW_ONLINE_NOTICE]: {
    chatDisplay: (message: INewOnlineNoticeMessage) =>
      displayNotification(`对方已上线职位：${message.content.jdName}`)(message),
    listDisplayText: (message: INewOnlineNoticeMessage) =>
      `对方已上线职位：${message.content.jdName}`,
  },

  [MessageType.EXCHANGE_PHONE_REQUEST]: {
    chatDisplay: ExchangePhoneRequest,
    listDisplayText: message => {
      if (message.messageDirection === MessageDirection.RECEIVE) {
        return '对方希望与您交换联系方式'
      } else {
        return '您请求与对方交换电话'
      }
    },
  },

  [MessageType.EXCHANGE_PHONE_AGREE]: {
    chatDisplay: AgreeExchangePhone,
    listDisplayText: () => '对方已同意交换电话',
  },

  [MessageType.EXCHANGE_PHONE_DISAGREE]: {
    chatDisplay: message =>
      displayNotification(
        message.messageDirection === MessageDirection.RECEIVE
          ? '对方已拒绝交换电话'
          : '你已拒绝交换电话'
      )(message),
    listDisplayText: message =>
      message.messageDirection === MessageDirection.RECEIVE
        ? '对方已拒绝交换电话'
        : '你已拒绝交换电话',
  },

  [MessageType.EXCHANGE_PHONE_INVALID]: {
    chatDisplay: displayNotification('交换电话的申请已失效，请与对方沟通后重试'),
    listDisplayText: () => '交换电话的申请已失效，请与对方沟通后重试',
  },

  [MessageType.SEND_RESUME_REQUEST]: {
    chatDisplay: SendResumeRequest,
    listDisplayText: message =>
      message.messageDirection === MessageDirection.RECEIVE
        ? '对方想要一份您的简历'
        : '您请求向对方投递简历',
  },

  [MessageType.SEND_RESUME_AGREE]: {
    chatDisplay: AgreeSendResume,
    listDisplayText: () => '我已向你的职位投递了简历，期待回复',
  },

  [MessageType.SEND_RESUME_DISAGREE]: {
    chatDisplay: message =>
      displayNotification(
        message.messageDirection === MessageDirection.RECEIVE
          ? '对方已拒绝接收简历'
          : '你已拒绝投递邀请'
      )(message),
    listDisplayText: message =>
      message.messageDirection === MessageDirection.RECEIVE
        ? '对方已拒绝接收简历'
        : '你已拒绝投递邀请',
  },

  [MessageType.SEND_RESUME_INVALID]: {
    chatDisplay: displayNotification('发送简历的申请已失效，请与对方沟通后重试'),
    listDisplayText: () => '发送简历的申请已失效，请与对方沟通后重试',
  },

  [MessageType.SEND_RESUME_DIRECTLY]: {
    chatDisplay: AgreeSendResume,
    listDisplayText: () => '我已向你的职位投递了简历，期待回复',
  },

  [MessageType.DIRECT_APPLY_CARD]: {
    chatDisplay: SendResumeTipsCard,
    listDisplayText: () => '您可以直接发送简历',
  },

  [MessageType.SEND_PROFILE_FILE_REQUEST]: {
    chatDisplay: SendProfileFileRequest,
    listDisplayText: () => '我期待得到你的简历，请回复',
  },

  [MessageType.SEND_PROFILE_FILE_AGREE]: {
    chatDisplay: displayNotification('你的完整简历已发送给对方'),
    listDisplayText: () => '我已同意发送完整简历，请查看',
  },

  [MessageType.SEND_PROFILE_FILE_DISAGREE]: {
    chatDisplay: displayNotification('你已拒绝发送完整简历给对方'),
    listDisplayText: () => '我已拒绝发送完整简历，请知晓',
  },

  [MessageType.SEND_PROFILE_FILE_INVALID]: {
    chatDisplay: SendProfileFileDisableNotification,
    listDisplayText: () => '你的职位已下线，我无法发送完整简历',
  },

  [MessageType.READ_RECEIPT]: null,
  [MessageType.EXPANSION_MESSAGE]: null,
  [MessageType.TOP_NOTICE]: null,
  [MessageType.SYNC_READ_STATUS]: null,
  [MessageType.JD_NAME]: null,
  [MessageType.EXCHANGE_WECHAT_REQUEST]: {
    chatDisplay: ExchangeWechatRequest,
    listDisplayText: message => '我申请和你交换微信，请查看',
  },

  [MessageType.EXCHANGE_WECHAT_AGREE]: {
    chatDisplay: AgreeExchangeWechat,
    listDisplayText: () => '我已同意交换微信，请查看',
  },

  [MessageType.EXCHANGE_WECHAT_DISAGREE]: {
    chatDisplay: message =>
      displayNotification(
        message.messageDirection === MessageDirection.RECEIVE
          ? '对方已拒绝交换微信，请知晓'
          : '你已拒绝对方的交换微信申请'
      )(message),
    listDisplayText: message => '我已拒绝交换微信，请知晓',
  },

  [MessageType.EXCHANGE_WECHAT_INVALID]: {
    chatDisplay: displayNotification('交换电话的申请已失效，请与对方沟通后重试'),
    listDisplayText: () => '交换电话的申请已失效，请与对方沟通后重试',
  },
}

export default MessageDisplayMap
