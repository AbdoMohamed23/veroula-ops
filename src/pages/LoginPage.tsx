import { useState } from 'react'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { OpsBrand } from '@/components/ops/OpsLogo'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      if (mode === 'login') {
        const { error } = await signIn(email.trim(), password)
        if (error) toast.error(error)
        else toast.success('تم تسجيل الدخول')
      } else {
        const { error } = await signUp(email.trim(), password, name.trim() || 'مدير')
        if (error) toast.error(error)
        else toast.success('تم إنشاء الحساب — يمكنك تسجيل الدخول')
        setMode('login')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-background px-4"
      dir="rtl"
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <OpsBrand iconClassName="text-4xl" />
          <p className="text-muted-foreground text-sm">نظام إدارة الأوردرات</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-lg"
        >
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label className="text-xs text-foreground/80">الاسم</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسمك"
                className="bg-background border-border h-11 rounded-xl"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs text-foreground/80">البريد الإلكتروني</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-background border-border h-11 rounded-xl"
              dir="ltr"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-foreground/80">كلمة المرور</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-background border-border h-11 rounded-xl"
              dir="ltr"
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <LogIn className="size-4 ml-1" />
                {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
              </>
            )}
          </Button>

          <button
            type="button"
            className="w-full text-xs text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'لديك حساب؟ تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  )
}
