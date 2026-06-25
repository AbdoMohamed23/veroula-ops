import { Edit3, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/ops/StarRating'
import type { Executor, Order } from '@/types/ops'

export function ExecutorCard({
  executor,
  orders,
  onEdit,
  onDelete,
}: {
  executor: Executor
  orders: Order[]
  onEdit?: (executor: Executor) => void
  onDelete?: (id: string) => void
}) {
  const activeOrders = orders.filter(
    (o) => o.executorId === executor.id && o.status === 'pending',
  )

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-foreground font-semibold text-sm mb-0.5">{executor.name}</h3>
          <p className="text-muted-foreground text-xs" dir="ltr">
            {executor.phone}
          </p>
          {executor.address && (
            <p className="text-muted-foreground text-xs mt-0.5">{executor.address}</p>
          )}
        </div>
        <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">
          {activeOrders.length} أوردر
        </Badge>
      </div>

      <StarRating rating={executor.rating} readonly />

      <div className="flex gap-2">
        <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => onEdit?.(executor)}>
          <Edit3 className="size-3.5 ml-1" /> تعديل
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-red-400 h-8 px-2"
          onClick={() => onDelete?.(executor.id)}
        >
          <Trash2 className="size-3.5 ml-1" /> حذف
        </Button>
      </div>
    </div>
  )
}
