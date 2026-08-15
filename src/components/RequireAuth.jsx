import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import WakingLoader from './WakingLoader'

export default function RequireAuth({ children }) {
  const { user, loading, waking } = useAuth()

  // Сессия тексерілгенше шешім қабылдамаймыз — әйтпесе бет жаңартқанда
  // кірген қолданушы бір сәтке лендингке лақтырылып кетеді.
  if (loading) return <WakingLoader waking={waking} />

  if (!user) return <Navigate to="/" replace />

  return children
}
