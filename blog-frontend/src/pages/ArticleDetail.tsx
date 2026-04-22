import { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { Eye, Heart, MessageCircle, Calendar, Tag, ArrowLeft, User } from 'lucide-react'

// 配置 marked：使用 highlight.js 高亮代码块
marked.setOptions({
  // @ts-ignore
  highlight: (code: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
})

/** 判断内容是否是 HTML（新格式） */
function isHtml(content: string): boolean {
  return /^\s*<[a-zA-Z]/.test(content.trim())
}

/** 智能渲染：HTML 直接用，Markdown 先转 HTML */
function renderContent(content: string): string {
  if (!content) return ''
  if (isHtml(content)) return content
  return marked(content.replace(/\\n/g, '\n')) as string
}
import { format } from 'date-fns'
import { articleApi, commentApi } from '@/api'
import type { ArticleDTO, CommentDTO } from '@/api'
import { useAuthStore } from '@/store/useAuthStore'
import Loading from '@/components/Loading'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

function CommentItem({
  comment,
  onReply,
}: {
  comment: CommentDTO
  articleId: number
  onReply: (c: CommentDTO) => void
}) {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={comment.userAvatar || undefined} alt={comment.userNickname} />
        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
          {comment.userNickname?.[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-semibold">{comment.userNickname}</span>
          {comment.replyUserNickname && (
            <span className="text-xs text-muted-foreground">
              回复 <span className="text-primary">@{comment.replyUserNickname}</span>
            </span>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {format(new Date(comment.createTime), 'yyyy-MM-dd HH:mm')}
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 h-6 px-2 text-xs text-muted-foreground hover:text-primary"
          onClick={() => onReply(comment)}
        >
          回复
        </Button>
        {comment.children?.length > 0 && (
          <div className="mt-3 space-y-4 pl-4 border-l-2 border-border">
            {comment.children.map((child) => (
              <CommentItem key={child.id} comment={child} articleId={0} onReply={onReply} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ArticleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [article, setArticle] = useState<ArticleDTO | null>(null)
  const [comments, setComments] = useState<CommentDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [replyTo, setReplyTo] = useState<CommentDTO | null>(null)
  const [commentContent, setCommentContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [commentMsg, setCommentMsg] = useState('')

  useEffect(() => {
    if (!id) return
    const artId = Number(id)
    setLoading(true)
    Promise.all([
      articleApi.detail(artId),
      commentApi.list(artId),
    ]).then(([art, cmts]) => {
      setArticle(art)
      setComments(cmts)
    }).catch(() => navigate('/articles'))
      .finally(() => setLoading(false))
  }, [id])

  const handleLike = async () => {
    if (!article || liked) return
    await articleApi.like(article.id)
    setLiked(true)
    setArticle((a) => a ? { ...a, likeCount: a.likeCount + 1 } : a)
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentContent.trim()) return
    if (!user) { setCommentMsg('请先登录后再评论'); return }
    setSubmitting(true)
    try {
      await commentApi.add({
        articleId: Number(id),
        parentId: replyTo?.id || 0,
        replyUserId: replyTo?.userId,
        content: commentContent.trim(),
      })
      setCommentContent('')
      setReplyTo(null)
      setCommentMsg('评论成功 🎉')
      // 重新拉取评论列表，让新评论立即显示
      const [cmts, art] = await Promise.all([
        commentApi.list(Number(id)),
        articleApi.detail(Number(id)),
      ])
      setComments(cmts)
      setArticle(art)
      setTimeout(() => setCommentMsg(''), 3000)
    } catch (err: any) {
      setCommentMsg(err.message || '评论失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 渲染内容（自动兼容旧 Markdown 和新 HTML）
  const contentHtml = useMemo(() => renderContent(article?.content || ''), [article?.content])

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-10"><Loading /></div>
  if (!article) return null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 -ml-2 text-muted-foreground gap-1.5">
        <ArrowLeft size={15} />
        返回
      </Button>

      {/* Cover */}
      {article.cover && (
        <div className="w-full aspect-[2/1] rounded-xl overflow-hidden mb-8 border">
          <img src={article.cover} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {article.isTop === 1 && (
            <Badge variant="secondary" className="text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs">
              置顶
            </Badge>
          )}
          {article.categoryName && (
            <Link to={`/articles?categoryId=${article.categoryId}`}>
              <Badge variant="outline" className="text-primary border-primary/30 hover:bg-primary/5 transition-colors text-xs">
                {article.categoryName}
              </Badge>
            </Link>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-5">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User size={14} />
            {article.authorNickname}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {article.publishTime ? format(new Date(article.publishTime), 'yyyy年MM月dd日') : '-'}
          </span>
          <span className="flex items-center gap-1.5"><Eye size={14} />{article.viewCount} 阅读</span>
          <span className="flex items-center gap-1.5"><MessageCircle size={14} />{article.commentCount} 评论</span>
        </div>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {article.tags.map((t) => (
              <Link key={t.id} to={`/articles?tagId=${t.id}`}>
                <Badge variant="secondary" className="gap-1 hover:bg-secondary/80 transition-colors cursor-pointer text-xs">
                  <Tag size={10} />
                  {t.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Separator className="mb-10" />

      {/* Content */}
      <div
        className="article-content max-w-none mb-10"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      <Separator className="mb-10" />

      {/* Like */}
      <div className="flex justify-center mb-12">
        <Button
          variant={liked ? 'secondary' : 'outline'}
          size="lg"
          onClick={handleLike}
          disabled={liked}
          className={cn(
            'gap-2 px-10',
            liked && 'text-red-500 border-red-200 dark:border-red-800'
          )}
        >
          <Heart size={18} className={cn(liked && 'fill-red-500 text-red-500')} />
          {liked ? '已点赞' : '点赞'} · {article.likeCount}
        </Button>
      </div>

      {/* Comments */}
      <section>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <MessageCircle size={20} className="text-primary" />
          评论 ({article.commentCount})
        </h2>

        {/* Comment Form */}
        <form onSubmit={handleComment} className="mb-8 space-y-3">
          {replyTo && (
            <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2">
              <span>
                回复 <span className="text-primary font-medium">@{replyTo.userNickname}</span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground"
                onClick={() => setReplyTo(null)}
              >
                ×
              </Button>
            </div>
          )}
          <Textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder={user ? '写下你的想法...' : '请先登录后再评论'}
            disabled={!user}
            rows={4}
            className="resize-none text-sm"
          />
          <div className="flex items-center justify-between">
            {commentMsg ? (
              <p className="text-sm text-primary">{commentMsg}</p>
            ) : (
              <span />
            )}
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !user}
            >
              {submitting ? '提交中...' : '发表评论'}
            </Button>
          </div>
        </form>

        {/* Comment List */}
        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map((c) => (
              <CommentItem key={c.id} comment={c} articleId={article.id} onReply={setReplyTo} />
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground text-sm">
              还没有评论，快来发表第一条吧！
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
