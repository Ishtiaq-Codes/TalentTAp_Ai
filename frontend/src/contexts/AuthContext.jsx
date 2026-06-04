import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '@/api/auth'

const AuthContext = createContext(null)

/**
 * Returns the dashboard path for a given user role.
 */
export function getDashboardPath(role) {
  switch (role) {
    case 'candidate': return '/candidate/dashboard'
    case 'recruiter': return '/recruiter/dashboard'
    case 'company_admin': return '/company/dashboard'
    case 'admin': return '/admin/dashboard'
    default: return '/'
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const { data } = await authAPI.getMe()
      setUser(data)
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUser() }, [fetchUser])

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    // Fetch user profile immediately after login
    const meResponse = await authAPI.getMe()
    setUser(meResponse.data)
    return meResponse.data // return user so caller can redirect by role
  }

  const register = async (formData) => {
    await authAPI.register(formData)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  const value = { user, loading, login, register, logout, fetchUser }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
