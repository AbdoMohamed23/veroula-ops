import type {
  Activity,
  Executor,
  Expense,
  ModeratorPaymentRecord,
  Order,
  Product,
  SupplyOrder,
  OwnerDebt,
} from '@/types/ops'

function num(v: unknown): number {
  return Number(v) || 0
}

export function mapExecutor(row: Record<string, unknown>): Executor {
  return {
    id: String(row.id),
    name: String(row.name),
    phone: String(row.phone ?? ''),
    address: String(row.address ?? ''),
    rating: Number(row.rating) || 5,
    userId: String(row.user_id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

export function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: row.slug != null ? String(row.slug) : null,
    description: String(row.description ?? ''),
    price: num(row.price),
    discountPrice: row.discount_price != null ? num(row.discount_price) : null,
    costPrice: num(row.cost_price),
    image: String(row.image ?? ''),
    stock: Number(row.stock) || 0,
    userId: String(row.user_id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

export function mapOrder(row: Record<string, unknown>): Order {
  const executor = row.executor as Record<string, unknown> | null | undefined
  const product = row.product as Record<string, unknown> | null | undefined

  let executorsDetail = null
  if (row.customer_meta) {
    try {
      const meta = JSON.parse(String(row.customer_meta))
      if (Array.isArray(meta.executors_detail)) {
        executorsDetail = meta.executors_detail
      }
    } catch {}
  }

  return {
    id: String(row.id),
    images: String(row.images ?? '[]'),
    clientName: String(row.client_name),
    clientPhone: String(row.client_phone ?? ''),
    address: String(row.address ?? ''),
    totalPrice: num(row.total_price),
    deposit: num(row.deposit),
    remaining: num(row.remaining),
    shippingCost: num(row.shipping_cost),
    executorId: row.executor_id != null ? String(row.executor_id) : null,
    executorPrice: num(row.executor_price),
    executorDeposit: num(row.executor_deposit),
    executorRemaining: num(row.executor_remaining),
    moderatorCommission: num(row.moderator_commission),
    deliveryPeriod: String(row.delivery_period ?? ''),
    netProfit: num(row.net_profit),
    status: row.status as Order['status'],
    isUrgent: Boolean(row.is_urgent),
    productId: row.product_id != null ? String(row.product_id) : null,
    userId: String(row.user_id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    executor: executor && executor.id ? mapExecutor(executor) : null,
    executorsDetail,
    product: product && product.id ? mapProduct(product) : null,
    source: row.source != null ? String(row.source) : undefined,
    externalOrderId: row.external_order_id != null ? String(row.external_order_id) : null,
    orderItems: row.order_items != null ? String(row.order_items) : undefined,
    websiteNote: row.website_note != null ? String(row.website_note) : null,
    governorate: row.governorate != null ? String(row.governorate) : undefined,
    customerMeta: row.customer_meta != null ? String(row.customer_meta) : null,
    notes: row.notes != null ? String(row.notes) : null,
  }
}

export function mapExpense(row: Record<string, unknown>): Expense {
  return {
    id: String(row.id),
    name: String(row.name),
    amount: num(row.amount),
    userId: String(row.user_id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

export function mapSupplyOrder(row: Record<string, unknown>): SupplyOrder {
  return {
    id: String(row.id),
    images: String(row.images ?? '[]'),
    executorName: String(row.executor_name),
    phone: String(row.phone ?? ''),
    address: String(row.address ?? ''),
    price: num(row.price),
    deposit: num(row.deposit),
    shippingCost: num(row.shipping_cost),
    remaining: num(row.remaining),
    deliveryDate: String(row.delivery_date ?? ''),
    status: row.status as SupplyOrder['status'],
    userId: String(row.user_id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

export function mapModeratorPayment(row: Record<string, unknown>): ModeratorPaymentRecord {
  return {
    id: String(row.id),
    amount: num(row.amount),
    screenshot: row.screenshot != null ? String(row.screenshot) : null,
    userId: String(row.user_id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

export function mapActivity(row: Record<string, unknown>): Activity {
  return {
    id: String(row.id),
    type: String(row.type),
    message: String(row.message),
    userId: String(row.user_id),
    createdAt: String(row.created_at),
  }
}

export function mapOwnerDebt(row: Record<string, unknown>): OwnerDebt {
  return {
    id: String(row.id),
    owner: row.owner as 'abdo' | 'osha',
    type: row.type as 'withdraw' | 'repay' | 'ops_owes',
    name: String(row.name),
    amount: num(row.amount),
    userId: String(row.user_id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

