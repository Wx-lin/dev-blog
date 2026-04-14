import { Link, useNavigate } from 'react-router-dom'
import { Eye, MessageCircle, Heart, Calendar, Tag } from 'lucide-react'
import { format } from 'date-fns'
import type { ArticleDTO } from '@/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface Props {
  article: ArticleDTO
}

export default function ArticleCard({ article }: Props) {
  const navigate = useNavigate()

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
      )}
      onClick={() => navigate(`/article/${article.id}`)}
    >
      {article.cover && (
        <div className="block overflow-hidden aspect-video">
          <img
            src={article.cover}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <CardContent className="p-5">
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-3">
          {article.isTop === 1 && (
            <Badge variant="secondary" className="text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 border text-[10px] px-1.5 py-0">
              置顶
            </Badge>
          )}
          {article.categoryName && (
            <Link
              to={`/articles?categoryId=${article.categoryId}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-primary border-primary/30 hover:bg-primary/5 transition-colors">
                {article.categoryName}
              </Badge>
            </Link>
          )}
        </div>

        {/* Title */}
        <h2 className="text-base font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
          {article.title}
        </h2>

        {/* Summary */}
        {article.summary && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {article.summary}
          </p>
        )}

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {article.tags.slice(0, 3).map((t) => (
              <Link
                key={t.id}
                to={`/articles?tagId=${t.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-primary bg-muted hover:bg-primary/5 px-2 py-0.5 rounded transition-colors">
                  <Tag size={9} />
                  {t.name}
                </span>
              </Link>
            ))}
          </div>
        )}

        <Separator className="my-3" />

        {/* Meta */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {article.publishTime ? format(new Date(article.publishTime), 'yyyy-MM-dd') : '-'}
          </span>
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1"><Eye size={11} />{article.viewCount}</span>
            <span className="flex items-center gap-1"><Heart size={11} />{article.likeCount}</span>
            <span className="flex items-center gap-1"><MessageCircle size={11} />{article.commentCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
