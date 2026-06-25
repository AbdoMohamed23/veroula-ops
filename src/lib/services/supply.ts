import { mapSupplyOrder } from '@/lib/db-mapper'
import { logActivity } from '@/lib/services/activity'
import { supabase } from '@/lib/supabase'
import type { OrderStatus, SupplyOrder } from '@/types/ops'

export async function fetchSupplyOrders() {
  const { data, error } = await supabase
    .from('ops_supply_orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => mapSupplyOrder(row as Record<string, unknown>))
}

export async function updateSupplyOrderStatus(id: string, status: OrderStatus) {
  const { error } = await supabase.from('ops_supply_orders').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  await logActivity('supply_status', `تم تحديث حالة مشتريات — ${status}`)
}

export async function deleteSupplyOrder(id: string) {
  const { error } = await supabase.from('ops_supply_orders').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await logActivity('supply_deleted', 'تم حذف طلب توريد')
}

export async function createSupplyOrder(payload: {
  executorName: string
  phone: string
  address?: string
  price: number
  deposit: number
  shippingCost: number
  deliveryDate?: string
  images?: string
}): Promise<SupplyOrder> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('غير مسجل الدخول')

  const remaining = payload.price - payload.deposit
  const { data, error } = await supabase
    .from('ops_supply_orders')
    .insert({
      user_id: user.id,
      executor_name: payload.executorName,
      phone: payload.phone,
      address: payload.address ?? '',
      price: payload.price,
      deposit: payload.deposit,
      shipping_cost: payload.shippingCost,
      remaining,
      delivery_date: payload.deliveryDate ?? '',
      images: payload.images ?? '[]',
      status: 'pending',
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  await logActivity('supply_created', `مشتريات جديدة — ${payload.executorName}`)
  return mapSupplyOrder(data as Record<string, unknown>)
}

export async function updateSupplyOrder(
  id: string,
  payload: {
    executorName: string
    phone: string
    address?: string
    price: number
    deposit: number
    shippingCost: number
    deliveryDate?: string
    images?: string
  },
): Promise<SupplyOrder> {
  const remaining = payload.price - payload.deposit
  const { data, error } = await supabase
    .from('ops_supply_orders')
    .update({
      executor_name: payload.executorName,
      phone: payload.phone,
      address: payload.address ?? '',
      price: payload.price,
      deposit: payload.deposit,
      shipping_cost: payload.shippingCost,
      remaining,
      delivery_date: payload.deliveryDate ?? '',
      images: payload.images,
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  await logActivity('supply_updated', `تم تعديل مشتريات — ${payload.executorName}`)
  return mapSupplyOrder(data as Record<string, unknown>)
}
