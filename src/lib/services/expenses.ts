import { mapExpense } from '@/lib/db-mapper'
import { logActivity } from '@/lib/services/activity'
import { supabase } from '@/lib/supabase'
import type { Expense } from '@/types/ops'

export async function fetchExpenses() {
  const { data, error } = await supabase
    .from('ops_expenses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => mapExpense(row as Record<string, unknown>))
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from('ops_expenses').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await logActivity('expense_deleted', 'تم حذف مصروف')
}

export async function createExpense(payload: { name: string; amount: number }): Promise<Expense> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('غير مسجل الدخول')

  const { data, error } = await supabase
    .from('ops_expenses')
    .insert({
      user_id: user.id,
      name: payload.name,
      amount: payload.amount,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  await logActivity('expense_added', `تمت إضافة مصروف: ${payload.name}`)
  return mapExpense(data as Record<string, unknown>)
}

export async function updateExpense(
  id: string,
  payload: { name: string; amount: number },
): Promise<Expense> {
  const { data, error } = await supabase
    .from('ops_expenses')
    .update({ name: payload.name, amount: payload.amount })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  await logActivity('expense_updated', `تم تعديل مصروف: ${payload.name}`)
  return mapExpense(data as Record<string, unknown>)
}
