import { createContext, useContext, useState, useCallback } from 'react'
import DataService from '../services/api'
import { usuarios as usuariosFallback } from '../data/usuarios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (cedula, password) => {
    setLoading(true)
    try {
      const res = await DataService.validarLogin(cedula, password)
      if (res?.success) {
        setUser(res.usuario)
        return true
      }
      return false
    } catch {
      const found = usuariosFallback.find((u) => u.cedula === cedula)
      if (found && password === found.password) {
        setUser(found)
        return true
      }
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => setUser(null), [])

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, usuarios: usuariosFallback }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
