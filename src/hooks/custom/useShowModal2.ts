import { useCallback } from 'react'
import _ from 'lodash'
import { eventCenter, useRouter } from '@tarojs/taro'
import { modalEventKey2, ModalState2 } from '@/layout/components/Modal2'

const useModal = () => {
  const router = useRouter()

  function showModal(options: ModalState2) {
    eventCenter.trigger(router.path + modalEventKey2, options)
  }

  const open = useCallback(showModal, [router.path])

  return [open, _.noop]
}

export interface IUseShowModalProps {
  mode: 'then' | 'thenCatch'
}

export interface IShowModalProps extends ModalState2 {}

function useShowModal2(
  p?: IUseShowModalProps
): Func1<IShowModalProps, Promise<boolean | 0 | void>> {
  const { mode = 'then' } = p || {}
  const [modal] = useModal()

  return props => {
    if (mode === 'thenCatch') {
      return new Promise((res, rej) => {
        modal({
          ...props,
          onConfirm: () => res(),
          onClose: () => rej(),
        })
      })
    }

    return new Promise(res => {
      modal({
        ...props,
        onConfirm: () => res(true),
        onClose: () => res(0),
      })
    })
  }
}
// 关闭当前页面弹窗
export function useHideModal2() {
  const router = useRouter()

  function closeModal(options?: ModalState2) {
    eventCenter.trigger(router.path + modalEventKey2, options, 'close')
  }
  const close = useCallback(closeModal, [router.path])
  return close
}

export default useShowModal2
