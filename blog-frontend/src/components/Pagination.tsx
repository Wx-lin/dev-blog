import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  current: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}

export default function Pagination({ current, total, pageSize, onChange }: Props) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= current - 2 && i <= current + 2)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
      >
        <ChevronLeft size={15} />
      </Button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="w-9 text-center text-muted-foreground text-sm">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={current === p ? 'default' : 'outline'}
            size="icon"
            className={cn('h-9 w-9 text-sm', current === p && 'pointer-events-none')}
            onClick={() => onChange(p as number)}
          >
            {p}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        disabled={current === totalPages}
        onClick={() => onChange(current + 1)}
      >
        <ChevronRight size={15} />
      </Button>
    </div>
  )
}
