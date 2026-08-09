import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { UIProvider } from './context/UIProvider'
import { I18nProvider } from './i18n/I18nProvider'
import ErrorBoundary from './components/ErrorBoundary'
import RequireAuth from './components/RequireAuth'
import SkipLink from './components/SkipLink'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import SettingsPage from './pages/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    // I18nProvider — ең сыртта: ErrorBoundary-дің өз мәтіні де аударылады,
    // ал қате шыққанда контекст оған қолжетімді болуы керек.
    <I18nProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            {/* UIProvider ішіндегі модальдар навигация жасайды, сондықтан ол
                Router-дің ішінде тұруы керек. */}
            <UIProvider>
              <SkipLink />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route
                  path="/app"
                  element={
                    <RequireAuth>
                      <Dashboard />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/app/settings"
                  element={
                    <RequireAuth>
                      <SettingsPage />
                    </RequireAuth>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </UIProvider>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </I18nProvider>
  )
}
