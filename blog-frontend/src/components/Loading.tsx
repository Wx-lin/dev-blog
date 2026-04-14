import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Loading({ text = '加载中...', className }: { text?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground', className)}>
      <Loader2 size={28} className="animate-spin" />
      <p className="text-sm">{text}</p>
    </div>
  )
}
