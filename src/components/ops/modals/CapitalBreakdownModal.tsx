import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/format'

export function CapitalBreakdownModal({
  open,
  onClose,
  total,
  breakdown = [],
}: {
  open: boolean
  onClose: () => void
  total: number
  breakdown: { label: string; amount: number; type: 'add' | 'subtract' }[]
}) {
  const additions = breakdown.filter((i) => i.type === 'add')
  const deductions = breakdown.filter((i) => i.type === 'subtract')

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-background border-border sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">تفاصيل الرصيد الكلي</DialogTitle>
          <DialogDescription className="text-center text-xs">
            كل البنود اللي بتزود أو بتقلّل الرصيد المتاح
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          {additions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-green-400">إضافات ↑</p>
              {additions.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-green-500/15 bg-green-500/5 px-3 py-2.5"
                >
                  <span className="text-xs text-foreground/90">{item.label}</span>
                  <span className="text-sm font-bold text-green-400 whitespace-nowrap" dir="ltr">
                    +{formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {deductions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-red-400">خصومات ↓</p>
              {deductions.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-red-500/15 bg-red-500/5 px-3 py-2.5"
                >
                  <span className="text-xs text-foreground/90">{item.label}</span>
                  <span className="text-sm font-bold text-red-400 whitespace-nowrap" dir="ltr">
                    −{formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {breakdown.length === 0 && (
            <p className="text-muted-foreground text-center py-4 text-sm">لا توجد بيانات مالية بعد</p>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-bold">الرصيد الكلي</span>
            <span className="text-lg font-bold text-primary">{formatCurrency(total)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
