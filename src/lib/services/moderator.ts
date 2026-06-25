import { mapModeratorPayment } from '@/lib/db-mapper'
import { logActivity } from '@/lib/services/activity'
import { supabase } from '@/lib/supabase'
import type { ModeratorPaymentRecord } from '@/types/ops'

export async function fetchModeratorPayments() {
  const { data, error } = await supabase
    .from('ops_moderator_payments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => mapModeratorPayment(row as Record<string, unknown>))
}

export async function createModeratorPayment(payload: {
  amount: number
  screenshot?: string | null
}): Promise<ModeratorPaymentRecord> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('غير مسجل الدخول')

  const { data, error } = await supabase
    .from('ops_moderator_payments')
    .insert({
      user_id: user.id,
      amount: payload.amount,
      screenshot: payload.screenshot ?? null,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  await logActivity('moderator_payment', `تسديد للمودريتور — ${payload.amount} ج.م`)
  return mapModeratorPayment(data as Record<string, unknown>)
}
