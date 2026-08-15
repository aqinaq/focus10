import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import { api, setUnauthorizedHandler } from '../lib/api'

/**
 * Тегін хостингте сервер белсенділік болмаса ұйықтап қалады да, келесі
 * сұраныс оны оятады — ол 30–60 секундқа созылуы мүмкін. Осы шамадан ұзаққа
 * кетсе, қолданушыға не болып жатқанын түсіндіреміз: айналып тұрған
 * дөңгелектің өзі «бұзылған» деп оқылады.
 */
const WAKING_MS = 2500

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [waking, setWaking] = useState(false)

  // Сессия біткенде кез келген сұраныс 401 қайтарады. Қолданушыны күйден
  // шығарамыз да, RequireAuth оны лендингке апарады — ескірген бетте
  // қалып қоймауы үшін.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
    return () => setUnauthorizedHandler(null)
  }, [])

  // Бет жаңартылғанда сессия cookie бойынша қолданушыны қалпына келтіреміз
  useEffect(() => {
    let cancelled = false

    const slow = setTimeout(() => {
      if (!cancelled) setWaking(true)
    }, WAKING_MS)

    api
      .me()
      .then((data) => {
        if (!cancelled) setUser(data.user)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        clearTimeout(slow)
        if (!cancelled) {
          setWaking(false)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
      clearTimeout(slow)
    }
  }, [])

  const register = useCallback(async (payload) => {
    const data = await api.register(payload)
    setUser(data.user)
    return data.user
  }, [])

  const login = useCallback(async (payload) => {
    const data = await api.login(payload)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    await api.logout()
    setUser(null)
  }, [])

  /** Серверден күйді қайта оқу — email расталған соң қажет. */
  const refresh = useCallback(async () => {
    const data = await api.me()
    setUser(data.user)
    return data.user
  }, [])

  const value = useMemo(
    () => ({ user, loading, waking, register, login, logout, refresh }),
    [user, loading, waking, register, login, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
