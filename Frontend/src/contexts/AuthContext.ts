import { createContext } from 'react'
import type { User } from '@supabase/supabase-js'

export interface AuthContextType {
  user: User | null
  session: unknown | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: unknown }>
  signIn: (email: string, password: string) => Promise<{ error: unknown }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
