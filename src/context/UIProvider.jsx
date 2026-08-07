import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UIContext } from './uiContext'
import { useAuth } from './authContext'
import AuthModal from '../components/AuthModal'
import DemoModal from '../components/DemoModal'
import ToastStack from '../components/ToastStack'

const TOAST_MS = 4000

export function UIProvider({ children }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [auth, setAuth] = useState(null) // null | { mode, plan }
  const [demoOpen, setDemoOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  const timersRef = useRef(new Set())
  const nextIdRef = useRef(0)

  // Компонент жойылса, аспақ таймерлерді тазалаймыз
  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach(clearTimeout)
      timers.clear()
    }
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (message) => {
      const id = (nextIdRef.current += 1)
      setToasts((current) => [...current, { id, message }])

      const timer = setTimeout(() => {
        timersRef.current.delete(timer)
        dismiss(id)
      }, TOAST_MS)
      timersRef.current.add(timer)
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({
      // Кірген қолданушыға тіркелу формасын қайта көрсетудің мағынасы жоқ —
      // оны бірден қолданбаға жібереміз.
      openSignup: (plan) =>
        user ? navigate('/app') : setAuth({ mode: 'signup', plan }),
      openSignin: () => (user ? navigate('/app') : setAuth({ mode: 'signin' })),
      openDemo: () => setDemoOpen(true),
      notify,
    }),
    [notify, user, navigate],
  )

  const closeAuth = useCallback(() => setAuth(null), [])
  const closeDemo = useCallback(() => setDemoOpen(false), [])

  return (
    <UIContext.Provider value={value}>
      {children}

      <AuthModal
        open={auth !== null}
        mode={auth?.mode ?? 'signup'}
        plan={auth?.plan}
        onClose={closeAuth}
        onSwitchMode={(mode) => setAuth({ mode })}
      />
      <DemoModal open={demoOpen} onClose={closeDemo} />
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </UIContext.Provider>
  )
}
