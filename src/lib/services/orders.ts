import { mapOrder } from '@/lib/db-mapper'
import { logActivity } from '@/lib/services/activity'
import { supabase } from '@/lib/supabase'
import type { Order, OrderExecutorItem, OrderStatus } from '@/types/ops'

const ORDER_SELECT = `
  *,
  executor:ops_executors(*),
  product:ops_products(*)
`

export async function fetchOrders(status?: OrderStatus) {
  let q = supabase
    .from('ops_orders')
    .select(ORDER_SELECT)
    .order('created_at', { ascending: false })

  if (status) q = q.eq('status', status)

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => mapOrder(row as Record<string, unknown>))
}

export async function updateOrderStatus(id: string, status: OrderStatus, label: string) {
  if (status === 'cancelled') {
    const { data: existing } = await supabase
      .from('ops_orders')
      .select('status, is_urgent, product_id')
      .eq('id', id)
      .single()

    if (
      existing?.status === 'pending' &&
      existing.is_urgent &&
      existing.product_id
    ) {
      await incrementProductStock(existing.product_id)
    }
  }

  const { error } = await supabase.from('ops_orders').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  await logActivity('order_status', label)
}

export async function deleteOrder(id: string) {
  const { error } = await supabase.from('ops_orders').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await logActivity('order_deleted', 'تم حذف أوردر')
}

export type OrderMutationPayload = Partial<{
  clientName: string
  clientPhone: string
  address: string
  totalPrice: number
  deposit: number
  shippingCost: number
  executorId: string | null
  executorPrice: number
  executorDeposit: number
  moderatorCommission: number
  deliveryPeriod: string
  status: OrderStatus
  isUrgent: boolean
  productId: string | null
  images: string
  executorsDetail?: OrderExecutorItem[] | null
  customerMeta?: string | null
  notes?: string | null
}>

function calcOrderFields(payload: OrderMutationPayload) {
  const totalPrice = Number(payload.totalPrice) || 0
  const deposit = Number(payload.deposit) || 0
  const shippingCost = Number(payload.shippingCost) || 0
  
  let executorPrice = Number(payload.executorPrice) || 0
  let executorDeposit = Number(payload.executorDeposit) || 0

  if (payload.executorsDetail && payload.executorsDetail.length > 0) {
    executorPrice = payload.executorsDetail.reduce((sum, e) => sum + (Number(e.price) || 0), 0)
    executorDeposit = payload.executorsDetail.reduce((sum, e) => sum + (Number(e.deposit) || 0), 0)
  }

  const moderatorCommission = Number(payload.moderatorCommission) || 0
  const isUrgent = Boolean(payload.isUrgent)
  const remaining = totalPrice - deposit
  const executorRemaining = executorPrice - executorDeposit
  const netProfit = isUrgent
    ? totalPrice
    : totalPrice - executorPrice - moderatorCommission

  return {
    total_price: totalPrice,
    deposit,
    remaining,
    shipping_cost: shippingCost,
    executor_price: executorPrice,
    executor_deposit: executorDeposit,
    executor_remaining: executorRemaining,
    moderator_commission: moderatorCommission,
    net_profit: netProfit,
  }
}

async function decrementProductStock(productId: string) {
  const { data: product, error: fetchErr } = await supabase
    .from('ops_products')
    .select('stock')
    .eq('id', productId)
    .single()

  if (fetchErr || !product) throw new Error('المنتج غير موجود')
  if (product.stock <= 0) throw new Error('المنتج غير متوفر في المخزون')

  const { error } = await supabase
    .from('ops_products')
    .update({ stock: product.stock - 1 })
    .eq('id', productId)

  if (error) throw new Error(error.message)
}

async function incrementProductStock(productId: string) {
  const { data: product, error: fetchErr } = await supabase
    .from('ops_products')
    .select('stock')
    .eq('id', productId)
    .single()

  if (fetchErr || !product) return

  await supabase
    .from('ops_products')
    .update({ stock: product.stock + 1 })
    .eq('id', productId)
}

async function adjustStoreOrderStock(orderItemsJson: string, direction: 'restore' | 'deduct') {
  let items: { catalog_id?: string | null; quantity?: number; from_catalog?: boolean }[] = []
  try {
    items = JSON.parse(orderItemsJson || '[]')
  } catch {
    return
  }

  for (const item of items) {
    if (!item.catalog_id || item.from_catalog === false) continue
    const qty = Number(item.quantity) || 1
    const { data: product } = await supabase
      .from('ops_products')
      .select('stock')
      .eq('id', item.catalog_id)
      .single()
    if (!product) continue

    if (direction === 'restore') {
      await supabase
        .from('ops_products')
        .update({ stock: product.stock + qty })
        .eq('id', item.catalog_id)
    } else {
      if (product.stock < qty) {
        throw new Error(`المخزون غير كافٍ للمنتج (المتاح: ${product.stock})`)
      }
      await supabase
        .from('ops_products')
        .update({ stock: product.stock - qty })
        .eq('id', item.catalog_id)
    }
  }
}

