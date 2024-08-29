import { noop } from 'lodash'
import { FC, ReactNode } from 'react'
import { AtButton } from 'taro-ui'
import { AtButtonProps } from 'taro-ui/types/button'

import './index.scss'

interface IProps {
  isShowExitBtn?: boolean
  ExitBtnProps?: AtButtonProps
  ExitBtnText?: string
  BtnProps?: AtButtonProps
  BtnText?: string | ReactNode
  onExitBtnClick?: (e) => void
  onBtnClick?: (e) => void
}

const ChatBottomBtn: FC<IProps> = props => {
  const {
    ExitBtnProps,
    BtnProps,
    isShowExitBtn = false,
    ExitBtnText = '手动修改',
    BtnText = '确认使用',
    onExitBtnClick = noop,
    onBtnClick = noop,
  } = props

  return (
    <>
      {isShowExitBtn && (
        <AtButton
          type="primary"
          className="chat-content-bottom-btn edit"
          onClick={onExitBtnClick}
          {...ExitBtnProps}
        >
          {ExitBtnText}
        </AtButton>
      )}

      <AtButton
        type="primary"
        className="chat-content-bottom-btn"
        onClick={onBtnClick}
        {...BtnProps}
      >
        {BtnText}
      </AtButton>
    </>
  )
}

export default ChatBottomBtn
