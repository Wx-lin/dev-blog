import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Eye, ThumbsUp, MessageCircle,
  LayoutDashboard, Terminal, Globe, Cpu, Smartphone,
  BrainCircuit, Wrench, MoreHorizontal,
  PenLine, BookOpen, Database, Server, Cloud, Code2, Box,
  GitBranch, Shield, Network, Layers, FlaskConical, Rocket,
  BarChart2, MonitorDot, Wifi, Settings2, BookMarked,
  Lightbulb, Blocks, FileCode2, Puzzle, Binary,
} from 'lucide-react'
import { format } from 'date-fns'
import { articleApi, categoryApi, tagApi } from '@/api'
import type { ArticleDTO, CategoryDTO, TagDTO } from '@/api'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'

/* ─── Category icon map ─── */
const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  // ── 截图中出现的分类 ──
  '随笔':           <PenLine size={18} />,
  '随笔杂谈':       <PenLine size={18} />,
  '算法':           <Binary size={18} />,
  '算法与数据结构': <Binary size={18} />,
  '数据结构':       <Binary size={18} />,
  '数据库':         <Database size={18} />,
  'DevOps':        <GitBranch size={18} />,
  'devops':        <GitBranch size={18} />,
  '前端开发':       <Code2 size={18} />,
  '前端':           <Code2 size={18} />,
  '后端开发':       <Server size={18} />,
  '后端':           <Server size={18} />,

  // ── 其他常见技术分类 ──
  'AI':             <BrainCircuit size={18} />,
  '人工智能':       <BrainCircuit size={18} />,
  '机器学习':       <BrainCircuit size={18} />,
  '深度学习':       <BrainCircuit size={18} />,
  '移动端':         <Smartphone size={18} />,
  'Android':        <Smartphone size={18} />,
  'iOS':            <Smartphone size={18} />,
  '架构':           <Layers size={18} />,
  '系统架构':       <Layers size={18} />,
  '云原生':         <Cloud size={18} />,
  '云计算':         <Cloud size={18} />,
  '容器':           <Box size={18} />,
  'Docker':         <Box size={18} />,
  'Kubernetes':     <Box size={18} />,
  '运维':           <Settings2 size={18} />,
  '安全':           <Shield size={18} />,
  '网络':           <Network size={18} />,
  '测试':           <FlaskConical size={18} />,
  '开源':           <Puzzle size={18} />,
  '工具':           <Wrench size={18} />,
  '开发工具':       <Wrench size={18} />,
  '性能优化':       <Rocket size={18} />,
  '数据分析':       <BarChart2 size={18} />,
  '大数据':         <BarChart2 size={18} />,
  '监控':           <MonitorDot size={18} />,
  '物联网':         <Wifi size={18} />,
  'IoT':            <Wifi size={18} />,
  '读书笔记':       <BookMarked size={18} />,
  '学习笔记':       <BookOpen size={18} />,
  '教程':           <BookOpen size={18} />,
  '新技术':         <Lightbulb size={18} />,
  '区块链':         <Blocks size={18} />,
  '源码解析':       <FileCode2 size={18} />,
  '源码分析':       <FileCode2 size={18} />,
  '微服务':         <Network size={18} />,
  '分布式':         <Network size={18} />,
  'Java':           <FileCode2 size={18} />,
  'Python':         <FileCode2 size={18} />,
  'Go':             <FileCode2 size={18} />,
  'Rust':           <FileCode2 size={18} />,
}

const SORT_TABS = ['热门', '最新', '热榜'] as const
type SortTab = (typeof SORT_TABS)[number]

const PAGE_SIZE = 10

/* ════════════════════════════════════════
   骨架屏 – 单张卡片
   ════════════════════════════════════════ */
