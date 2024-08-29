import { View, Text, Input, Button } from '@tarojs/components'
import c from 'classnames'
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'

import { checkSensitiveWordsApi } from '@/apis/resume'
import { IProps } from '@/def/common'
import { IAddKeywordParams, ICurrentKeyword } from '@/def/resume'
import useShowModal, { useHideModal } from '@/hooks/custom/useShowModal'
import useToast from '@/hooks/custom/useToast'

import CustomModalContent from '../CustomModalContent'

import './index.scss'

export interface CustomKeywordButtonProps extends IProps {
  text?: string
  function_type: string
  profile_job_id: number
  limit?: number
  disabled?: boolean
  checkSensitive?: boolean
  fetchAddKeywordApi: (data: IAddKeywordParams) => Promise<ICurrentKeyword>
  callBack?: (obj: ICurrentKeyword) => void
}

const CustomKeyword = (props, ref) => {
  const [keyword, setKeyword] = useState<string>()
  const [isError, setIsError] = useState<Boolean>(false)

  useImperativeHandle(ref, () => {
    return {
      setIsError,
      keyword,
    }
  })

  return (
    <View>
      <CustomModalContent
        content={
          <Input
            type="text"
            value={keyword}
            onInput={e => setKeyword(e.detail.value.trim())}
            placeholder="请输入新的职位关键词"
            focus
            maxlength={20}
            cursorSpacing={100}
            className={isError ? 'keyword-input-placeholder--strong' : 'keyword-input'}
          />
        }
      />
      <View
        className={c('hd-modal__action', {
          'hd-modal__action--no-cancel': true,
        })}
      >
        <Button className="hd-modal__action-cancel" onClick={props.handleCancel}>
          取消
        </Button>
        <Button className="hd-modal__action-confirm" onClick={props.handleConfirm}>
          确认
        </Button>
      </View>
    </View>
  )
}

const CustomContent = React.forwardRef(CustomKeyword)

const CustomKeywordButton: React.FC<CustomKeywordButtonProps> = props => {
  const {
    function_type,
    profile_job_id,
    disabled = false,
    limit = 5,
    text = '自定义',
    fetchAddKeywordApi,
    callBack,
    checkSensitive,
    className,
  } = props
  const showToast = useToast()
  const showModal = useShowModal({ mode: 'thenCatch' })
  const hideModal = useHideModal()
  const contentRef = useRef<{ keyword: string; setIsError: (isError: boolean) => void }>()

  //添加关键字
  const feedbackKeyword = useCallback(() => {
    showModal({
      className: 'new-theme__modal',
      title: '',
      closeOnClickOverlay: false,
      cancelText: '',
      confirmText: '',
      content: (
        <CustomContent
          ref={contentRef}
          handleCancel={() => {
            hideModal()
          }}
          handleConfirm={async () => {
            //根据keyword字符长度判断是否展示提示
            const { keyword, setIsError } = contentRef.current || {}

            if (keyword?.trim()) {
              if (keyword.length > 6) {
                showToast({ content: '关键词最多可输入6个字' })
              } else if (keyword.length < 2) {
                showToast({ content: '关键词至少输入2个字' })
              } else {
                if (checkSensitive) {
                  const pass = await checkSensitiveWordsApi(keyword)
                  if (!pass) {
                    showToast({ content: `关键词内容包含敏感词，请修改` })
                    return
                  }
                }

                fetchAddKeywordApi({ function_type, name: keyword, profile_job_id })
                  .then((res: ICurrentKeyword) => {
                    callBack && callBack(res)
                    hideModal()
                  })
                  .catch(() => {
                    showToast({ content: '创建失败' })
                    hideModal()
                  })
              }
            } else {
              setIsError && setIsError(true)
            }
          }}
        />
      ),
    })
    // .then(async () => {
    //   //根据keyword字符长度判断是否展示提示
    //   const { keyword, setIsError } = contentRef.current || {}

    //   if (keyword?.trim()) {
    //     if (keyword.length > 6) {
    //       showToast({ content: '关键词最多可输入6个字' })
    //       reMountModal()
    //     } else if (keyword.length < 2) {
    //       showToast({ content: '关键词至少输入2个字' })
    //       reMountModal()
    //     } else {
    //       if (checkSensitive) {
    //         const pass = await checkSensitiveWordsApi(keyword)
    //         if (!pass) {
    //           showToast({ content: `关键词内容包含敏感词，请修改` })
    //           reMountModal()
    //           return
    //         }
    //       }

    //       fetchAddKeywordApi({ function_type, name: keyword, profile_job_id })
    //         .then((res: ICurrentKeyword) => {
    //           callBack && callBack(res)
    //           hideModal()
    //         })
    //         .catch(() => {
    //           showToast({ content: '创建失败' })
    //           hideModal()
    //         })
    //     }
    //   } else {
    //     setIsError && setIsError(true)
    //   }
    // })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callBack])

  const handleClick = () => {
    const { setIsError } = contentRef.current || {}

    if (disabled) {
      showToast({ content: `最多支持选择 ${limit} 个` })

      return
    } else {
      setIsError && setIsError(false)
      feedbackKeyword()
    }
  }

  return (
    <View className={c('custom-keyword-button', className)} onClick={handleClick}>
      <Text className="custom-keyword-button__plus"> + </Text>
      {text}
    </View>
  )
}

export default CustomKeywordButton
