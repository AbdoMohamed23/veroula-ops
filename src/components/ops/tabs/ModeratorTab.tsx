import { useRef, useState } from 'react'
import { Camera, CircleDollarSign, ImageIcon, Loader2, TrendingUp, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadOpsImage } from '@/lib/storage-upload'
import { formatCurrency, formatDate } from '@/lib/format'
import type { ModeratorPaymentRecord, Order, Stats } from '@/types/ops'

export function ModeratorTab({
  stats,
  orders,
  moderatorPayments,
  onPay,
  paying = false,
  onViewImage,
}: {
  stats: Stats
  orders: Order[]
  moderatorPayments: ModeratorPaymentRecord[]
  onPay?: (amount: number, screenshot?: string | null) => void
  paying?: boolean
  onViewImage?: (src: string) => void
}) {
  const [amount, setAmount] = useState('')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const moderatorOrders = orders.filter((o) => o.moderatorCommission > 0)

  async function handleScreenshotChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadOpsImage(file)
      setScreenshot(url)
      toast.success('تم رفع الصورة')
    } catch {
      toast.error('فشل رفع الصورة')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function handlePay(e: React.FormEvent) {
    e.preventDefault()
    const num = Number(amount)
    if (!num || num <= 0) {
      toast.error('أدخل مبلغاً صحيحاً')
      return
    }
    onPay?.(num, screenshot)
    setAmount('')
    setScreenshot(null)
  }

  return (
    <div className="tab-content space-y-4 pb-8">
      <h2 className="text-foreground font-bold">تفاصيل رصيد المودريتور</h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="size-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="size-4 text-green-400" />
            </div>
            <span className="text-muted-foreground text-[10px]">المبلغ المستحق حالياً</span>
          </div>
          <p className="text-foreground font-bold text-lg" dir="ltr">
            {formatCurrency(stats.moderatorDue)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="size-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <CircleDollarSign className="size-4 text-red-400" />
            </div>
            <span className="text-muted-foreground text-[10px]">المسدد للشهر الحالي</span>
          </div>
          <p className="text-foreground font-bold text-lg" dir="ltr">
            {formatCurrency(stats.currentMonthModeratorPaid)}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <form onSubmit={handlePay} className="space-y-3">
          <div className="space-y-2">
            <Label className="text-foreground/80 text-xs">المبلغ المراد دفعه (ج.م)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="bg-background border-border h-12"
              dir="ltr"
            />
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleScreenshotChange(e)}
          />

          {screenshot ? (
            <div className="relative">
              <img
                src={screenshot}
                alt="لقطة التحويل"
                className="w-full h-32 object-cover rounded-xl border border-border"
              />
              <button
                type="button"
                onClick={() => setScreenshot(null)}
                className="absolute top-2 left-2 size-7 rounded-full bg-black/60 flex items-center justify-center text-white"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="w-full h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
            >
              {uploading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  <Camera className="size-5" />
                  <span className="text-xs">اضغط لرفع لقطة التحويل (اختياري)</span>
                </>
              )}
            </button>
          )}

          <Button
            type="submit"
            disabled={paying}
            className="w-full bg-primary text-primary-foreground h-12 rounded-xl"
          >
            {paying ? <Loader2 className="animate-spin" /> : 'تسديد المبلغ'}
          </Button>
        </form>
      </div>

      {moderatorPayments.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold">سجل التحويلات</h3>
          {moderatorPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between text-xs border-b border-border/40 pb-2 last:border-0"
            >
              <div className="flex items-center gap-2">
                {payment.screenshot && (
                  <button type="button" onClick={() => onViewImage?.(payment.screenshot!)}>
                    <img
                      src={payment.screenshot}
                      alt=""
                      className="size-10 rounded-lg object-cover border border-border"
                    />
                  </button>
                )}
                <div>
                  <p className="text-green-400 font-bold">{formatCurrency(payment.amount)}</p>
                  <p className="text-muted-foreground text-[10px]">{formatDate(payment.createdAt)}</p>
                </div>
              </div>
              {payment.screenshot ? (
                <button type="button" onClick={() => onViewImage?.(payment.screenshot!)}>
                  <ImageIcon className="size-4 text-primary" />
                </button>
              ) : (
                <ImageIcon className="size-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
        <h3 className="text-sm font-semibold">أوردرات بعمولة مودريتور</h3>
        {moderatorOrders.length === 0 ? (
          <p className="text-muted-foreground text-xs text-center py-4">لا توجد أوردرات</p>
        ) : (
          moderatorOrders.map((o) => (
            <div key={o.id} className="flex justify-between items-center text-xs py-1">
              <span className="text-foreground/80 truncate">{o.clientName}</span>
              <span className="text-red-400 font-bold shrink-0" dir="ltr">
                {formatCurrency(o.moderatorCommission)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
