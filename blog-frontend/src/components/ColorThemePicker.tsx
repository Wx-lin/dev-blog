import { useEffect, useRef, useState } from 'react'
import { Palette } from 'lucide-react'
import { useThemeStore, type ColorTheme } from '@/store/useThemeStore'
import { cn } from '@/lib/utils'

const themes: { id: ColorTheme; label: string; light: string; dark: string }[] = [
  { id: 'lime',   label: '酸绿',  light: '#65a30d', dark: '#a3e635' },
  { id: 'yellow', label: '黄色',  light: '#ca8a04', dark: '#facc15' },
  { id: 'rose',   label: '玫瑰红', light: '#e11d48', dark: '#fb7185' },
  { id: 'cyan',   label: '青色',  light: '#0891b2', dark: '#22d3ee' },
  { id: 'violet', label: '紫罗兰', light: '#7c3aed', dark: '#a78bfa' },
]

export default function ColorThemePicker() {
  const { colorTheme, setColorTheme, dark } = useThemeStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = themes.find((t) => t.id === colorTheme) ?? themes[0]
  const swatchColor = dark ? current.dark : current.light

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="切换主题色"
        className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/50 transition-all flex items-center gap-1.5 cursor-pointer"
      >
        <Palette size={18} />
        {/* 小色点指示当前主题 */}
        <span
          className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10 dark:ring-white/10 inline-block"
          style={{ background: swatchColor }}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 mt-2 z-50 min-w-[160px] rounded-xl shadow-2xl overflow-hidden border bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 py-2">
          <p className="px-3 pb-1.5 pt-0.5 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            主题色
          </p>
          {themes.map((t) => {
            const color = dark ? t.dark : t.light
            const active = colorTheme === t.id
            return (
              <button
                key={t.id}
                onClick={() => {
                  setColorTheme(t.id)
                  setOpen(false)
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors cursor-pointer',
                  active
                    ? 'bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
                )}
              >
                {/* Color swatch circle */}
                <span
                  className="w-4 h-4 rounded-full ring-1 ring-black/10 dark:ring-white/10 shrink-0"
                  style={{ background: color }}
                />
                {t.label}
                {active && (
                  <span className="ml-auto text-[10px] font-bold" style={{ color }}>
                    ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
