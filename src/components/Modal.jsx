import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import useScrollLock from '../hooks/useScrollLock'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Қайта қолданылатын модаль: Escape, backdrop-қа басу, скролл құлпы,
 * фокус тұзағы (Tab модальдан шықпайды) және жабылғанда фокусты қайтару.
 */
export default function Modal({ open, onClose, label, children, size = 'max-w-md' }) {
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
        className={`relative max-h-[92vh] w-full ${size} overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl outline-none sm:rounded-3xl sm:p-8`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Жабу"
          className="absolute top-4 right-4 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <X className="size-5" />
        </button>

        {children}
      </div>
    </div>
  )
}
