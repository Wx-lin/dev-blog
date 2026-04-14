import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Tag as TagIcon } from 'lucide-react'
import { tagApi } from '@/api'
import type { TagDTO } from '@/api'
import Loading from '@/components/Loading'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const tagColors = [
  'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950/60',
  'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800 dark:hover:bg-violet-950/60',
  'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-800 dark:hover:bg-pink-950/60',
  'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950/60',
  'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950/60',
  'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800 dark:hover:bg-teal-950/60',
  'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/60',
]

export default function Tags() {
  const [tags, setTags] = useState<TagDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tagApi.list().then(setTags).finally(() => setLoading(false))
  }, [])

  const maxCount = Math.max(...tags.map((t) => t.articleCount), 1)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-2 mb-2">
        <TagIcon size={22} className="text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">标签云</h1>
      </div>
      <p className="text-muted-foreground text-sm mb-8">共 {tags.length} 个标签</p>

      {loading ? (
        <Loading />
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2.5">
              {tags.map((tag, i) => {
                const ratio = tag.articleCount / maxCount
                const fontSize = Math.round(12 + ratio * 10)
                return (
                  <Link
                    key={tag.id}
                    to={`/articles?tagId=${tag.id}`}
                    style={{ fontSize: `${fontSize}px` }}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-medium transition-all',
                      tagColors[i % tagColors.length]
                    )}
                  >
                    #{tag.name}
                    <span className="text-[10px] opacity-60 font-normal">({tag.articleCount})</span>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
