import { createContext } from 'react'

export interface AuthContextType {
  user: { id: string; name: string; email: string } | null
  session: string | null
  loading: boolean
  signUp: (name: string, email: string, password: string) => Promise<{ error: unknown } | { error: undefined }>
  signIn: (email: string, password: string) => Promise<{ error: unknown } | { error: undefined }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
