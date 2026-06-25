import { useEffect, useRef, useState } from 'react'
import { Building2, Download, Loader2, Truck, User, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency, formatDate } from '@/lib/format'
import { getStatusBadge } from '@/lib/status'
import { cn } from '@/lib/utils'
import type { Order } from '@/types/ops'

type TicketTab = 'client' | 'executor' | 'ops'

type ToggleKey =
  | 'clientName'
  | 'clientPhone'
  | 'address'
  | 'deliveryPeriod'
  | 'executorName'
  | 'orderPrice'
  | 'deposit'
  | 'clientRemaining'
  | 'executorPrice'
  | 'executorDeposit'
  | 'executorRemaining'
  | 'moderatorCommission'
  | 'shippingCost'
  | 'grandTotal'
  | 'netProfit'

const defaultToggles: Record<ToggleKey, boolean> = {
  clientName: true,
  clientPhone: true,
  address: true,
  deliveryPeriod: true,
  executorName: false,
  orderPrice: true,
  deposit: true,
  clientRemaining: true,
  executorPrice: false,
  executorDeposit: false,
  executorRemaining: false,
  moderatorCommission: false,
  shippingCost: true,
  grandTotal: true,
  netProfit: false,
}

const executorToggles: Record<ToggleKey, boolean> = {
  ...defaultToggles,
  executorName: true,
  executorPrice: true,
  executorDeposit: true,
  executorRemaining: true,
}

const opsToggles: Record<ToggleKey, boolean> = {
  ...executorToggles,
  moderatorCommission: true,
  netProfit: true,
}

function parseImages(str?: string): string[] {
  try {
    return JSON.parse(str || '[]') as string[]
  } catch {
    return []
  }
}

