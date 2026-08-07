import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/authContext'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()

  // Сессия тексерілгенше шешім қабылдамаймыз — әйтпесе бет жаңартқанда
  // кірген қолданушы бір сәтке лендингке лақтырылып кетеді.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-brand-600" />
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />

  return children
}
