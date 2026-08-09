import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import useScrollLock from '../hooks/useScrollLock'
import { useI18n } from '../i18n/i18nContext'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Қайта қолданылатын модаль: Escape, backdrop-қа басу, скролл құлпы,
 * фокус тұзағы (Tab модальдан шықпайды) және жабылғанда фокусты қайтару.
 */
export default function Modal({ open, onClose, label, children, size = 'max-w-md' }) {
  const { t } = useI18n()
  const panelRef = useRef(null)
  const restoreRef = useRef(null)

  useScrollLock(open)

  useEffect(() => {
    if (!open) return

    restoreRef.current = document.activeElement

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return

      const nodes = Array.from(panelRef.current.querySelectorAll(FOCUSABLE))
      if (nodes.length === 0) return

      const first = nodes[0]
      const last = nodes[nodes.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    const focusTimer = setTimeout(() => {
      const target =
        panelRef.current?.querySelector('[data-autofocus]') ?? panelRef.current
      target?.focus()
    }, 0)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      clearTimeout(focusTimer)
      restoreRef.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        // dvh — мобиль браузердің адрес жолағы жиналып-жазылғанда да
        // модаль экраннан аспауы үшін. overscroll-contain — ішіндегі скролл
        // соңына жеткенде артындағы бетке «өтіп кетпеуі» үшін.
        // Төменгі padding iPhone-ның үй жолағының астына түсіп кетпейді.
        className={`relative max-h-[92dvh] w-full ${size} overflow-y-auto overscroll-contain rounded-t-3xl bg-white p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl outline-none sm:rounded-3xl sm:p-8 sm:pb-8`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="absolute top-3 right-3 rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:top-4 sm:right-4 sm:p-2"
        >
          <X className="size-5" />
        </button>

        {children}
      </div>
    </div>
  )
}
