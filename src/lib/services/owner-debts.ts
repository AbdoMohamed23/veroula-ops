import { mapOwnerDebt } from '@/lib/db-mapper'
import { logActivity } from '@/lib/services/activity'
import { supabase } from '@/lib/supabase'
import type { OwnerDebt } from '@/types/ops'

export async function fetchOwnerDebts(): Promise<OwnerDebt[]> {
  const { data, error } = await supabase
    .from('ops_owner_debts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => mapOwnerDebt(row as Record<string, unknown>))
}

export async function deleteOwnerDebt(id: string) {
  const { error } = await supabase.from('ops_owner_debts').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await logActivity('owner_debt_deleted', 'تم حذف دين للمالكين')
}

export async function createOwnerDebt(payload: { name: string; amount: number }): Promise<OwnerDebt> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('غير مسجل الدخول')

  const { data, error } = await supabase
    .from('ops_owner_debts')
    .insert({
      user_id: user.id,
      name: payload.name,
      amount: payload.amount,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  await logActivity('owner_debt_added', `تمت إضافة دين مالكين: ${payload.name} بقيمة ${payload.amount} ج.م`)
  return mapOwnerDebt(data as Record<string, unknown>)
}

export async function updateOwnerDebt(
  id: string,
  payload: { name: string; amount: number },
): Promise<OwnerDebt> {
  const { data, error } = await supabase
    .from('ops_owner_debts')
    .update({ name: payload.name, amount: payload.amount })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  await logActivity('owner_debt_updated', `تم تعديل دين مالكين: ${payload.name} بقيمة ${payload.amount} ج.م`)
  return mapOwnerDebt(data as Record<string, unknown>)
}