export function OrderTicketsModal({
  open,
  order,
  onClose,
}: {
  open: boolean
  order: Order | null
  onClose: () => void
}) {
  const [activeTicket, setActiveTicket] = useState<TicketTab>('client')
  const [downloading, setDownloading] = useState(false)
  const [clientToggles, setClientToggles] = useState(defaultToggles)
  const [executorToggleState, setExecutorToggleState] = useState(executorToggles)
  const [opsToggleState, setOpsToggleState] = useState(opsToggles)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) setActiveTicket('client')
  }, [open, order?.id])

  if (!order) return null

  const toggles =
    activeTicket === 'client'
      ? clientToggles
      : activeTicket === 'executor'
        ? executorToggleState
        : opsToggleState

  const setToggles =
    activeTicket === 'client'
      ? setClientToggles
      : activeTicket === 'executor'
        ? setExecutorToggleState
        : setOpsToggleState

  const parsedImages = parseImages(order.images)
  const grandTotal = order.totalPrice + order.shippingCost

  const tabs: { id: TicketTab; label: string; icon: typeof User }[] = [
    { id: 'client', label: 'بطاقة العميل', icon: User },
    { id: 'executor', label: 'بطاقة المنفذ', icon: Truck },
    { id: 'ops', label: 'بطاقة OPS', icon: Building2 },
  ]

  async function handleDownload() {
    const el = cardRef.current
    if (!el) return
    setDownloading(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(el, { backgroundColor: '#faf8f0', pixelRatio: 2 })
      const labels: Record<TicketTab, string> = {
        client: 'بطاقة_العميل',
        executor: 'بطاقة_المنفذ',
        ops: 'بطاقة_OPS',
      }
      const link = document.createElement('a')
      link.download = `${labels[activeTicket]}_${order!.clientName}.png`
      link.href = dataUrl
      link.click()
      toast.success('تم تحميل البطاقة')
    } catch {
      toast.error('فشل تحميل البطاقة')
    } finally {
      setDownloading(false)
    }
  }

  function toggleField(key: ToggleKey) {
    setToggles((p) => ({ ...p, [key]: !p[key] }))
  }

  function Row({
    label,
    value,
    valueClass = 'text-foreground',
  }: {
    label: string
    value: string
    valueClass?: string
  }) {
    return (
      <div className="flex justify-between items-start text-xs gap-2">
        <span className="shrink-0 font-medium text-muted-foreground">{label}</span>
        <span className={cn('text-right', valueClass)}>{value}</span>
      </div>
    )
  }

  const toggleLabels: { key: ToggleKey; label: string }[] = [
    { key: 'clientName', label: 'اسم العميل' },
    { key: 'clientPhone', label: 'الهاتف' },
    { key: 'address', label: 'العنوان' },
    { key: 'deliveryPeriod', label: 'مدة التسليم' },
    { key: 'executorName', label: 'المنفذ' },
    { key: 'orderPrice', label: 'سعر الأوردر' },
    { key: 'deposit', label: 'العربون' },
    { key: 'clientRemaining', label: 'المتبقي' },
    { key: 'executorPrice', label: 'سعر المنفذ' },
    { key: 'executorDeposit', label: 'عربون المنفذ' },
    { key: 'executorRemaining', label: 'متبقي المنفذ' },
    { key: 'moderatorCommission', label: 'المودريتور' },
    { key: 'shippingCost', label: 'الشحن' },
    { key: 'grandTotal', label: 'الإجمالي + شحن' },
    { key: 'netProfit', label: 'صافي الربح' },
  ]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-background border-border sm:max-w-md max-h-[90vh] overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle>بطاقات الأوردر — {order.clientName}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTicket(tab.id)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px] transition-colors',
                  activeTicket === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground',
                )}
              >
                <Icon className="size-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-1 max-h-28 overflow-y-auto bg-card rounded-xl p-2 border border-border">
          {toggleLabels.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-1.5 text-[10px] cursor-pointer"
            >
              <input
                type="checkbox"
                checked={toggles[key]}
                onChange={() => toggleField(key)}
                className="accent-primary size-3"
              />
              {label}
            </label>
          ))}
        </div>

        <div
          ref={cardRef}
          className="bg-[#faf8f0] text-gray-900 rounded-2xl p-4 space-y-2 border border-gray-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <span className="text-[10px] text-gray-500">{formatDate(order.createdAt)}</span>
            <div className="flex items-center gap-2">
              {getStatusBadge(order.status)}
              {order.isUrgent && (
                <span className="text-amber-600 text-[10px] flex items-center gap-0.5">
                  <Zap className="size-3" /> مستعجل
                </span>
              )}
            </div>
          </div>

          {parsedImages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {parsedImages.slice(0, 4).map((img, i) => (
                <img key={i} src={img} alt="" className="size-14 rounded-lg object-cover border" />
              ))}
            </div>
          )}

          <div className="space-y-1.5 mt-2">
            {toggles.clientName && <Row label="العميل" value={order.clientName} />}
            {toggles.clientPhone && order.clientPhone && (
              <Row label="الهاتف" value={order.clientPhone} />
            )}
            {toggles.address && order.address && <Row label="العنوان" value={order.address} />}
            {toggles.deliveryPeriod && order.deliveryPeriod && (
              <Row label="مدة التسليم" value={order.deliveryPeriod} />
            )}
            {toggles.executorName && order.executor && (
              <Row label="المنفذ" value={order.executor.name} />
            )}
            {toggles.orderPrice && (
              <Row label="سعر الأوردر" value={formatCurrency(order.totalPrice)} />
            )}
            {toggles.deposit && (
              <Row label="العربون" value={formatCurrency(order.deposit)} valueClass="text-amber-700" />
            )}
            {toggles.clientRemaining && (
              <Row label="المتبقي" value={formatCurrency(order.remaining)} />
            )}
            {toggles.executorPrice && order.executorPrice > 0 && (
              <Row label="سعر المنفذ" value={formatCurrency(order.executorPrice)} />
            )}
            {toggles.executorDeposit && order.executorDeposit > 0 && (
              <Row label="عربون المنفذ" value={formatCurrency(order.executorDeposit)} />
            )}
            {toggles.executorRemaining && order.executorRemaining > 0 && (
              <Row label="متبقي المنفذ" value={formatCurrency(order.executorRemaining)} />
            )}
            {toggles.moderatorCommission && order.moderatorCommission > 0 && (
              <Row
                label="المودريتور"
                value={formatCurrency(order.moderatorCommission)}
                valueClass="text-purple-700"
              />
            )}
            {toggles.shippingCost && order.shippingCost > 0 && (
              <Row label="الشحن" value={formatCurrency(order.shippingCost)} />
            )}
            {toggles.grandTotal && (
              <Row label="الإجمالي + شحن" value={formatCurrency(grandTotal)} valueClass="font-bold" />
            )}
            {toggles.netProfit && (
              <Row
                label="صافي الربح"
                value={formatCurrency(order.netProfit)}
                valueClass="text-green-700 font-bold"
              />
            )}
          </div>

          <div className="pt-2 border-t border-gray-200 flex items-center justify-center gap-1">
            <span className="text-black font-bold text-lg">$</span>
            <span className="text-xs font-bold text-gray-700">OPS</span>
          </div>
        </div>

        <Button
          onClick={() => void handleDownload()}
          disabled={downloading}
          className="w-full"
        >
          {downloading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Download className="size-4 ml-1" /> تحميل البطاقة PNG
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
