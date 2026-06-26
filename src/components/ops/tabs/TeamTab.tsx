import { ExecutorCard } from '@/components/ops/cards/ExecutorCard'
import type { Executor, Order } from '@/types/ops'

export function TeamTab({
  executors,
  orders,
  onDelete,
  onEdit,
  onViewOrders,
}: {
  executors: Executor[]
  orders: Order[]
  onDelete?: (id: string) => void
  onEdit?: (executor: Executor) => void
  onViewOrders?: (executor: Executor) => void
}) {
  return (
    <div className="tab-content space-y-4">
      <h2 className="text-lg font-bold">الفريق</h2>

      <div className="space-y-3 pb-4">
        {executors.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">لا يوجد منفذون</p>
        ) : (
          executors.map((executor) => (
            <ExecutorCard
              key={executor.id}
              executor={executor}
              orders={orders}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewOrders={onViewOrders}
            />
          ))
        )}
      </div>
    </div>
  )
}
