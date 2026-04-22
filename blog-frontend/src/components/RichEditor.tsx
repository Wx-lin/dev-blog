/**
 * RichEditor — 基于 Tiptap v3 的富文本编辑器
 * 支持：粗体/斜体/下划线、标题、引用、代码块、表格（列宽拖拽）、图片上传、链接
 */
import { useEffect, useRef, useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered,
  Quote, Code, Minus,
  Table as TableIcon,
  Image as ImageIcon, Link as LinkIcon,
  Undo, Redo,
} from 'lucide-react'

const lowlight = createLowlight(common)

// ─── 表格列宽拖拽 Hook ────────────────────────────────────────────────────────
function useTableColResize(editorEl: HTMLElement | null) {
  useEffect(() => {
    if (!editorEl) return

    let currentHandle: HTMLElement | null = null
    let currentCell: HTMLElement | null = null
    let isDragging = false

    function removeHandle() {
      if (currentHandle) {
        currentHandle.remove()
        currentHandle = null
        currentCell = null
      }
    }

    function onMouseMove(e: MouseEvent) {
      if (isDragging) return
      const target = e.target as HTMLElement
      // 鼠标在手柄上时不处理
      if (target === currentHandle || target.getAttribute('data-col-resize') === '1') return

      const cell = target.closest('th, td') as HTMLElement | null
      if (!cell) { removeHandle(); return }
      if (cell === currentCell) return

      removeHandle()
      currentCell = cell

      if (getComputedStyle(cell).position === 'static') {
        cell.style.position = 'relative'
      }

      const handle = document.createElement('div')
      handle.setAttribute('data-col-resize', '1')
      handle.style.cssText = [
        'position:absolute',
        'top:0',
        'right:-3px',
        'bottom:0',
        'width:6px',
        'cursor:col-resize',
        'z-index:30',
        'background:transparent',
        'user-select:none',
        '-webkit-user-select:none',
      ].join(';')
      cell.appendChild(handle)
      currentHandle = handle

      handle.addEventListener('mouseenter', () => {
        if (!isDragging) {
          handle.style.background = 'rgba(0,120,212,0.4)'
          handle.style.borderRadius = '2px'
        }
      })
      handle.addEventListener('mouseleave', () => {
        if (!isDragging) handle.style.background = 'transparent'
      })
      handle.addEventListener('mousedown', (down: MouseEvent) => {
        down.preventDefault()
        down.stopPropagation()
        isDragging = true
        handle.style.background = 'rgba(0,120,212,0.6)'

        const startX = down.clientX
        const startW = cell.getBoundingClientRect().width

        function onDrag(mv: MouseEvent) {
          if (!cell) return
          const newW = Math.max(40, startW + (mv.clientX - startX))
          cell.style.width = newW + 'px'
          cell.style.minWidth = newW + 'px'
        }
        function onUp() {
          isDragging = false
          if (currentHandle) currentHandle.style.background = 'transparent'
          document.removeEventListener('mousemove', onDrag)
          document.removeEventListener('mouseup', onUp)
        }
        document.addEventListener('mousemove', onDrag)
        document.addEventListener('mouseup', onUp)
      })
    }

    function onMouseLeave() {
      if (!isDragging) removeHandle()
    }

    editorEl.addEventListener('mousemove', onMouseMove)
    editorEl.addEventListener('mouseleave', onMouseLeave)

    return () => {
      editorEl.removeEventListener('mousemove', onMouseMove)
      editorEl.removeEventListener('mouseleave', onMouseLeave)
      removeHandle()
    }
  }, [editorEl])
}

