import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ColorTheme = 'lime' | 'yellow' | 'rose' | 'cyan' | 'violet'

interface ThemeState {
  dark: boolean
  colorTheme: ColorTheme
  toggle: () => void
  setColorTheme: (theme: ColorTheme) => void
}

function applyTheme(dark: boolean, colorTheme: ColorTheme) {
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.setAttribute('data-theme', colorTheme)
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      dark: true,
      colorTheme: 'lime',
      toggle: () => {
        const next = !get().dark
        applyTheme(next, get().colorTheme)
        set({ dark: next })
      },
      setColorTheme: (theme: ColorTheme) => {
        applyTheme(get().dark, theme)
        set({ colorTheme: theme })
      },
    }),
    {
      name: 'blog-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.dark, state.colorTheme)
      },
    }
  )
)
