import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import { api } from '../lib/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Бет жаңартылғанда сессия cookie бойынша қолданушыны қалпына келтіреміз
  useEffect(() => {
    let cancelled = false

    api
      .me()
      .then((data) => {
        if (!cancelled) setUser(data.user)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
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

  const value = useMemo(
    () => ({ user, loading, register, login, logout }),
    [user, loading, register, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
