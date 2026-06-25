import { mapActivity } from '@/lib/db-mapper'
import { supabase } from '@/lib/supabase'

export async function fetchActivities(limit = 20) {
  const { data, error } = await supabase
    .from('ops_activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => mapActivity(row as Record<string, unknown>))
}
