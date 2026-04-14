import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import {
  X,
  Save,
  Send,
  LayoutPanelLeft,
  Edit3,
  Eye,
  Loader2,
  Image as ImageIcon,
  FolderOpen,
  Tag as TagIcon,
  AlignLeft,
  Star,
  ChevronDown,
} from 'lucide-react'
import { articleApi, categoryApi, tagApi } from '@/api'
import type { CategoryDTO, TagDTO } from '@/api'
import { useAuthStore } from '@/store/useAuthStore'
import { useThemeStore } from '@/store/useThemeStore'

type EditMode = 'split' | 'edit' | 'preview'

export default function WriteArticle() {
  const { user } = useAuthStore()
  const { dark } = useThemeStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id') ? Number(searchParams.get('id')) : undefined

  // auth guard
  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
  }, [user, navigate])

  // form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState<string>('')
  const [cover, setCover] = useState('')
  const [summary, setSummary] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [isTop, setIsTop] = useState(0)

  // meta
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [tags, setTags] = useState<TagDTO[]>([])

  // ui
  const [editMode, setEditMode] = useState<EditMode>('split')
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [catOpen, setCatOpen] = useState(false)
  const [coverErr, setCoverErr] = useState(false)

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    categoryApi.list().then(setCategories)
    tagApi.list().then(setTags)
  }, [])

  // load existing article for edit
  useEffect(() => {
    if (!editId) return
    articleApi.detail(editId).then((a) => {
      setTitle(a.title)
      setContent(a.content || '')
      setCover(a.cover || '')
      setSummary(a.summary || '')
      setCategoryId(a.categoryId || undefined)
      setSelectedTags(a.tags?.map((t) => t.id) ?? [])
      setIsTop(a.isTop ?? 0)
    })
  }, [editId])

  const doSave = async (status: 0 | 1) => {
    if (!title.trim()) { showToast('error', '请先填写文章标题'); return }
    if (!content?.trim()) { showToast('error', '文章内容不能为空'); return }
    if (!categoryId) { showToast('error', '请选择文章分类'); return }

    const setter = status === 1 ? setPublishing : setSaving
    setter(true)
    try {
      const id = await articleApi.save({
        id: editId,
        title: title.trim(),
        content: content,
        cover: cover.trim() || undefined,
        summary: summary.trim() || undefined,
        categoryId,
        tagIds: selectedTags,
        isTop,
        status,
      })
      showToast('success', status === 1 ? '发布成功！' : '草稿已保存')
      setTimeout(() => navigate(`/article/${id}`), 800)
    } catch (err: any) {
      showToast('error', err.message || '操作失败，请重试')
    } finally {
      setter(false)
    }
  }

  const toggleTag = (id: number) =>
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )

  const selectedCatName = categories.find((c) => c.id === categoryId)?.name

  if (!user) return null

  return (
    <div
      className="h-screen flex flex-col bg-white dark:bg-zinc-950 overflow-hidden"
      data-color-mode={dark ? 'dark' : 'light'}
    >
      {/* ═══════════════════ TOP BAR ═══════════════════ */}
      <header className="h-14 shrink-0 flex items-center justify-between px-5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-30">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
            {editId ? '编辑文章' : '创作新文章'}
          </span>
        </div>

        {/* Center – view mode switcher */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
          {([
            { key: 'edit', icon: <Edit3 size={14} />, label: '编辑' },
            { key: 'split', icon: <LayoutPanelLeft size={14} />, label: '分栏' },
            { key: 'preview', icon: <Eye size={14} />, label: '预览' },
          ] as { key: EditMode; icon: React.ReactNode; label: string }[]).map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setEditMode(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                editMode === key
                  ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Right – actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => doSave(0)}
            disabled={saving || publishing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            存草稿
          </button>
          <button
            onClick={() => doSave(1)}
            disabled={saving || publishing}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold bg-t-primary text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            {publishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            发布文章
          </button>
        </div>
      </header>

      {/* ═══════════════════ BODY ═══════════════════ */}
      <div className="flex flex-1 min-h-0">
        {/* ─── Editor Area ─── */}
        <div className="flex flex-col flex-1 min-w-0 border-r border-zinc-200 dark:border-zinc-800">
          {/* Title input */}
          <div className="px-10 pt-8 pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 80))}
              placeholder="输入文章标题..."
              rows={1}
              maxLength={80}
              className="w-full resize-none text-3xl font-bold text-zinc-900 dark:text-zinc-50 placeholder-zinc-300 dark:placeholder-zinc-600 bg-transparent outline-none leading-snug overflow-hidden"
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = el.scrollHeight + 'px'
              }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-zinc-400">{title.length} / 80</span>
            </div>
          </div>

          {/* MD Editor */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <MDEditor
              value={content}
              onChange={(v) => setContent(v ?? '')}
              preview={editMode === 'split' ? 'live' : editMode === 'preview' ? 'preview' : 'edit'}
              height="100%"
              style={{ height: '100%', borderRadius: 0, border: 'none' }}
              visibleDragbar={false}
              hideToolbar={false}
              className="!border-0 !rounded-none h-full"
            />
          </div>
        </div>

        {/* ─── Right Settings Panel ─── */}
        <aside className="w-72 xl:w-80 shrink-0 flex flex-col overflow-y-auto bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="p-5 space-y-6">

            {/* ── Cover Image ── */}
            <section>
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3">
                <ImageIcon size={12} />
                封面图片
              </label>
              <input
                value={cover}
                onChange={(e) => { setCover(e.target.value); setCoverErr(false) }}
                placeholder="粘贴图片 URL..."
                className="w-full text-sm px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))/30]"
              />
              {cover && !coverErr && (
                <div className="mt-2 relative rounded-xl overflow-hidden aspect-video bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={cover}
                    alt="封面预览"
                    className="w-full h-full object-cover"
                    onError={() => setCoverErr(true)}
                  />
                  <button
                    onClick={() => setCover('')}
                    className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {cover && coverErr && (
                <p className="mt-1 text-xs text-red-500">图片加载失败，请检查 URL</p>
              )}
            </section>

            {/* ── Category ── */}
            <section>
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3">
                <FolderOpen size={12} />
                分类 <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <button
                  onClick={() => setCatOpen((v) => !v)}
                   className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${
                    categoryId
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] text-zinc-800 dark:text-zinc-100'
                      : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  <span className={categoryId ? 'font-medium' : ''}>
                    {selectedCatName || '选择分类'}
                  </span>
                  <ChevronDown size={14} className={`transition-transform ${catOpen ? 'rotate-180' : ''}`} />
                </button>
                {catOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setCatOpen(false)} />
                    <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => { setCategoryId(c.id); setCatOpen(false) }}
                           className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                            categoryId === c.id
                              ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-semibold'
                              : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* ── Tags ── */}
            <section>
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3">
                <TagIcon size={12} />
                标签
              </label>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => {
                  const active = selectedTags.includes(t.id)
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTag(t.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border cursor-pointer ${
                        active
                          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500'
                      }`}
                    >
                      {active ? '✓ ' : ''}{t.name}
                    </button>
                  )
                })}
              </div>
            </section>

            {/* ── Summary ── */}
            <section>
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3">
                <AlignLeft size={12} />
                文章摘要
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value.slice(0, 200))}
                placeholder="为文章写一段简短的摘要，吸引读者点击..."
                rows={4}
                maxLength={200}
                className="w-full resize-none text-sm px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))/30] leading-relaxed"
              />
              <p className="text-right text-xs text-zinc-400 mt-1">{summary.length} / 200</p>
            </section>

            {/* ── Settings ── */}
            <section>
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3">
                <Star size={12} />
                其他设置
              </label>
              <label className="flex items-center gap-3 cursor-pointer group" style={{ cursor: 'pointer' }}>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isTop === 1}
                    onChange={(e) => setIsTop(e.target.checked ? 1 : 0)}
                    className="sr-only cursor-pointer"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${isTop ? 'bg-[hsl(var(--primary))]' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isTop ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>
                <span className="text-sm text-zinc-600 dark:text-zinc-300">置顶文章</span>
              </label>
            </section>

            {/* ── Bottom action strip ── */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
              <button
                onClick={() => doSave(1)}
                disabled={saving || publishing}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 hover:opacity-90 active:scale-95 cursor-pointer"
                style={{ backgroundColor: 'hsl(var(--primary))' }}
              >
                {publishing ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                发布文章
              </button>
              <button
                onClick={() => doSave(0)}
                disabled={saving || publishing}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                存草稿
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ═══════════════════ TOAST ═══════════════════ */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2 transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}
    </div>
  )
}
