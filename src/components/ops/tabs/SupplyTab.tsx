import { Zap } from 'lucide-react'
import { SupplyOrderCard } from '@/components/ops/cards/SupplyOrderCard'
import { formatCurrency } from '@/lib/format'
import type { Stats, SupplyOrder } from '@/types/ops'

export function SupplyTab({
  supplyOrders,
  stats,
  onComplete,
  onCancel,
  onDelete,
  onEdit,
}: {
  supplyOrders: SupplyOrder[]
  stats: Stats
  onComplete?: (id: string) => void
  onCancel?: (id: string) => void
  onDelete?: (id: string) => void
  onEdit?: (order: SupplyOrder) => void
}) {
  const pending = supplyOrders.filter((o) => o.status === 'pending')
  const completed = supplyOrders.filter((o) => o.status === 'completed')

  return (
    <div className="tab-content space-y-4">
      <h2 className="text-lg font-bold">مشترياتي</h2>

      <div className="flex gap-2">
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          {pending.length} معلق
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
          {completed.length} مكتمل
        </span>
      </div>

      {(stats.pendingSupplyDeposits ?? 0) > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2">
          <Zap className="size-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-foreground text-xs font-medium">تنبيه عربونات معلقة</p>
            <p className="text-amber-400 text-sm font-bold">
              {formatCurrency(stats.pendingSupplyDeposits ?? 0)}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3 pb-4">
        {supplyOrders.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">لا توجد مشتريات</p>
        ) : (
          supplyOrders.map((order) => (
            <SupplyOrderCard
              key={order.id}
              order={order}
              onEdit={onEdit}
              onDelete={onDelete}
              onComplete={onComplete}
              onCancel={onCancel}
            />
          ))
        )}
      </div>
    </div>
  )
}
