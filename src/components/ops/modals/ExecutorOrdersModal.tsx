import { Edit3, User, Wallet } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/format'
import { getStatusBadge } from '@/lib/status'
import type { Executor, Order } from '@/types/ops'

export function ExecutorOrdersModal({
  open,
  onClose,
  executor,
  orders,
  onEditOrder,
}: {
  open: boolean
  onClose: () => void
  executor: Executor | null
  orders: Order[]
  onEditOrder?: (order: Order) => void
}) {
  if (!executor) return null

  const activeOrders = orders.filter(
    (o) =>
      (o.executorId === executor.id || o.executorsDetail?.some((e) => e.executorId === executor.id)) &&
      o.status === 'pending',
  )

  const totalDebt = activeOrders.reduce((sum, o) => {
    if (o.executorsDetail && o.executorsDetail.length > 0) {
      const item = o.executorsDetail.find((e) => e.executorId === executor.id)
      if (item) return sum + (Number(item.price) - Number(item.deposit))
    }
    return sum + (Number(o.executorPrice) - Number(o.executorDeposit))
  }, 0)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <User className="size-5 text-primary" />
            بيانات المنفذ: {executor.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            الأوردرات المعلقة للمنفذ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="bg-card border border-border rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-xs mb-1">إجمالي المستحقات للمنفذ</p>
              <p className="text-red-400 font-bold text-xl" dir="ltr">
                {formatCurrency(totalDebt)}
              </p>
            </div>
            <Wallet className="size-8 text-muted-foreground" />
          </div>

          <h3 className="font-semibold text-sm">
            الأوردرات المعلقة ({activeOrders.length})
          </h3>

          <div className="space-y-3">
            {activeOrders.length === 0 ? (
              <p className="text-muted-foreground text-xs text-center py-4">
                لا توجد أوردرات معلقة
              </p>
            ) : (
              activeOrders.map((order) => {
                const exItem = order.executorsDetail?.find((e) => e.executorId === executor.id)
                const exPrice = exItem ? exItem.price : order.executorPrice
                const exDeposit = exItem ? exItem.deposit : order.executorDeposit
                const exRemaining = exItem ? exItem.remaining : order.executorRemaining

                return (
                  <div
                    key={order.id}
                    className="bg-card border border-border rounded-xl p-3 text-xs space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-foreground font-semibold flex items-center gap-2">
                          {order.clientName}
                          {onEditOrder && (
                            <button
                              type="button"
                              onClick={() => onEditOrder(order)}
                              className="text-primary hover:opacity-80"
                            >
                              <Edit3 className="size-3" />
                            </button>
                          )}
                        </p>
                        {order.clientPhone && (
                          <p className="text-muted-foreground" dir="ltr">
                            {order.clientPhone}
                          </p>
                        )}
                        {exItem?.notes && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                            قطع هذا المنفذ: {exItem.notes}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    {exItem?.images && exItem.images.length > 0 && (
                      <div className="flex gap-1.5 overflow-x-auto py-1">
                        {exItem.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt=""
                            className="size-11 rounded-lg object-cover border border-border/60"
                          />
                        ))}
                      </div>
                    )}

                    <div className="border-t border-border/60 pt-2 flex justify-between items-center text-center gap-2">
                      <div className="flex-1">
                        <p className="text-muted-foreground text-[10px]">المتبقي للمنفذ</p>
                        <p className="text-red-400 font-medium" dir="ltr">
                          {formatCurrency(exRemaining)}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="text-muted-foreground text-[10px]">العربون</p>
                        <p className="text-green-400 font-medium" dir="ltr">
                          {formatCurrency(exDeposit)}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="text-muted-foreground text-[10px]">سعر المنفذ</p>
                        <p className="text-foreground font-medium" dir="ltr">
                          {formatCurrency(exPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