function ArticleSkeleton() {
  return (
    <div className="p-6 rounded-2xl border bg-white border-zinc-200/80 dark:bg-zinc-900 dark:border-zinc-800/40 animate-pulse">
      <div className="flex justify-between gap-6">
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex gap-2">
            <div className="h-4 w-14 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-4 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          </div>
          <div className="h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-4 w-2/3 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="flex gap-4 mt-2">
            <div className="h-3 w-8 rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-3 w-8 rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-3 w-8 rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
        <div className="w-36 h-24 rounded-xl bg-zinc-200 dark:bg-zinc-700 shrink-0 hidden sm:block" />
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   文章卡片
   ════════════════════════════════════════ */
function ArticleFeedItem({ article }: { article: ArticleDTO }) {
  return (
    <Link to={`/article/${article.id}`} className="group block">
      <article className={cn(
        'p-6 rounded-2xl transition-all duration-200 cursor-pointer shadow-sm border',
        'bg-white border-zinc-200/80 hover:bg-zinc-50 hover:border-zinc-300',
        'dark:bg-zinc-900 dark:border-zinc-800/40 dark:hover:bg-zinc-800/80 dark:hover:border-zinc-700/60',
      )}>
        <div className="flex justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {article.categoryName && (
                <span className="text-[11px] font-semibold uppercase tracking-widest t-primary bg-t-primary-10 px-2 py-0.5 rounded-full">
                  {article.categoryName}
                </span>
              )}
              {article.isTop === 1 && (
                <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
                  置顶
                </span>
              )}
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {article.authorNickname}
                {article.publishTime && (
                  <> · {format(new Date(article.publishTime), 'MM月dd日')}</>
                )}
              </span>
            </div>

            <h2 className="text-[17px] font-bold leading-snug mb-2 text-zinc-800 dark:text-zinc-100 group-hover:t-primary transition-colors line-clamp-2">
              {article.title}
            </h2>

            {article.summary && (
              <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2 leading-relaxed mb-4 hidden sm:block">
                {article.summary}
              </p>
            )}

            <div className="flex items-center gap-5 text-zinc-400 dark:text-zinc-500">
              <span className="flex items-center gap-1.5 text-xs"><Eye size={13} /> {article.viewCount ?? 0}</span>
              <span className="flex items-center gap-1.5 text-xs"><ThumbsUp size={13} /> {article.likeCount ?? 0}</span>
              <span className="flex items-center gap-1.5 text-xs"><MessageCircle size={13} /> {article.commentCount ?? 0}</span>
            </div>
          </div>

          {article.cover && (
            <div className="w-36 h-24 sm:w-40 sm:h-28 rounded-xl overflow-hidden shrink-0">
              <img
                src={article.cover}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}

/* ════════════════════════════════════════
   Main Page
   ════════════════════════════════════════ */
export default function Home() {
  const { user } = useAuthStore()
  const [articles, setArticles]     = useState<ArticleDTO[]>([])
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [tags, setTags]             = useState<TagDTO[]>([])
  const [sortTab, setSortTab]       = useState<SortTab>('热门')
  // 分页状态
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [hasMore, setHasMore]   = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)

  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategoryId = searchParams.get('categoryId')
    ? Number(searchParams.get('categoryId'))
    : null

  // IntersectionObserver 哨兵节点
  const sentinelRef = useRef<HTMLDivElement>(null)

  // 加载某一页数据
  const loadPage = useCallback(async (pageNum: number, catId: number | null, reset: boolean) => {
    if (loading) return
    setLoading(true)
    try {
      const res = await articleApi.list({
        categoryId: catId || undefined,
        pageNum,
        pageSize: PAGE_SIZE,
      })
      const list = res.list ?? []
      setArticles((prev) => reset ? list : [...prev, ...list])
      setHasMore(list.length === PAGE_SIZE)
      setPage(pageNum)
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }, [loading])

  // 切换分类 / 排序时重置
  useEffect(() => {
    setArticles([])
    setPage(1)
    setHasMore(true)
    setInitialLoad(true)
    loadPage(1, activeCategoryId, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategoryId, sortTab])

  // 分类 & 标签初始化
  useEffect(() => {
    Promise.all([categoryApi.list(), tagApi.list()]).then(([cat, tag]) => {
      setCategories(cat)
      setTags(tag.slice(0, 12))
    })
  }, [])

  // IntersectionObserver 监听哨兵
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadPage(page + 1, activeCategoryId, false)
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, page, activeCategoryId, loadPage])

  const setCategory = (id: number | null) => {
    const p = new URLSearchParams(searchParams)
    if (id) p.set('categoryId', String(id))
    else p.delete('categoryId')
    setSearchParams(p)
  }

  const sideCard = 'rounded-2xl shadow-sm border p-6 bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800/40'

  return (
    <main className="pt-8 pb-12 max-w-7xl mx-auto px-6 grid grid-cols-12 gap-8">

      {/* ══ LEFT – Category Sidebar ══ */}
      <aside className="col-span-2 hidden lg:block sticky top-20 self-start">
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => setCategory(null)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left text-sm cursor-pointer',
              !activeCategoryId
                ? 'bg-t-primary-10 t-primary font-semibold dark:bg-zinc-800'
                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100'
            )}
          >
            <LayoutDashboard size={18} />
            <span>综合</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left text-sm cursor-pointer',
                activeCategoryId === cat.id
                  ? 'bg-t-primary-10 t-primary font-semibold dark:bg-zinc-800'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100'
              )}
            >
              <span className="shrink-0">{CATEGORY_ICON_MAP[cat.name] ?? <Globe size={18} />}</span>
              <span className="truncate">{cat.name}</span>
            </button>
          ))}

          <div className="h-px bg-zinc-200 dark:bg-zinc-800/60 my-2" />

          <Link
            to="/categories"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100 transition-all"
          >
            <MoreHorizontal size={18} />
            <span>更多</span>
          </Link>
        </nav>
      </aside>

      {/* ══ CENTER – Article Feed ══ */}
      <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">

        {/* Sort Tabs */}
        <div className="flex items-center gap-8 px-2 border-b border-zinc-200 dark:border-zinc-800/60 pb-4">
          {SORT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setSortTab(tab)}
              className={cn(
                'text-sm relative pb-0.5 transition-colors cursor-pointer',
                sortTab === tab
                  ? 'font-bold text-zinc-900 dark:text-zinc-100 after:absolute after:bottom-[-17px] after:left-0 after:w-full after:h-0.5 after:rounded-full after-bg-primary'
                  : 'font-medium text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 首屏骨架 */}
        {initialLoad && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => <ArticleSkeleton key={i} />)}
          </div>
        )}

        {/* 文章列表 */}
        {!initialLoad && (
          <>
            {articles.length === 0 ? (
              <div className="text-center py-24 text-zinc-400 dark:text-zinc-600">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm">该分类下暂无文章</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {articles.map((a) => <ArticleFeedItem key={a.id} article={a} />)}
              </div>
            )}

            {/* 加载更多骨架 */}
            {loading && (
              <div className="flex flex-col gap-4 mt-2">
                {Array.from({ length: 3 }).map((_, i) => <ArticleSkeleton key={i} />)}
              </div>
            )}

            {/* 没有更多 */}
            {!hasMore && articles.length > 0 && (
              <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 py-6">
                — 已经到底了 —
              </p>
            )}
          </>
        )}

        {/* IntersectionObserver 哨兵 */}
        <div ref={sentinelRef} className="h-1" />
      </div>

      {/* ══ RIGHT – Sidebar ══ */}
      <aside className="col-span-12 lg:col-span-3 max-lg:hidden flex flex-col gap-6">

        {/* Trending Tags */}
        {tags.length > 0 && (
          <div className={sideCard}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm">热门标签</h3>
              <Link to="/tags" className="text-xs t-primary font-medium hover:underline">全部</Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/articles?tagId=${tag.id}`}
                  className="px-3 py-1.5 text-xs rounded-full border transition-all bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-t-primary-10 hover:t-primary hover:border-t-primary-30 dark:bg-zinc-800/60 dark:text-zinc-400 dark:border-transparent dark:hover:bg-t-primary-10 dark:hover:t-primary"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer links */}
        <div className="px-1 flex flex-wrap gap-x-3 gap-y-1.5">
          {['关于', '隐私政策', '用户协议'].map((t) => (
            <span key={t} className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 cursor-pointer transition-colors">
              {t}
            </span>
          ))}
          <p className="text-[10px] tracking-wider text-zinc-300 dark:text-zinc-700 w-full mt-1">
            © {new Date().getFullYear()} ArchitectBlog
          </p>
        </div>
      </aside>
    </main>
  )
}
