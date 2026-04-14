import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/store/useThemeStore'

export default function ThemeToggle() {
  const { dark, toggle } = useThemeStore()
  return (
    <button
      onClick={toggle}
      aria-label="切换主题"
      className="p-2 rounded-lg text-zinc-400 hover:t-primary hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all cursor-pointer"
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
