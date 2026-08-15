import { Loader2 } from 'lucide-react'
import { useI18n } from '../i18n/i18nContext'

/**
 * Жүктелу индикаторы. Күту ұзаққа кетсе (`waking`), себебін жазып қоямыз:
 * тегін хостингтегі сервер ұйықтап қалған, оны оятып жатырмыз. Түсініктемесіз
 * ұзақ айналған дөңгелек «сайт бұзылған» деп оқылады.
 */
export default function WakingLoader({ waking = false }) {
  const { t } = useI18n()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <Loader2 className="size-6 animate-spin text-brand-600 dark:text-brand-400" />
      <span className="sr-only">{t('common.loading')}</span>

      {waking && (
        <div role="status" className="max-w-sm">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {t('waking.title')}
          </p>
          <p className="mt-1.5 text-sm/6 text-pretty text-slate-500 dark:text-slate-400">
            {t('waking.body')}
          </p>
        </div>
      )}
    </div>
  )
}
