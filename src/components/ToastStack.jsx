import { Info, X } from 'lucide-react'
import { useI18n } from '../i18n/i18nContext'

export default function ToastStack({ toasts, onDismiss }) {
  const { t } = useI18n()

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-[70] flex flex-col items-center gap-2 px-4 sm:px-6"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-brand-400" />
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label={t('common.dismissToast')}
            className="-mt-0.5 -mr-1 rounded-md p-1 text-slate-400 transition-colors hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
