import { useEffect, useState } from 'react'

function useModalState(transitionDuration: number = 250) {
  const [modal, setModal] = useState(false)
  const [delayedModal, setDelayedModal] = useState(false)
  const [nextTickModal, setNextTickModal] = useState(false)

  useEffect(() => {
    const timer = setTimeout(
      () => void setDelayedModal(modal),
      modal ? transitionDuration : transitionDuration + 10
    )

    return () => void clearTimeout(timer)
  }, [modal, transitionDuration])

  useEffect(() => {
    const timer = setTimeout(() => void setNextTickModal(modal), 10)

    return () => void clearTimeout(timer)
  }, [modal])

  return { alive: modal || delayedModal, active: nextTickModal, setModal }
}

export { useModalState }

export default useModalState
