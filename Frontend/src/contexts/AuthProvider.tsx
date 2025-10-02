import React, { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { apiPost } from '../lib/api'
import type { NavigateFunction } from 'react-router-dom'

interface AuthProviderProps {
  children: React.ReactNode;
  navigate: NavigateFunction;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, navigate }) => {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  // const navigate = useNavigate()

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      try {
        setUser(JSON.parse(storedUser))
        navigate('/dashboard')
      } catch {
        setUser(null)
      }
    }
    setLoading(false)
  }, [navigate])

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const res = await apiPost<{ id: string; name: string; email: string }>(
        '/auth/register',
        { name, email, password }
      )
      if (res.error) return { error: new Error(res.error) }
      if (res.token && res.user) {
        localStorage.setItem('auth_token', res.token)
        localStorage.setItem('auth_user', JSON.stringify(res.user))
        setToken(res.token)
        setUser(res.user)
      }
      return { error: undefined }
    } catch (e: unknown) {
      const axiosErr = e as { response?: { data?: { error?: string } } }
      const message = axiosErr.response?.data?.error || (e as Error)?.message || 'Registration failed'
      return { error: new Error(message) }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const res = await apiPost<{ id: string; name: string; email: string }>(
        '/auth/login',
        { email, password }
      )
      
      if (res.error) return { error: new Error(res.error) }
      if (res.token && res.user) {
        localStorage.setItem('auth_token', res.token)
        localStorage.setItem('auth_user', JSON.stringify(res.user))
        setToken(res.token)
        setUser(res.user)
      }
      return { error: undefined }
    } catch (e: unknown) {
      const axiosErr = e as { response?: { data?: { error?: string } } }
      const message = axiosErr.response?.data?.error || (e as Error)?.message || 'Login failed'
      return { error: new Error(message) }
    }
  }

  const signOut = async () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    session: token,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


