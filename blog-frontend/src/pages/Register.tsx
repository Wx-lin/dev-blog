import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PenLine } from 'lucide-react'
import { userApi } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const fields = [
  { key: 'username', label: '用户名', placeholder: '4-20位字母数字', type: 'text', required: true },
  { key: 'nickname', label: '昵称', placeholder: '显示名称', type: 'text', required: true },
  { key: 'password', label: '密码', placeholder: '6-20位', type: 'password', required: true },
  { key: 'email', label: '邮箱（可选）', placeholder: 'your@email.com', type: 'email', required: false },
]

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', nickname: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await userApi.register(form)
      navigate('/login', { state: { msg: '注册成功，请登录' } })
    } catch (err: any) {
      setError(err.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground shadow-sm mb-4">
            <PenLine size={22} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">创建账号</h1>
          <p className="text-muted-foreground mt-1 text-sm">加入我们，开始你的探索之旅</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">注册信息</CardTitle>
              <CardDescription>填写以下信息完成注册</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                  {error}
                </div>
              )}
              {fields.map((f) => (
                <div key={f.key} className="space-y-2">
                  <Label htmlFor={f.key}>{f.label}</Label>
                  <Input
                    id={f.key}
                    type={f.type}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    required={f.required}
                  />
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex-col gap-4 pt-0">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '注册中...' : '注册'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                已有账号？{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  立即登录
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
