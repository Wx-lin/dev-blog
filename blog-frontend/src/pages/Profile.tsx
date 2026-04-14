import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Key, Save } from 'lucide-react'
import { userApi } from '@/api'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

export default function Profile() {
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()

  if (!user) { navigate('/login'); return null }

  const [form, setForm] = useState({
    nickname: user.nickname,
    email: user.email || '',
    avatar: user.avatar || '',
    oldPassword: '',
    newPassword: '',
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      const payload: any = { nickname: form.nickname, email: form.email, avatar: form.avatar }
      if (form.oldPassword) {
        payload.oldPassword = form.oldPassword
        payload.newPassword = form.newPassword
      }
      await userApi.update(payload)
      const updated = await userApi.info()
      setUser(updated)
      setMsg('保存成功')
    } catch (err: any) {
      setMsg(err.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight mb-8">个人设置</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-5">
              <Avatar className="h-16 w-16">
                <AvatarImage src={form.avatar || undefined} alt={user.nickname} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                  {user.nickname?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Label htmlFor="avatar">头像 URL</Label>
                <Input
                  id="avatar"
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <User size={16} />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nickname">昵称</Label>
                <Input
                  id="nickname"
                  value={form.nickname}
                  onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                  placeholder="显示名称"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-1.5">
                <Mail size={12} />
                用户名
                <span className="text-xs text-muted-foreground font-normal">（不可修改）</span>
              </Label>
              <Input
                id="username"
                value={user.username}
                disabled
                className="cursor-not-allowed opacity-60"
              />
            </div>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Key size={16} />
              修改密码
              <span className="text-xs text-muted-foreground font-normal">（可选）</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">当前密码</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={form.oldPassword}
                  onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
                  placeholder="不修改留空"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">新密码</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="6-20 位"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving} className="gap-2">
            <Save size={15} />
            {saving ? '保存中...' : '保存修改'}
          </Button>
          {msg && (
            <p className={`text-sm font-medium ${msg.includes('失败') ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {msg}
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
