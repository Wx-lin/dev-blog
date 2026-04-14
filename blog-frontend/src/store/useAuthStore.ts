import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserDTO } from '@/api'

interface AuthState {
  user: UserDTO | null
  token: string | null
  setUser: (user: UserDTO | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => {
        // 登录时 UserDTO 携带 token 字段，单独保存
        const token = user?.token ?? null
        // 存入 state 时不保留 token 字段（token 已独立存储）
        const userWithoutToken = user ? { ...user, token: undefined } : null
        set({ user: userWithoutToken, token })
      },
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'blog-auth',
      // 只持久化 user 和 token
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
