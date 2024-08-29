import { Image } from '@tarojs/components'
import { noop, omit } from 'lodash'
import { FC } from 'react'
import { AtButton } from 'taro-ui'
import { AtButtonProps } from 'taro-ui/types/button'

import './index.scss'

interface IProps extends AtButtonProps {
  BtnText?: string
  imgUrl?: string
}

const ChatBottomNewBtn: FC<IProps> = props => {
  const { BtnText, imgUrl } = props

  return (
    <AtButton type="primary" {...omit(props, ['BtnText', 'imgUrl'])} className="chatNewBtnCss">
      {BtnText}
      {imgUrl && <Image className="imgBg" src={imgUrl}></Image>}
    </AtButton>
  )
}

export default ChatBottomNewBtn
