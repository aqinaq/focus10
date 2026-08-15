import { useState } from 'react'
import { MailWarning } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/authContext'
import { useUI } from '../../context/uiContext'
import { useI18n } from '../../i18n/i18nContext'

/**
 * Email расталмағанын еске салады. Қолданбаны бөгемейді: растау керек
 * болатын жалғыз нәрсе — құпиясөзді ұмытқанда аккаунтты қайтару, ал ол әлі
 * қажет болған жоқ. Сондықтан бұл — тосқауыл емес, ескерту.
 */
export default function VerifyBanner() {
  const { user } = useAuth()
  const { notify } = useUI()
  const { t } = useI18n()
  const [sending, setSending] = useState(false)

  if (!user || user.email_verified !== false) return null

  const resend = async () => {
    setSending(true)
    try {
      await api.resendVerification()
      notify(t('verify.resent'))
    } catch (error) {
      notify(error.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm sm:mb-6 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900 dark:bg-amber-950/40">
      <p className="flex items-start gap-2.5 text-pretty text-amber-900 dark:text-amber-200">
        <MailWarning className="mt-0.5 size-4.5 shrink-0" />
        {t('verify.banner', { email: user.email })}
      </p>
      <button
        type="button"
        onClick={resend}
        disabled={sending}
        className="shrink-0 self-start rounded-full border border-amber-400 px-4 py-2 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100 disabled:opacity-60 sm:self-auto dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-900/40"
      >
        {t('verify.resend')}
      </button>
    </div>
  )
}
