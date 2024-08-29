import { View } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'

import useToast from '@/hooks/custom/useToast'
import { sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import { useChatContext } from '../../chat/context'
import { displayNotification } from '../NotificationMessage'

import { ISendProfileFileRequestProps } from '.'
import './DisableNotification.scss'

export interface IDisableNotificationProps extends ISendProfileFileRequestProps {}

export default function SendProfileFileDisableNotification(props: IDisableNotificationProps) {
  const showToast = useToast()
  const { onlineJdNum, jd_id, md_profile_id } = useChatContext()

  const offlineJdNoticeClickHandler = () => {
    if (onlineJdNum > 0) {
      navigateTo({ url: `/weapp/job/hr-job/index?id=${props.hr_id}` })
    } else {
      showToast({ content: '暂无可投递的职位，我们会通知招聘者发布新职位，请耐心等待' })
    }

    sendDataRangersEventWithUrl('ExchangePosition', {
      button_name: '切换职位',
      jd_id,
      cv_id: md_profile_id,
    })
  }

  return displayNotification(
    <View className="message-item__notice__send-profile-file-request__disable">
      沟通中的职位已下线，无法发送完整简历，你可
      <View
        className="message-item__notice__send-profile-file-request__disable__hl"
        onClick={offlineJdNoticeClickHandler}
      >
        切换职位
      </View>
      发送简历
    </View>
  )(props)
}
