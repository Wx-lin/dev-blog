import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, User, Search, Bell, PenLine, Menu, X, BookOpen, MessageCircle, Heart, AtSign, Megaphone, CheckCheck } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import ColorThemePicker from './ColorThemePicker'
import { useAuthStore } from '@/store/useAuthStore'
import { userApi, articleApi, notifyApi } from '@/api'
import type { ArticleDTO, NotificationDTO } from '@/api'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const navLinks = [
  { label: '首页', href: '/' },
  { label: '文章', href: '/articles' },
  { label: '分类', href: '/categories' },
  { label: '标签', href: '/tags' },
]

/* ── 搜索框组件（含实时下拉建议）── */
function SearchBox({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const [val, setVal] = useState('')
  const [suggestions, setSuggestions] = useState<ArticleDTO[]>([])
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  // 输入变化：debounce 300ms 后请求
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setVal(v)
    setActiveIdx(-1)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!v.trim()) {
      setSuggestions([])
      setOpen(false)
      return
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await articleApi.list({ keyword: v.trim(), pageSize: 8 })
        setSuggestions(res.list)
        setOpen(true)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  // 提交搜索
  const doSearch = (keyword: string) => {
    if (!keyword.trim()) return
    setOpen(false)
    setVal('')
    setSuggestions([])
    navigate(`/articles?keyword=${encodeURIComponent(keyword.trim())}`)
    onNavigate?.()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeIdx >= 0 && suggestions[activeIdx]) {
      doSearch(suggestions[activeIdx].title)
    } else {
      doSearch(val)
    }
  }

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIdx(-1)
    }
  }

  // 点击外部关闭
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={wrapRef} className="relative">
      <form onSubmit={handleSubmit}>
        <input
          className="text-sm px-4 py-2 pr-10 rounded-xl w-64 focus:outline-none focus:ring-2 focus:w-80 transition-all duration-200 ring-t-primary-50 bg-zinc-100 border border-zinc-200 text-zinc-700 placeholder-zinc-400 dark:bg-zinc-900/80 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
          placeholder="搜索文章/内容..."
          type="text"
          value={val}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
          autoComplete="off"
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
          <Search size={15} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors" />
        </button>
      </form>

      {/* 下拉建议 */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[320px] rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden z-200">
          {loading ? (
            <div className="px-4 py-3 text-sm text-zinc-400 dark:text-zinc-500">搜索中...</div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((article, idx) => (
                <li key={article.id}>
                  <button
                    type="button"
                    className={cn(
                      'w-full text-left flex items-center gap-3 px-4 py-3 text-sm transition-colors cursor-pointer',
                      idx === activeIdx
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/70'
                    )}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => {
                      navigate(`/article/${article.id}`)
                      setOpen(false)
                      setVal('')
                      setSuggestions([])
                      onNavigate?.()
                    }}
                  >
                    <Search size={13} className="shrink-0 text-zinc-400 dark:text-zinc-500" />
                    <span className="truncate">{article.title}</span>
                    {article.categoryName && (
                      <span className="ml-auto shrink-0 text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">
                        {article.categoryName}
                      </span>
                    )}
                  </button>
                </li>
              ))}
              {/* 查看全部 */}
              <li className="border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  className="w-full text-left px-4 py-2.5 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer flex items-center gap-2"
                  onClick={() => doSearch(val)}
                >
                  <Search size={12} />
                  查看"{val}"的全部结果
                </button>
              </li>
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-zinc-400 dark:text-zinc-500">未找到相关文章</div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── 通知类型图标 ── */
function NotifyIcon({ type }: { type: NotificationDTO['type'] }) {
  if (type === 'COMMENT') return <MessageCircle size={14} className="text-blue-400" />
  if (type === 'REPLY') return <AtSign size={14} className="text-purple-400" />
  if (type === 'LIKE') return <Heart size={14} className="text-red-400" />
  return <Megaphone size={14} className="text-yellow-400" />
}

/* ── 通知下拉面板 ── */
function NotifyPanel({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [items, setItems] = useState<NotificationDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    notifyApi.list({ pageNum: 1, pageSize: 20 })
      .then((res) => { setItems(res.list); setTotal(res.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleRead = async (item: NotificationDTO) => {
    if (item.isRead === 0) {
      await notifyApi.read(item.id).catch(() => {})
      setItems((prev) => prev.map((n) => n.id === item.id ? { ...n, isRead: 1 } : n))
    }
    onClose()
    if (item.sourceType === 'article' && item.sourceId) {
      navigate(`/article/${item.sourceId}`)
    }
  }

  const handleReadAll = async () => {
    await notifyApi.readAll().catch(() => {})
    setItems((prev) => prev.map((n) => ({ ...n, isRead: 1 })))
  }

  const unreadCount = items.filter((n) => n.isRead === 0).length

  return (
    <div className="absolute right-0 mt-2 w-80 z-50 rounded-xl shadow-2xl overflow-hidden border bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          通知
          {unreadCount > 0 && (
            <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
              {unreadCount}
            </span>
          )}
        </span>
        {unreadCount > 0 && (
          <button
            onClick={handleReadAll}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
          >
            <CheckCheck size={13} />
            全部已读
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">加载中...</div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-sm text-zinc-400 dark:text-zinc-500">
            <Bell size={28} className="mx-auto mb-2 opacity-30" />
            暂无通知
          </div>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleRead(item)}
                  className={cn(
                    'w-full text-left flex items-start gap-3 px-4 py-3 text-sm transition-colors cursor-pointer border-b border-zinc-50 dark:border-zinc-800/60 last:border-0',
                    item.isRead === 0
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  )}
                >
                  {/* 未读小圆点 */}
                  <span className="mt-1.5 shrink-0">
                    {item.isRead === 0
                      ? <span className="block w-1.5 h-1.5 rounded-full bg-primary" />
                      : <span className="block w-1.5 h-1.5" />
                    }
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <NotifyIcon type={item.type} />
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">{item.typeDesc}</span>
                      <span className="ml-auto text-[11px] text-zinc-300 dark:text-zinc-600 shrink-0">
                        {format(new Date(item.createTime), 'MM-dd HH:mm')}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      {total > 20 && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-2.5 text-center text-xs text-zinc-400 dark:text-zinc-500">
          共 {total} 条通知，仅展示最新 20 条
        </div>
      )}
    </div>
  )
}

/* ── Navbar ── */
export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifyOpen, setNotifyOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // 轮询未读通知数（登录状态下每 60s 刷一次）
  const fetchUnread = useCallback(() => {
    if (!user) return
    notifyApi.unreadCount().then(setUnreadCount).catch(() => {})
  }, [user])

  useEffect(() => {
    fetchUnread()
    const timer = setInterval(fetchUnread, 60_000)
    return () => clearInterval(timer)
  }, [fetchUnread])

  // 打开面板后重置未读数显示（面板内部会标记已读）
  const handleNotifyClose = useCallback(() => {
    setNotifyOpen(false)
    // 关闭面板后重新拉未读数
    notifyApi.unreadCount().then(setUnreadCount).catch(() => {})
  }, [])

  const handleLogout = async () => {
    await userApi.logout().catch(() => {})
    logout()
    navigate('/')
    setDropdownOpen(false)
  }

  const isActive = (href: string) => location.pathname === href

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-200/80 shadow-sm dark:bg-zinc-950/80 dark:border-zinc-800/60 dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <div className="flex justify-between items-center h-16 px-6 max-w-7xl mx-auto">

        {/* ── Logo + Desktop Nav ── */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-tighter t-primary">
            ArchitectBlog
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className={cn(
                  'text-sm font-semibold tracking-tight transition-colors',
                  isActive(l.href)
                    ? 't-primary'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-1.5">
          {/* Search with suggestions */}
          <div className="hidden sm:block">
            <SearchBox />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Color Theme Picker */}
          <ColorThemePicker />

          {/* Notifications */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setNotifyOpen((v) => !v)}
                className="relative p-2 rounded-lg text-zinc-400 hover:t-primary hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all cursor-pointer"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {notifyOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={handleNotifyClose} />
                  <NotifyPanel onClose={handleNotifyClose} />
                </>
              )}
            </div>
          )}

          {/* Write Button */}
          <button
            onClick={() => user ? navigate('/write') : navigate('/login')}
            className="signature-gradient t-primary-fg px-5 py-2 rounded-xl text-sm font-bold active:scale-95 duration-200 flex items-center gap-1.5 cursor-pointer"
          >
            <PenLine size={14} />
            写文章
          </button>

          {/* User / Login */}
          {user ? (
            <div className="relative ml-1">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-t-primary-50 transition-all cursor-pointer"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-t-primary t-primary-fg text-sm font-bold">
                    {user.nickname?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 z-50 rounded-xl shadow-2xl overflow-hidden border bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{user.nickname}</p>
                      {user.email && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">{user.email}</p>
                      )}
                    </div>
                    <Link
                      to="/write"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
                    >
                      <PenLine size={14} />
                      写文章
                    </Link>
                    <Link
                      to="/my-articles"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
                    >
                      <BookOpen size={14} />
                      我的文章
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
                    >
                      <User size={14} />
                      个人设置
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      退出登录
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-1 text-sm font-semibold t-primary hover:t-primary transition-colors"
            >
              登录
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50 transition-colors ml-1 cursor-pointer"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Dropdown ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200/80 dark:border-zinc-800/60 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive(l.href)
                  ? 'bg-t-primary-10 t-primary dark:bg-t-primary-10'
                  : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50'
              )}
            >
              {l.label}
            </Link>
          ))}
          {/* Mobile Search */}
          <div className="mt-2">
            <SearchBox onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </header>
  )
}
