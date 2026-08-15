import { Component } from 'react'
import { RotateCcw, TriangleAlert } from 'lucide-react'
import { I18nContext } from '../i18n/i18nContext'
import { DEFAULT_LANG, translate } from '../i18n/messages'

/**
 * React-те қатені ұстаудың жалғыз жолы — класс компонент. Онсыз рендер
 * кезіндегі кез келген қате бүкіл бетті ақ экранға айналдырады.
 *
 * Хук шақыра алмайтындықтан аударманы `contextType` арқылы аламыз; контекст
 * бір себеппен жоқ болса, әдепкі тілге қайта ораламыз — қате беті ешқашан
 * мәтінсіз қалмауы керек.
 */
export default class ErrorBoundary extends Component {
  static contextType = I18nContext

  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    const t = this.context?.t ?? ((path) => translate(DEFAULT_LANG, path))
    console.error(t('errorBoundary.logged'), error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    const t = this.context?.t ?? ((path) => translate(DEFAULT_LANG, path))

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
            <TriangleAlert className="size-7 text-red-600 dark:text-red-400" />
          </span>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {t('errorBoundary.title')}
          </h1>
          <p className="mt-3 text-base/7 text-slate-600 dark:text-slate-400">
            {t('errorBoundary.body')}
          </p>

          {import.meta.env.DEV && (
            <pre className="mt-6 overflow-x-auto rounded-xl bg-slate-900 p-4 text-left text-xs text-slate-200 dark:bg-slate-950 dark:text-slate-300">
              {this.state.error.message}
            </pre>
          )}

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <RotateCcw className="size-4" />
            {t('errorBoundary.reload')}
          </button>
        </div>
      </div>
    )
  }
}
