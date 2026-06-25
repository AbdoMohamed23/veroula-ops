import { CheckCircle2, Edit3, Trash2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/format'
import type { OrderStatus, SupplyOrder } from '@/types/ops'

const statusColors = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
} as const

const statusLabels: Record<OrderStatus, string> = {
  pending: 'معلق',
  completed: 'مكتمل',
  cancelled: 'ملغي',
}

export function SupplyOrderCard({
  order,
  onEdit,
  onDelete,
  onComplete,
  onCancel,
}: {
  order: SupplyOrder
  onEdit?: (order: SupplyOrder) => void
  onDelete?: (id: string) => void
  onComplete?: (id: string) => void
  onCancel?: (id: string) => void
}) {
  let parsedImages: string[] = []
  try {
    parsedImages = JSON.parse(order.images)
  } catch {
    parsedImages = []
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-foreground font-semibold text-sm mb-0.5 flex items-center gap-2">
            {order.executorName}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded border ${statusColors[order.status]}`}
            >
              {statusLabels[order.status]}
            </span>
          </h3>
          <p className="text-muted-foreground text-xs" dir="ltr">
            {order.phone}
          </p>
          {order.address && <p className="text-muted-foreground text-xs">📍 {order.address}</p>}
        </div>
        <span className="text-muted-foreground text-xs whitespace-nowrap">
          {formatDate(order.createdAt)}
        </span>
      </div>

      {parsedImages.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {parsedImages.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              className="w-14 h-14 rounded-lg object-cover border border-border flex-shrink-0"
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-muted-foreground text-[10px]">الإجمالي</p>
          <p className="text-foreground text-xs font-medium">{formatCurrency(order.price)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px]">العربون</p>
          <p className="text-amber-400 text-xs font-medium">{formatCurrency(order.deposit)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px]">المتبقي</p>
          <p className="text-primary text-xs font-medium">{formatCurrency(order.remaining)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px]">الشحن</p>
          <p className="text-red-400 text-xs font-medium">{formatCurrency(order.shippingCost)}</p>
        </div>
      </div>

      {order.deliveryDate && (
        <p className="text-muted-foreground text-xs">📅 تاريخ الاستلام: {order.deliveryDate}</p>
      )}

      {order.status === 'pending' ? (
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => onComplete?.(order.id)}
            className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs rounded-lg flex-1"
          >
            <CheckCircle2 className="size-3.5 ml-1" /> مكتمل
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit?.(order)} className="h-8 px-2">
            <Edit3 className="size-3.5 ml-1" /> تعديل
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onCancel?.(order.id)} className="text-amber-400 h-8 px-2">
            <XCircle className="size-3.5 ml-1" /> إلغاء
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete?.(order.id)} className="text-red-400 h-8 px-2">
            <Trash2 className="size-3.5 ml-1" /> حذف
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => onDelete?.(order.id)} className="text-red-400 h-8 px-2">
          <Trash2 className="size-3.5 ml-1" /> حذف
        </Button>
      )}
    </div>
  )
}
