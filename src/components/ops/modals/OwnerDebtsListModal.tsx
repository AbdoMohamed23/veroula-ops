import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { HandCoins, Plus, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { OwnerDebt, Stats } from '@/types/ops'

export function OwnerDebtsListModal({
  open,
  onClose,
  stats,
  ownerDebts,
  onAddOwnerDebt,
  onEditOwnerDebt,
  onDeleteOwnerDebt,
}: {
  open: boolean
  onClose: () => void
  stats: Stats
  ownerDebts: OwnerDebt[]
  onAddOwnerDebt: () => void
  onEditOwnerDebt: (debt: OwnerDebt) => void
  onDeleteOwnerDebt: (id: string) => void
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-background border-border sm:max-w-md max-h-[85vh] overflow-y-auto flex flex-col p-6">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-right flex items-center gap-1.5 text-base">
              <HandCoins className="size-5 text-primary" />
              تفاصيل ديون المالكين
            </DialogTitle>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-2 text-xs"
              onClick={onAddOwnerDebt}
            >
              <Plus className="size-3.5 ml-1" /> إضافة حركة
            </Button>
          </div>
          <DialogDescription className="text-right text-xs mt-1">
            سحب سلف، تسديدات، وأرصدة عبده وأوشا الجارية
          </DialogDescription>
        </DialogHeader>

        {/* صافي رصيد كل مالك */}
        <div className="grid grid-cols-2 gap-3 bg-card border border-border/60 p-3 rounded-xl text-xs mt-4 shrink-0">
          <div className="space-y-1 text-right">
            <p className="text-muted-foreground font-medium">حساب عبده (Abdo):</p>
            {stats.abdoBalance > 0 ? (
              <p className="text-red-400 font-bold">
                مدين: {formatCurrency(stats.abdoBalance)}
              </p>
            ) : stats.abdoBalance < 0 ? (
              <p className="text-green-400 font-bold">
                دائن: {formatCurrency(Math.abs(stats.abdoBalance))}
              </p>
            ) : (
              <p className="text-muted-foreground font-bold">رصيد متزن (0)</p>
            )}
          </div>
          <div className="space-y-1 text-right">
            <p className="text-muted-foreground font-medium">حساب أوشا (Osha):</p>
            {stats.oshaBalance > 0 ? (
              <p className="text-red-400 font-bold">
                مدين: {formatCurrency(stats.oshaBalance)}
              </p>
            ) : stats.oshaBalance < 0 ? (
              <p className="text-green-400 font-bold">
                دائن: {formatCurrency(Math.abs(stats.oshaBalance))}
              </p>
            ) : (
              <p className="text-muted-foreground font-bold">رصيد متزن (0)</p>
            )}
          </div>
        </div>

        {/* قائمة الحركات */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-0.5">
          <p className="text-xs font-semibold text-muted-foreground text-right mb-1">جدول الحركات والعمليات:</p>
          {ownerDebts.length === 0 ? (
            <p className="text-muted-foreground text-xs text-center py-8">لا توجد حركات مسجلة</p>
          ) : (
            ownerDebts.map((debt) => {
              const isWithdraw = debt.type === 'withdraw'
              const isRepay = debt.type === 'repay'
              const ownerName = debt.owner === 'abdo' ? 'عبده' : 'أوشا'
              
              let typeLabel = ''
              let typeClass = ''
              let sign = ''
              
              if (isWithdraw) {
                typeLabel = 'سحب سلفة'
                typeClass = 'bg-red-500/10 text-red-400 border border-red-500/20'
                sign = '−'
              } else if (isRepay) {
                typeLabel = 'تسديد'
                typeClass = 'bg-green-500/10 text-green-400 border border-green-500/20'
                sign = '+'
              } else {
                typeLabel = 'دائن للموقع'
                typeClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                sign = '+'
              }

              return (
                <div
                  key={debt.id}
                  className="flex items-center justify-between bg-card p-2.5 rounded-lg border border-border/60 text-xs gap-2 text-right"
                >
                  <button
                    type="button"
                    className="min-w-0 text-right flex-1"
                    onClick={() => onEditOwnerDebt?.(debt)}
                  >
                    <div className="flex items-center gap-1.5 flex-wrap justify-start">
                      <span className="font-bold text-foreground">{ownerName}</span>
                      <span className={cn('text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0', typeClass)}>
                        {typeLabel}
                      </span>
                      <p className="text-muted-foreground truncate text-[11px] inline-block">{debt.name}</p>
                    </div>
                    <p className="text-muted-foreground/60 text-[10px] mt-0.5">{formatDate(debt.createdAt)}</p>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className={cn('font-semibold whitespace-nowrap', isWithdraw ? 'text-red-400' : 'text-green-400')}>
                      {sign}{formatCurrency(debt.amount)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-500 hover:bg-red-500/5 h-7 w-7 p-0"
                      onClick={() => onDeleteOwnerDebt?.(debt.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="shrink-0 border-t border-border pt-4 mt-4 flex items-center justify-end">
          <Button type="button" variant="ghost" onClick={onClose} className="h-9 px-4 text-sm">
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
