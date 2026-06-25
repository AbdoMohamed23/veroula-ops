import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn('Supabase: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing in .env')
}

export const supabase = createClient(url ?? '', anonKey ?? '')

export type Profile = {
  id: string
  name: string
  role: 'admin' | 'moderator'
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, role')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('fetchProfile', error.message)
    return null
  }
  return data as Profile | null
}
