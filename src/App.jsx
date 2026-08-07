import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { UIProvider } from './context/UIProvider'
import ErrorBoundary from './components/ErrorBoundary'
import RequireAuth from './components/RequireAuth'
import SkipLink from './components/SkipLink'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import SettingsPage from './pages/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  return (
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
  )
}
