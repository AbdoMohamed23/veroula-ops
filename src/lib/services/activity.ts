import { supabase } from '@/lib/supabase'

export async function logActivity(type: string, message: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('ops_activities').insert({
      user_id: user.id,
      type,
      message,
    })
  } catch (err) {
    console.error('logActivity', err)
  }
}
