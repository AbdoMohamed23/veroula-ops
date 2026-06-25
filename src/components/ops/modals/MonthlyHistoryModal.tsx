import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/format'

export function MonthlyHistoryModal({
  open,
  onClose,
  history,
}: {
  open: boolean
  onClose: () => void
  history: { monthStr: string; profit: number; expenses: number }[]
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-background border-border sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">سجل الأرباح والمصروفات الشهري</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {history.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">لا يوجد سجلات سابقة</p>
          ) : (
            history.map((h) => (
              <div
                key={h.monthStr}
                className="flex justify-between items-center border-t border-border/50 pt-3 mt-3 first:mt-0 first:pt-0 first:border-0"
              >
                <div className="flex gap-4 text-xs text-center">
                  <div>
                    <p className="text-muted-foreground mb-1">الأرباح</p>
                    <p className="text-green-400 font-bold">{formatCurrency(h.profit)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">المصروفات</p>
                    <p className="text-red-400 font-bold">{formatCurrency(h.expenses)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">الصافي</p>
                    <p className="text-primary font-bold">{formatCurrency(h.profit - h.expenses)}</p>
                  </div>
                </div>
                <span className="text-foreground/80 font-bold text-sm">{h.monthStr}</span>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
