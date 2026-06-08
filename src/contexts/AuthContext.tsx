import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "../types"
import { api } from "../lib/api"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, businessName: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (token) {
      const stored = localStorage.getItem("user")
      if (stored) {
        setUser(JSON.parse(stored))
      }
    }
    setIsLoading(false)
  }, [token])

  const login = async (email: string, password: string) => {
    const res = await api.auth.login(email, password)
    localStorage.setItem("token", res.token)
    localStorage.setItem("user", JSON.stringify(res.user))
    setToken(res.token)
    setUser(res.user)
  }

  const register = async (email: string, password: string, businessName: string) => {
    const res = await api.auth.register(email, password, businessName)
    localStorage.setItem("token", res.token)
    localStorage.setItem("user", JSON.stringify(res.user))
    setToken(res.token)
    setUser(res.user)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