async function applyStatusStockChange(
  existing: {
    status: string
    is_urgent: boolean
    product_id: string | null
    source: string
    order_items: string
  },
  newStatus: OrderStatus,
) {
  if (existing.status === newStatus) return

  const wasPending = existing.status === 'pending'
  const wasCancelled = existing.status === 'cancelled'

  if (wasPending && newStatus === 'cancelled') {
    if (existing.is_urgent && existing.product_id) {
      await incrementProductStock(existing.product_id)
    }
    if (existing.source === 'veroula_store') {
      await adjustStoreOrderStock(existing.order_items, 'restore')
    }
  }

  if (wasCancelled && newStatus === 'pending') {
    if (existing.is_urgent && existing.product_id) {
      await decrementProductStock(existing.product_id)
    }
    if (existing.source === 'veroula_store') {
      await adjustStoreOrderStock(existing.order_items, 'deduct')
    }
  }
}

export async function createOrder(payload: OrderMutationPayload & Record<string, unknown>): Promise<Order> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('غير مسجل الدخول')

  const isUrgent = Boolean(payload.isUrgent)
  const productId = (payload.productId as string | null) ?? null

  if (isUrgent && productId) {
    await decrementProductStock(productId)
  }

  const calc = calcOrderFields(payload)

  let customerMetaObj: Record<string, unknown> = {}
  if (payload.customerMeta) {
    try { customerMetaObj = JSON.parse(payload.customerMeta) } catch {}
  }
  if (payload.executorsDetail && payload.executorsDetail.length > 0) {
    customerMetaObj.executors_detail = payload.executorsDetail
  }

  const { data, error } = await supabase
    .from('ops_orders')
    .insert({
      user_id: user.id,
      client_name: payload.clientName,
      client_phone: payload.clientPhone ?? '',
      address: payload.address ?? '',
      executor_id: payload.executorId ?? null,
      delivery_period: payload.deliveryPeriod ?? '',
      status: (payload.status as string) ?? 'pending',
      is_urgent: isUrgent,
      product_id: productId,
      images: (payload.images as string) ?? '[]',
      notes: (payload.notes as string) ?? null,
      customer_meta: Object.keys(customerMetaObj).length > 0 ? JSON.stringify(customerMetaObj) : null,
      ...calc,
    })
    .select(ORDER_SELECT)
    .single()

  if (error) {
    if (isUrgent && productId) {
      await incrementProductStock(productId).catch(() => {})
    }
    throw new Error(error.message)
  }

  const label = isUrgent ? ' (بيع كتالوج)' : ''
  await logActivity('order_created', `تم إنشاء أوردر — ${payload.clientName}${label}`)
  return mapOrder(data as Record<string, unknown>)
}

export async function updateOrder(id: string, payload: OrderMutationPayload & Record<string, unknown>): Promise<Order> {
  const { data: existing } = await supabase
    .from('ops_orders')
    .select('status, is_urgent, product_id, source, order_items, customer_meta')
    .eq('id', id)
    .single()

  if (payload.status && existing) {
    await applyStatusStockChange(existing, payload.status as OrderStatus)
  }

  const calc = calcOrderFields(payload)

  let customerMetaObj: Record<string, unknown> = {}
  if (existing?.customer_meta) {
    try { customerMetaObj = JSON.parse(existing.customer_meta) } catch {}
  } else if (payload.customerMeta) {
    try { customerMetaObj = JSON.parse(payload.customerMeta) } catch {}
  }

  if (payload.executorsDetail !== undefined) {
    if (payload.executorsDetail && payload.executorsDetail.length > 0) {
      customerMetaObj.executors_detail = payload.executorsDetail
    } else {
      delete customerMetaObj.executors_detail
    }
  }

  const { data, error } = await supabase
    .from('ops_orders')
    .update({
      ...(payload.clientName != null ? { client_name: payload.clientName } : {}),
      ...(payload.clientPhone != null ? { client_phone: payload.clientPhone } : {}),
      ...(payload.address != null ? { address: payload.address } : {}),
      ...(payload.executorId !== undefined ? { executor_id: payload.executorId } : {}),
      ...(payload.deliveryPeriod != null ? { delivery_period: payload.deliveryPeriod } : {}),
      ...(payload.status != null ? { status: payload.status } : {}),
      ...(payload.isUrgent != null ? { is_urgent: payload.isUrgent } : {}),
      ...(payload.productId !== undefined ? { product_id: payload.productId } : {}),
      ...(payload.images != null ? { images: payload.images as string } : {}),
      ...(payload.notes !== undefined ? { notes: payload.notes as string | null } : {}),
      customer_meta: Object.keys(customerMetaObj).length > 0 ? JSON.stringify(customerMetaObj) : null,
      ...calc,
    })
    .eq('id', id)
    .select(ORDER_SELECT)
    .single()

  if (error) throw new Error(error.message)
  await logActivity('order_updated', `تم تعديل أوردر — ${payload.clientName ?? ''}`)
  return mapOrder(data as Record<string, unknown>)
}
