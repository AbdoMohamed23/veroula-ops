import { mapExecutor } from '@/lib/db-mapper'
import { logActivity } from '@/lib/services/activity'
import { supabase } from '@/lib/supabase'
import type { Executor } from '@/types/ops'

export async function fetchExecutors() {
  const { data, error } = await supabase
    .from('ops_executors')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => mapExecutor(row as Record<string, unknown>))
}

export async function deleteExecutor(id: string) {
  const { error } = await supabase.from('ops_executors').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await logActivity('executor_deleted', 'تم حذف منفذ')
}

export async function createExecutor(payload: {
  name: string
  phone: string
  address?: string
  rating?: number
}): Promise<Executor> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('غير مسجل الدخول')

  const { data, error } = await supabase
    .from('ops_executors')
    .insert({
      user_id: user.id,
      name: payload.name,
      phone: payload.phone,
      address: payload.address ?? '',
      rating: payload.rating ?? 5,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  await logActivity('executor_created', `تم إضافة منفذ — ${payload.name}`)
  return mapExecutor(data as Record<string, unknown>)
}

export async function updateExecutor(
  id: string,
  payload: { name: string; phone: string; address?: string; rating?: number },
): Promise<Executor> {
  const { data, error } = await supabase
    .from('ops_executors')
    .update({
      name: payload.name,
      phone: payload.phone,
      address: payload.address ?? '',
      rating: payload.rating ?? 5,
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  await logActivity('executor_updated', `تم تعديل منفذ — ${payload.name}`)
  return mapExecutor(data as Record<string, unknown>)
}
