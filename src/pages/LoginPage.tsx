import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const { error } = await signIn(email.trim(), password)
      if (error) toast.error(error)
      else toast.success('تم تسجيل الدخول')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-background px-4"
      dir="rtl"
    >
      <div className="w-full max-w-sm space-y-8">
        <h1 className="text-center text-2xl font-bold tracking-wide">OPS</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="bg-card border-border h-12 rounded-xl"
            dir="ltr"
            autoComplete="email"
            required
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-card border-border h-12 rounded-xl"
            dir="ltr"
            autoComplete="current-password"
            required
            minLength={6}
          />
          <Button
            type="submit"
            disabled={busy}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : 'تسجيل الدخول'}
          </Button>
        </form>
      </div>
    </div>
  )
}
