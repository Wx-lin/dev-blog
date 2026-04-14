import { Heart } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function Footer() {
  return (
    <footer className="mt-20">
      <Separator />
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-1.5">
          Made with <Heart size={13} className="text-red-400 fill-red-400" /> by DevBlog
        </p>
        <p className="mt-1 text-xs">© {new Date().getFullYear()} All rights reserved.</p>
      </div>
    </footer>
  )
}
