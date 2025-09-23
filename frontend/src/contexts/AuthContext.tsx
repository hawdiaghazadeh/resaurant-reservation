import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, login, register, logout, getCurrentUser } from '../lib/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await getCurrentUser()
      if (response.user) {
        setUser(response.user)
      }
    } catch (error) {
      console.log('User not authenticated')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await login({ email, password })
      if (response.user) {
        setUser(response.user)
      }
    } catch (error) {
      throw error
    }
  }

  const handleRegister = async (userData: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
    try {
      const response = await register(userData)
      if (response.user) {
        setUser(response.user)
      }
    } catch (error) {
      throw error
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
