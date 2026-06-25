import { mapProduct } from '@/lib/db-mapper'
import { logActivity } from '@/lib/services/activity'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/ops'

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('ops_products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => mapProduct(row as Record<string, unknown>))
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('ops_products').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await logActivity('product_deleted', 'تم حذف منتج')
}

export async function createProduct(payload: {
  name: string
  description?: string
  price: number
  costPrice: number
  stock: number
  image?: string
}): Promise<Product> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('غير مسجل الدخول')

  const { data, error } = await supabase
    .from('ops_products')
    .insert({
      user_id: user.id,
      name: payload.name,
      description: payload.description ?? '',
      price: payload.price,
      cost_price: payload.costPrice,
      stock: payload.stock,
      image: payload.image ?? '',
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  await logActivity('product_created', `تم إضافة منتج — ${payload.name}`)
  return mapProduct(data as Record<string, unknown>)
}

export async function updateProduct(
  id: string,
  payload: Partial<{
    name: string
    description: string
    price: number
    costPrice: number
    stock: number
    image: string
  }>,
): Promise<Product> {
  const row: Record<string, unknown> = {}
  if (payload.name != null) row.name = payload.name
  if (payload.description != null) row.description = payload.description
  if (payload.price != null) row.price = payload.price
  if (payload.costPrice != null) row.cost_price = payload.costPrice
  if (payload.stock != null) row.stock = payload.stock
  if (payload.image != null) row.image = payload.image

  const { data, error } = await supabase
    .from('ops_products')
    .update(row)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  await logActivity('product_updated', `تم تعديل منتج — ${payload.name ?? ''}`)
  return mapProduct(data as Record<string, unknown>)
}
