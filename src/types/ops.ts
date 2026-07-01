export type TabId = 'dashboard' | 'orders' | 'supply' | 'catalog' | 'team' | 'moderator'
export type OrderStatus = 'pending' | 'completed' | 'cancelled'

export interface Executor {
  id: string
  name: string
  phone: string
  address?: string
  rating: number
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  slug?: string | null
  description: string
  price: number
  discountPrice: number | null
  costPrice: number
  image: string
  stock: number
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  images: string
  clientName: string
  clientPhone: string
  address: string
  totalPrice: number
  deposit: number
  remaining: number
  shippingCost: number
  executorId: string | null
  executorPrice: number
  executorDeposit: number
  executorRemaining: number
  moderatorCommission: number
  deliveryPeriod: string
  netProfit: number
  status: OrderStatus
  isUrgent: boolean
  productId: string | null
  userId: string
  createdAt: string
  updatedAt: string
  executor?: Executor | null
  product?: Product | null
  source?: string
  externalOrderId?: string | null
  orderItems?: string
  websiteNote?: string | null
  governorate?: string
  customerMeta?: string | null
}

export interface Expense {
  id: string
  name: string
  amount: number
  userId: string
  createdAt: string
  updatedAt: string
}

export interface SupplyOrder {
  id: string
  images: string
  executorName: string
  phone: string
  address: string
  price: number
  deposit: number
  shippingCost: number
  remaining: number
  deliveryDate: string
  status: OrderStatus
  userId: string
  createdAt: string
  updatedAt: string
}

export interface OwnerDebt {
  id: string
  owner: 'abdo' | 'osha'
  type: 'withdraw' | 'repay' | 'ops_owes'
  name: string
  amount: number
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Stats {
  initialCapital: number
  totalAvailableCapital: number
  totalNetProfitAllTime: number
  totalExpensesAllTime: number
  totalOwnerDebtsAllTime: number
  abdoBalance: number
  oshaBalance: number
  currentMonthProfit: number
  currentMonthExpenses: number
  pendingOrdersCount: number
  completedOrdersCount: number
  totalExecutors: number
  executorDebts: {
    executorId: string
    executorName: string
    totalRemaining: number
  }[]
  moderatorDue: number
  currentMonthModeratorPaid: number
  pendingSupplyOrdersCount: number
  supplyPurchasesTotal?: number
  pendingSupplyDeposits?: number
  pendingCashflow?: number
  totalModeratorPaymentsAllTime?: number
  balanceBreakdown?: {
    label: string
    amount: number
    type: 'add' | 'subtract'
  }[]
  monthlyHistory: {
    monthStr: string
    profit: number
    expenses: number
  }[]
}

export interface Activity {
  id: string
  type: string
  message: string
  userId: string
  createdAt: string
}

export interface ModeratorPaymentRecord {
  id: string
  amount: number
  screenshot?: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

export function isStoreOrder(order: Order) {
  return order.source === 'veroula_store'
}