// ─── 工具栏按钮 ──────────────────────────────────────────────────────────────
function ToolBtn({
  active, disabled, onClick, title, children,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`p-1.5 rounded text-sm transition-colors cursor-pointer ${
        active
          ? 'bg-zinc-200 dark:bg-zinc-600 text-zinc-900 dark:text-white'
          : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-0.5 shrink-0" />
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────
interface RichEditorProps {
  value: string
  onChange: (html: string) => void
  onUploadImage?: (file: File) => Promise<string>
  placeholder?: string
  dark?: boolean
}

export default function RichEditor({
  value,
  onChange,
  onUploadImage,
  placeholder = '开始写作...',
}: RichEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorWrapRef = useRef<HTMLDivElement>(null)
  // 持有 .tiptap DOM，用于注册列宽拖拽
  const [editorDom, setEditorDom] = useState<HTMLElement | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: { class: 'outline-none min-h-full px-10 py-8' },
      handlePaste(view, event) {
        const items = event.clipboardData?.items
        if (!items || !onUploadImage) return false
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile()
            if (file) {
              event.preventDefault()
              onUploadImage(file).then((url) => {
                const { schema, tr } = view.state
                view.dispatch(tr.replaceSelectionWith(schema.nodes.image.create({ src: url }), false))
              })
              return true
            }
          }
        }
        return false
      },
      handleDrop(view, event) {
        const files = event.dataTransfer?.files
        if (!files || !onUploadImage) return false
        for (const file of files) {
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })
            if (!coords) return false
            onUploadImage(file).then((url) => {
              const { schema } = view.state
              view.dispatch(view.state.tr.insert(coords.pos, schema.nodes.image.create({ src: url })))
            })
            return true
          }
        }
        return false
      },
    },
  })

  // ── editor 挂载后，拿到 .tiptap DOM 元素注册拖拽 ──
  useEffect(() => {
    if (!editor || !editorWrapRef.current) return
    const el = editorWrapRef.current.querySelector('.tiptap') as HTMLElement | null
    setEditorDom(el)
  }, [editor])

  // ── 注入列宽拖拽 ──
  useTableColResize(editorDom)

  // ── 同步外部 value（加载已有文章） ──
  const lastValue = useRef(value)
  useEffect(() => {
    if (!editor) return
    if (value !== lastValue.current) {
      lastValue.current = value
      if (editor.getHTML() !== value) {
        editor.commands.setContent(value || '')
      }
    }
  }, [value, editor])

  const insertImage = useCallback(() => fileInputRef.current?.click(), [])

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !onUploadImage || !editor) return
      e.target.value = ''
      try {
        const url = await onUploadImage(file)
        editor.chain().focus().setImage({ src: url }).run()
      } catch { /* 错误由父组件处理 */ }
    },
    [onUploadImage, editor]
  )

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('输入链接地址', prev || '')
    if (url === null) return
    if (url === '') editor.chain().focus().unsetLink().run()
    else editor.chain().focus().setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="flex flex-col h-full">
      {/* ── 工具栏 ── */}
      <div className="shrink-0 flex flex-wrap items-center gap-0.5 px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <ToolBtn title="撤销" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={14} />
        </ToolBtn>
        <ToolBtn title="重做" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={14} />
        </ToolBtn>
        <Divider />
        <ToolBtn title="一级标题" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 size={14} />
        </ToolBtn>
        <ToolBtn title="二级标题" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={14} />
        </ToolBtn>
        <ToolBtn title="三级标题" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={14} />
        </ToolBtn>
        <Divider />
        <ToolBtn title="粗体" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={14} />
        </ToolBtn>
        <ToolBtn title="斜体" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={14} />
        </ToolBtn>
        <ToolBtn title="下划线" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={14} />
        </ToolBtn>
        <ToolBtn title="删除线" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={14} />
        </ToolBtn>
        <Divider />
        <ToolBtn title="左对齐" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft size={14} />
        </ToolBtn>
        <ToolBtn title="居中" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter size={14} />
        </ToolBtn>
        <ToolBtn title="右对齐" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight size={14} />
        </ToolBtn>
        <Divider />
        <ToolBtn title="无序列表" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={14} />
        </ToolBtn>
        <ToolBtn title="有序列表" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={14} />
        </ToolBtn>
        <Divider />
        <ToolBtn title="引用" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={14} />
        </ToolBtn>
        <ToolBtn title="行内代码" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code size={14} />
        </ToolBtn>
        <ToolBtn title="代码块" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <span className="font-mono text-xs leading-none">{'</>'}</span>
        </ToolBtn>
        <ToolBtn title="分割线" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={14} />
        </ToolBtn>
        <Divider />
        <ToolBtn
          title="插入表格"
          active={editor.isActive('table')}
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          <TableIcon size={14} />
        </ToolBtn>
        <Divider />
        <ToolBtn title="上传图片" onClick={insertImage}>
          <ImageIcon size={14} />
        </ToolBtn>
        <ToolBtn title="插入链接" active={editor.isActive('link')} onClick={setLink}>
          <LinkIcon size={14} />
        </ToolBtn>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── 编辑区 ── */}
      <div ref={editorWrapRef} className="flex-1 min-h-0 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
}
