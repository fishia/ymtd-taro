import { eventCenter, useRouter } from '@tarojs/taro'
import _ from 'lodash'
import { useCallback } from 'react'

import { modalEventKey, ModalState } from '@/layout/components/Modal'

const useModal = () => {
  function showModal(options: ModalState) {
    eventCenter.trigger(modalEventKey, options)
  }

  const open = useCallback(showModal, [])

  return [open, _.noop]
}

export interface IUseShowModalProps {
  mode: 'then' | 'thenCatch'
}

export interface IShowModalProps extends ModalState {}

function useShowModal(p?: IUseShowModalProps): Func1<IShowModalProps, Promise<boolean | 0 | void>> {
  const { mode = 'then' } = p || {}
  const [modal] = useModal()

  return props => {
    if (mode === 'thenCatch') {
      return new Promise((res, rej) => {
        modal({
          onConfirm: () => res(),
          onCancel: () => rej(true),
          onClose: () => rej(false),
          ...props,
        })
      })
    }

    return new Promise(res => {
      modal({
        ...props,
        onConfirm: () => res(true),
        onCancel: () => res(false),
        onClose: () => res(0),
      })
    })
  }
}
// 关闭当前页面弹窗
export function useHideModal() {
  function closeModal(options?: ModalState) {
    eventCenter.trigger(modalEventKey, options, 'close')
  }
  const close = useCallback(closeModal, [])
  return close
}

export default useShowModal
