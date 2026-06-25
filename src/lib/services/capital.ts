import { supabase } from '@/lib/supabase'
import { logActivity } from '@/lib/services/activity'

export async function fetchCapitalAmount(): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 0

  const { data, error } = await supabase
    .from('ops_capitals')
    .select('amount')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return Number(data?.amount) || 0
}

export async function updateCapitalAmount(amount: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('غير مسجل الدخول')

  const { error } = await supabase
    .from('ops_capitals')
    .upsert({ user_id: user.id, amount }, { onConflict: 'user_id' })

  if (error) throw new Error(error.message)
  await logActivity('capital_updated', `تم تحديث رأس المال — ${amount} ج.م`)
}
