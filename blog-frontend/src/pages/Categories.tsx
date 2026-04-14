import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layers, ArrowRight } from 'lucide-react'
import { categoryApi } from '@/api'
import type { CategoryDTO } from '@/api'
import Loading from '@/components/Loading'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const iconColors = [
  'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
  'bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400',
  'bg-pink-100 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400',
  'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
  'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
  'bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400',
  'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400',
  'bg-green-100 text-green-600 dark:bg-green-950/60 dark:text-green-400',
]

export default function Categories() {
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoryApi.list().then(setCategories).finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-2 mb-2">
        <Layers size={22} className="text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">文章分类</h1>
      </div>
      <p className="text-muted-foreground text-sm mb-8">共 {categories.length} 个分类</p>

      {loading ? (
        <Loading />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((cat, i) => (
            <Link key={cat.id} to={`/articles?categoryId=${cat.id}`} className="group block">
              <Card className="h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconColors[i % iconColors.length]}`}>
                      <Layers size={16} />
                    </div>
                    <Badge variant="secondary" className="text-[11px]">
                      {cat.articleCount} 篇
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors mb-1">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{cat.description}</p>
                  )}
                  <div className="mt-4 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    查看文章 <ArrowRight size={12} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
