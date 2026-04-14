import { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PenLine, Trash2, Eye, ThumbsUp, MessageSquare, Clock, Loader2, Plus, MoreVertical, BookOpen, FileEdit } from 'lucide-react'
import { articleApi } from '@/api'
import type { ArticleDTO } from '@/api'
import { useAuthStore } from '@/store/useAuthStore'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const TAB_OPTIONS = [
  { label: '全部', value: undefined },
  { label: '已发布', value: 1 },
  { label: '草稿', value: 0 },
]

export default function MyArticles() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
  }, [user, navigate])

  const [articles, setArticles] = useState<ArticleDTO[]>([])
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [menuId, setMenuId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const PAGE_SIZE = 10

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const loadArticles = useCallback(() => {
    setLoading(true)
    articleApi
      .my({ status: statusFilter, pageNum, pageSize: PAGE_SIZE })
      .then((r) => {
        setArticles(r.list)
        setTotal(r.total)
      })
      .finally(() => setLoading(false))
  }, [statusFilter, pageNum])

  useEffect(() => {
    if (user) loadArticles()
  }, [user, loadArticles])

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除这篇文章？此操作不可撤销。')) return
    setDeletingId(id)
    try {
      await articleApi.delete(id)
      showToast('success', '删除成功')
      loadArticles()
    } catch (err: any) {
      showToast('error', err.message || '删除失败')
    } finally {
      setDeletingId(null)
      setMenuId(null)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">我的文章</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">共 {total} 篇</p>
        </div>
        <button
          onClick={() => navigate('/write')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          <Plus size={15} />
          写文章
        </button>
      </div>

      {/* Tab filter */}
      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl w-fit mb-6">
        {TAB_OPTIONS.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => { setStatusFilter(value); setPageNum(1) }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              statusFilter === value
                ? 'bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Article list */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin text-zinc-400" />
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-400 dark:text-zinc-500">
          <BookOpen size={48} className="mb-4 opacity-30" />
          <p className="text-base font-medium">还没有文章</p>
          <p className="text-sm mt-1">开始创作你的第一篇文章吧</p>
          <button
            onClick={() => navigate('/write')}
            className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            <PenLine size={14} />
            写文章
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="group relative flex items-start gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              {/* Cover thumbnail */}
              {article.cover && (
                <div className="hidden sm:block w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
                  <img src={article.cover} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        article.status === 1
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${article.status === 1 ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                      {article.status === 1 ? '已发布' : '草稿'}
                    </span>
                    {article.isTop === 1 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        置顶
                      </span>
                    )}
                  </div>

                  {/* Menu */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setMenuId(menuId === article.id ? null : article.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <MoreVertical size={15} />
                    </button>
                    {menuId === article.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuId(null)} />
                        <div className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden">
                          <button
                            onClick={() => {                             navigate(`/write?id=${article.id}`); setMenuId(null)
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                          >
                            <FileEdit size={13} />
                            编辑文章
                          </button>
                          {article.status === 1 && (
                            <Link
                              to={`/article/${article.id}`}
                              onClick={() => setMenuId(null)}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                            >
                              <Eye size={13} />
                              查看文章
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(article.id)}
                            disabled={deletingId === article.id}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {deletingId === article.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                            删除
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Title */}
                <Link
                  to={article.status === 1 ? `/article/${article.id}` : `/write?id=${article.id}`}
                  className="block mt-2 text-base font-semibold text-zinc-800 dark:text-zinc-100 hover:text-[hsl(var(--primary))] transition-colors line-clamp-1"
                >
                  {article.title}
                </Link>

                {/* Summary */}
                {article.summary && (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 mt-3 text-xs text-zinc-400 dark:text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {formatDistanceToNow(new Date(article.updateTime || article.createTime), { addSuffix: true, locale: zhCN })}
                  </span>
                  {article.status === 1 && (
                    <>
                      <span className="flex items-center gap-1">
                        <Eye size={11} />
                        {article.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp size={11} />
                        {article.likeCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={11} />
                        {article.commentCount}
                      </span>
                    </>
                  )}
                  {article.categoryName && (
                    <span className="text-zinc-400 dark:text-zinc-500">
                      {article.categoryName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            disabled={pageNum <= 1}
            onClick={() => setPageNum((p) => p - 1)}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            上一页
          </button>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 px-2">
            {pageNum} / {totalPages}
          </span>
          <button
            disabled={pageNum >= totalPages}
            onClick={() => setPageNum((p) => p + 1)}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            下一页
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}
    </div>
  )
}
