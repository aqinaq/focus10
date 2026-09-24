import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import WakingLoader from './WakingLoader'

export default function RequireAuth({ children }) {
  const { user, loading, waking, startGuest } = useAuth()
  const [error, setError] = useState('')
  const starting = useRef(false)

  useEffect(() => {
    if (loading || user || starting.current) return
    starting.current = true
    startGuest().catch((cause) => {
      setError(cause.message)
      starting.current = false
    })
  }, [loading, user, startGuest])

  // Сессия тексерілгенше шешім қабылдамаймыз — әйтпесе бет жаңартқанда
  // кірген қолданушы бір сәтке лендингке лақтырылып кетеді.
  if (loading) return <WakingLoader waking={waking} />

  if (!user && error) return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <p role="alert" className="text-slate-700 dark:text-slate-200">{error}</p>
      <Link to="/" className="mt-6 inline-block text-brand-600">Focus10</Link>
    </main>
  )
  if (!user) return <WakingLoader waking={waking} />

  return children
}
