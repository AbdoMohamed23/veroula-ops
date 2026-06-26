import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  )
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) return <AuthLoading />
  if (!session) return <Navigate to="/login" replace />

  return <>{children}</>
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) return <AuthLoading />
  if (session) return <Navigate to="/" replace />

  return <>{children}</>
}
