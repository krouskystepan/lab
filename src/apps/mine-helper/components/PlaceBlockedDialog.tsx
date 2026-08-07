import { useEffect, useRef } from 'react'
import { useI18n } from '../../../i18n'

interface PlaceBlockedDialogProps {
  message: string
  onClose: () => void
}

export function PlaceBlockedDialog({
  message,
  onClose
}: PlaceBlockedDialogProps) {
  const { t } = useI18n()
  const okRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    okRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-[rgba(8,12,16,0.62)] p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="place-blocked-title"
      aria-describedby="place-blocked-msg"
      onClick={onClose}
    >
      <div
        className="w-full max-w-88 rounded-md border border-danger/55 bg-panel px-4 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="place-blocked-title"
          className="m-0 text-[1.05rem] font-bold tracking-[-0.02em] text-[#ffc9c9]"
        >
          {t('block.title')}
        </h2>
        <p
          id="place-blocked-msg"
          className="mt-2 mb-0 text-[0.85rem] font-medium leading-[1.4] text-ink"
        >
          {message}
        </p>
        <div className="mt-3.5 flex justify-end">
          <button
            ref={okRef}
            type="button"
            className="cursor-pointer appearance-none rounded-sm border border-danger/55 bg-danger/20 px-3.5 py-[0.45rem] text-[0.8rem] font-bold text-[#ffc9c9] hover:bg-danger/30"
            onClick={onClose}
          >
            {t('block.ok')}
          </button>
        </div>
      </div>
    </div>
  )
}
