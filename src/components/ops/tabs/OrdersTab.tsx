import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { OrderCard } from '@/components/ops/cards/OrderCard'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Order, Product } from '@/types/ops'
import { isStoreOrder } from '@/types/ops'

type StatusFilter = 'all' | 'normal' | 'urgent' | 'store' | 'pending' | 'completed' | 'cancelled'

const filters: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'normal', label: 'عادي' },
  { id: 'urgent', label: 'مستعجل' },
  { id: 'store', label: 'من المتجر' },
  { id: 'pending', label: 'معلق' },
  { id: 'completed', label: 'مكتمل' },
  { id: 'cancelled', label: 'ملغي' },
]

export function OrdersTab({
  orders,
  products,
  onComplete,
  onCancel,
  onDelete,
  onEdit,
  onDetails,
  onViewImage,
}: {
  orders: Order[]
  products: Product[]
  onComplete?: (id: string) => void
  onCancel?: (id: string) => void
  onDelete?: (id: string) => void
  onEdit?: (order: Order) => void
  onDetails?: (order: Order) => void
  onViewImage?: (src: string) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredOrders = useMemo(() => {
    let result = orders
    if (statusFilter === 'normal') {
      result = result.filter((o) => !o.isUrgent && !isStoreOrder(o))
    } else if (statusFilter === 'urgent') {
      result = result.filter((o) => o.isUrgent)
    } else if (statusFilter === 'store') {
      result = result.filter((o) => isStoreOrder(o))
    } else if (statusFilter === 'pending' || statusFilter === 'completed' || statusFilter === 'cancelled') {
      result = result.filter((o) => o.status === statusFilter)
    }
    if (!searchQuery.trim()) return result
    const q = searchQuery.toLowerCase()
    return result.filter(
      (o) =>
        o.clientName.toLowerCase().includes(q) ||
        o.clientPhone.includes(q) ||
        o.address.toLowerCase().includes(q) ||
        (o.executor?.name || '').toLowerCase().includes(q),
    )
  }, [orders, statusFilter, searchQuery])

  return (
    <div className="tab-content space-y-4">
      <h2 className="text-lg font-bold">الأوردرات</h2>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث بالاسم، الهاتف، العنوان..."
          className="pr-10 bg-card border-border h-10 rounded-xl"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setStatusFilter(f.id)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              statusFilter === f.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 pb-4">
        {filteredOrders.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">لا توجد أوردرات</p>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              products={products}
              onEdit={onEdit}
              onDelete={onDelete}
              onComplete={onComplete}
              onCancel={onCancel}
              onDetails={onDetails}
              onViewImage={onViewImage}
            />
          ))
        )}
      </div>
    </div>
  )
}
