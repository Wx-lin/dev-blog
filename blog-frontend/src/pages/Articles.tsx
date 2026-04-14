import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { articleApi, categoryApi, tagApi } from '@/api'
import type { ArticleDTO, CategoryDTO, TagDTO } from '@/api'
import ArticleCard from '@/components/ArticleCard'
import Pagination from '@/components/Pagination'
import Loading from '@/components/Loading'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export default function Articles() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles] = useState<ArticleDTO[]>([])
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [tags, setTags] = useState<TagDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const keyword = searchParams.get('keyword') || ''
  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined
  const tagId = searchParams.get('tagId') ? Number(searchParams.get('tagId')) : undefined
  const pageNum = Number(searchParams.get('pageNum') || 1)

  useEffect(() => {
    categoryApi.list().then(setCategories)
    tagApi.list().then(setTags)
  }, [])

  useEffect(() => {
    setLoading(true)
    articleApi.list({ keyword, categoryId, tagId, pageNum, pageSize: 9 })
      .then((r) => { setArticles(r.list); setTotal(r.total) })
      .finally(() => setLoading(false))
  }, [keyword, categoryId, tagId, pageNum])

  // 切换筛选条件时重置到第 1 页
  const setParam = (key: string, val: string | undefined) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val)
    else p.delete(key)
    p.delete('pageNum')
    setSearchParams(p)
  }

  // 单独翻页，不重置其他条件
  const setPage = (page: number) => {
    const p = new URLSearchParams(searchParams)
    if (page <= 1) p.delete('pageNum')
    else p.set('pageNum', String(page))
    setSearchParams(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const [inputVal, setInputVal] = useState(keyword)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setParam('keyword', inputVal || undefined)
  }

  const pageTitle = categoryId
    ? categories.find(c => c.id === categoryId)?.name
    : tagId
      ? `#${tags.find(t => t.id === tagId)?.name}`
      : keyword
        ? `"${keyword}"`
        : '全部文章'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-60 shrink-0 space-y-5">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="搜索文章..."
              className="pl-9"
            />
          </form>

          {/* Categories Filter */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">分类</h3>
            <div className="space-y-0.5">
              <button
                onClick={() => setParam('categoryId', undefined)}
                className={cn(
                  'w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors cursor-pointer',
                  !categoryId
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                全部
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setParam('categoryId', String(c.id))}
                  className={cn(
                    'w-full text-left px-2.5 py-1.5 rounded-md text-sm flex justify-between items-center transition-colors cursor-pointer',
                    categoryId === c.id
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <span>{c.name}</span>
                  <span className={cn(
                    'text-[11px] px-1.5 py-0.5 rounded',
                    categoryId === c.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}>
                    {c.articleCount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">标签</h3>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <Badge
                  key={t.id}
                  variant={tagId === t.id ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                  onClick={() => setParam('tagId', tagId === t.id ? undefined : String(t.id))}
                >
                  {t.name}
                </Badge>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold">{pageTitle}</h1>
            <span className="text-sm text-muted-foreground">{total} 篇</span>
          </div>

          {/* Active filters */}
          {(keyword || categoryId || tagId) && (
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs text-muted-foreground">筛选：</span>
              {keyword && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setParam('keyword', undefined)}>
                  关键词: {keyword} ×
                </Badge>
              )}
              {categoryId && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setParam('categoryId', undefined)}>
                  分类: {categories.find(c => c.id === categoryId)?.name} ×
                </Badge>
              )}
              {tagId && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setParam('tagId', undefined)}>
                  标签: {tags.find(t => t.id === tagId)?.name} ×
                </Badge>
              )}
            </div>
          )}

          {loading ? (
            <Loading />
          ) : articles.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
              </div>
              <Pagination current={pageNum} total={total} pageSize={9} onChange={setPage} />
            </>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-4xl mb-3">📭</p>
              <p>暂无匹配的文章</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setSearchParams({})}>
                清除筛选
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
