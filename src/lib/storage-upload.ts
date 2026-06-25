import { supabase } from '@/lib/supabase'

export async function uploadOpsImage(file: File): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('غير مسجل الدخول')

  const ext = file.name.split('.').pop() || 'webp'
  const path = `${user.id}/${Date.now()}.${ext}`

  const { error } = await supabase.storage.from('ops-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('ops-images').getPublicUrl(path)
  return data.publicUrl
}
