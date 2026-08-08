import { useMemo, useRef, useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Edit3,
  ShoppingBag,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/format'
import { getStatusBadge } from '@/lib/status'
import { cn } from '@/lib/utils'
import type { Order, Product } from '@/types/ops'
import { isStoreOrder } from '@/types/ops'

interface StoreOrderItem {
  catalog_id?: string | null
  name: string
  quantity: number
  line_total?: number
  from_catalog?: boolean
  catalog_name?: string
}

function parseStoreOrderItems(str?: string): StoreOrderItem[] {
  try {
    return JSON.parse(str || '[]') as StoreOrderItem[]
  } catch {
    return []
  }
}

function parseCustomerMeta(str?: string | null) {
  try {
    return JSON.parse(str || '{}') as { alternative_phone?: string | null }
  } catch {
    return {}
  }
}

function parseImages(str?: string): string[] {
  try {
    const arr = JSON.parse(str || '[]')
    return Array.isArray(arr) ? (arr as string[]) : []
  } catch {
    return []
  }
}

export function OrderCard({
  order,
  products = [],
  onEdit,
  onDelete,
  onComplete,
  onCancel,
  onDetails,
  onViewImage,
}: {
  order: Order
  products?: Product[]
  onEdit?: (order: Order) => void
  onDelete?: (id: string) => void
  onComplete?: (id: string) => void
  onCancel?: (id: string) => void
  onDetails?: (order: Order) => void
  onViewImage?: (src: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)
  const isStore = isStoreOrder(order)
  const storeItems = useMemo(() => parseStoreOrderItems(order.orderItems), [order.orderItems])
  const customerMeta = useMemo(() => parseCustomerMeta(order.customerMeta), [order.customerMeta])
  const hasTopBadge = order.isUrgent || isStore

  // Collect images: order images first, then executor item images, then product image as fallback
  const orderImages = useMemo(() => parseImages(order.images), [order.images])
  const executorItemImages = useMemo(
    () => (order.executorsDetail || []).flatMap((e) => e.images || []),
    [order.executorsDetail],
  )
  const productImage = useMemo(() => {
    if (order.product?.image) return order.product.image
    if (order.productId) {
      const p = products.find((pr) => pr.id === order.productId)
      return p?.image || ''
    }
    return ''
  }, [order.product, order.productId, products])

  const allImages = useMemo(() => {
    const combined = [...orderImages, ...executorItemImages]
    const imgs = combined.length > 0 ? combined : productImage ? [productImage] : []
    return Array.from(new Set(imgs)).slice(0, 4)
  }, [orderImages, executorItemImages, productImage])

  // Close dropdown on outside click
  const handleActionsToggle = () => setActionsOpen((v) => !v)

  const multiExecutorNames = useMemo(() => {
    if (!order.executorsDetail || order.executorsDetail.length === 0) return ''
    return order.executorsDetail.map((e) => e.executorName).filter(Boolean).join('، ')
  }, [order.executorsDetail])

  return (
    <div
      className={cn(
        'bg-card rounded-2xl border p-4 space-y-3 relative overflow-hidden transition-all',
        order.isUrgent
          ? 'border-amber-500/30 shadow-lg shadow-amber-500/5 bg-gradient-to-l from-card via-card to-amber-500/10'
          : isStore
            ? 'border-emerald-500/30 shadow-lg shadow-emerald-500/5 bg-gradient-to-l from-card via-card to-emerald-500/10'
            : 'border-primary/20 shadow-lg shadow-primary/5 bg-gradient-to-l from-card via-card to-primary/10',
      )}
    >
      {order.isUrgent && (
        <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-br-xl flex items-center gap-1">
          <Zap className="size-2.5 fill-white" /> مستعجل
        </div>
      )}
      {isStore && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-600 to-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-xl flex items-center gap-1">
          <ShoppingBag className="size-2.5" /> من المتجر
        </div>
      )}

      {/* Header: name + status on right, date + images on left */}
      <div className={cn('flex items-start justify-between gap-2', hasTopBadge ? 'pt-5' : 'pt-1')}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-foreground font-semibold text-sm truncate">{order.clientName}</h3>
            {getStatusBadge(order.status)}
          </div>
          {order.executorsDetail && order.executorsDetail.length > 0 ? (
            <p className="text-muted-foreground text-xs">
              المنفذين ({order.executorsDetail.length}): {multiExecutorNames}
            </p>
          ) : order.executor ? (
            <p className="text-muted-foreground text-xs">المنفذ: {order.executor.name}</p>
          ) : null}
          {isStore && order.externalOrderId && (
            <p className="text-muted-foreground/60 text-[10px] font-mono mt-0.5">
              #{order.externalOrderId.slice(-8)}
            </p>
          )}
        </div>

        {/* Date + image thumbnails on the left */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            {formatDate(order.createdAt)}
          </span>
          {allImages.length > 0 && (
            <div className="flex gap-1">
              {allImages.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onViewImage?.(src)}
                  className="size-9 rounded-lg overflow-hidden border border-border/60 hover:border-primary/50 transition-colors shrink-0"
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isStore && storeItems.length > 0 && (
        <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-2.5 space-y-1.5">
          {storeItems.map((item, i) => {
            const linkedInCatalog =
              item.from_catalog === true ||
              (item.catalog_id != null && products.some((p) => p.id === item.catalog_id))
            return (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <span className="text-foreground/80 truncate flex-1">
                  {item.catalog_name ?? item.name}
                </span>
                <span className="text-muted-foreground shrink-0">×{item.quantity}</span>
                {item.line_total != null && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                    {formatCurrency(item.line_total)}
                  </span>
                )}
                {linkedInCatalog ? (
                  <span className="shrink-0 inline-flex items-center gap-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9px] font-semibold px-1 py-0.5 rounded-md">
                    <BookOpen className="size-2.5" /> كتالوج
                  </span>
                ) : (
                  <span className="shrink-0 text-[9px] px-1 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                    خارجي
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <p className="text-muted-foreground text-[10px]">الإجمالي</p>
          <p className="text-foreground font-medium">{formatCurrency(order.totalPrice)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px]">العربون</p>
          <p className="text-amber-400 font-medium">{formatCurrency(order.deposit)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px]">صافي الربح</p>
          <p className="text-green-400 font-medium">{formatCurrency(order.netProfit)}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-primary text-xs w-full text-center hover:underline"
      >
        {expanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
      </button>

      {expanded && (
        <div className="space-y-2 text-xs border-t border-border/50 pt-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">الهاتف</span>
            <span dir="ltr">{order.clientPhone}</span>
          </div>
          {customerMeta.alternative_phone && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">هاتف بديل</span>
              <span dir="ltr">{customerMeta.alternative_phone}</span>
            </div>
          )}
          {order.address && (
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground shrink-0">العنوان</span>
              <span className="text-left">{order.address}</span>
            </div>
          )}
          {order.deliveryPeriod && (
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground shrink-0">مدة التسليم</span>
              <span className="text-left">{order.deliveryPeriod}</span>
            </div>
          )}
          {order.executorsDetail && order.executorsDetail.length > 0 && (
            <div className="border-t border-border/40 pt-2 space-y-2">
              <p className="font-semibold text-primary text-xs">
                تفاصيل المنفذين ({order.executorsDetail.length}):
              </p>
              {order.executorsDetail.map((ex, i) => (
                <div
                  key={i}
                  className="bg-background/60 border border-border/60 rounded-xl p-2.5 space-y-1.5 text-xs"
                >
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-foreground">
                      #{i + 1} {ex.executorName || 'منفذة'}
                    </span>
                    {ex.deliveryPeriod && (
                      <span className="text-muted-foreground text-[10px]">
                        تسليم: {ex.deliveryPeriod}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] text-center bg-card/80 p-1.5 rounded-lg border border-border/40">
                    <div>
                      <span className="text-muted-foreground text-[9px] block">السعر</span>
                      <span className="font-medium text-foreground">{formatCurrency(ex.price)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[9px] block">العربون</span>
                      <span className="text-green-500 font-medium">{formatCurrency(ex.deposit)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[9px] block">المتبقي</span>
                      <span className="text-amber-500 font-medium">
                        {formatCurrency(ex.remaining)}
                      </span>
                    </div>
                  </div>
                  {ex.notes && (
                    <p className="text-[11px] text-muted-foreground/90 bg-muted/30 p-1.5 rounded-md">
                      {ex.notes}
                    </p>
                  )}
                  {ex.images && ex.images.length > 0 && (
                    <div className="flex gap-1 overflow-x-auto pt-1">
                      {ex.images.map((img, imgIdx) => (
                        <button
                          key={imgIdx}
                          type="button"
                          onClick={() => onViewImage?.(img)}
                          className="size-10 rounded-lg overflow-hidden border border-border/70 shrink-0 hover:border-primary transition-colors"
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {order.moderatorCommission > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">عمولة المودريتور</span>
              <span className="text-purple-400">{formatCurrency(order.moderatorCommission)}</span>
            </div>
          )}
          {order.notes && (
            <div className="flex flex-col gap-1 border-t border-border/40 pt-2 mt-2">
              <span className="text-muted-foreground font-semibold">ملاحظات:</span>
              <p className="text-foreground/90 whitespace-pre-line bg-background/30 p-2 rounded-lg text-right">
                {order.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions row */}
      <div className="flex gap-2 pt-1 items-center">
        <Button
          size="sm"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground h-8 px-2"
          onClick={() => onEdit?.(order)}
        >
          <Edit3 className="size-3.5 ml-1" /> تعديل
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-primary h-8 px-2"
          onClick={() => onDetails?.(order)}
        >
          <CreditCard className="size-3.5 ml-1" /> البطاقات
        </Button>

        {/* إجراءات Dropdown */}
        <div ref={actionsRef} className="relative mr-auto">
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground h-8 px-2 gap-1"
            onClick={handleActionsToggle}
          >
            إجراءات
            <ChevronDown className={cn('size-3.5 transition-transform', actionsOpen && 'rotate-180')} />
          </Button>
          {actionsOpen && (
            <div
              className="absolute left-0 bottom-full mb-1 z-50 min-w-[130px] bg-card border border-border rounded-xl shadow-lg overflow-hidden"
              onMouseLeave={() => setActionsOpen(false)}
            >
              {order.status === 'pending' && (
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-green-400 hover:bg-green-500/10 transition-colors"
                  onClick={() => { setActionsOpen(false); onComplete?.(order.id) }}
                >
                  <CheckCircle2 className="size-3.5" /> إكمال
                </button>
              )}
              {order.status === 'pending' && (
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-amber-400 hover:bg-amber-500/10 transition-colors"
                  onClick={() => { setActionsOpen(false); onCancel?.(order.id) }}
                >
                  <XCircle className="size-3.5" /> إلغاء
                </button>
              )}
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                onClick={() => { setActionsOpen(false); onDelete?.(order.id) }}
              >
                <Trash2 className="size-3.5" /> حذف
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
