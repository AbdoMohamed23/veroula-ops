import { Activity as ActivityIcon, CircleDollarSign, Clock, Edit3, Plus, Trash2, TrendingUp, Wallet } from 'lucide-react'
import { StatCard } from '@/components/ops/StatCard'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/format'
import type { Activity, Expense, Stats } from '@/types/ops'

export function DashboardTab({
  stats,
  expenses,
  activities,
  onEditCapital,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onCapitalBreakdown,
  onMonthlyHistory,
}: {
  stats: Stats
  expenses: Expense[]
  activities: Activity[]
  onEditCapital?: () => void
  onAddExpense?: () => void
  onEditExpense?: (expense: Expense) => void
  onDeleteExpense?: (id: string) => void
  onCapitalBreakdown?: () => void
  onMonthlyHistory?: () => void
}) {
  return (
    <div className="tab-content space-y-6">
      <h2 className="text-lg font-bold">لوحة التحكم</h2>

      <div className="grid grid-cols-2 gap-3">
        <div
          className="cursor-pointer transition-transform active:scale-95"
          onClick={onCapitalBreakdown}
        >
          <StatCard
            title="الرصيد الكلي"
            value={formatCurrency(stats.totalAvailableCapital)}
            icon={TrendingUp}
            color="bg-green-500/15 text-green-400"
          />
        </div>
        <div
          className="cursor-pointer transition-transform active:scale-95"
          onClick={onMonthlyHistory}
        >
          <StatCard
            title="أرباح الشهر الحالي"
            value={formatCurrency(stats.currentMonthProfit)}
            icon={Wallet}
            color="bg-primary/15 text-primary"
          />
        </div>
        <StatCard
          title="مصروفات الشهر الحالي"
          value={formatCurrency(stats.currentMonthExpenses)}
          icon={CircleDollarSign}
          color="bg-red-500/15 text-red-400"
        />
        <StatCard
          title="أوردرات معلقة"
          value={String(stats.pendingOrdersCount)}
          icon={Clock}
          color="bg-purple-500/15 text-purple-400"
        />
      </div>

      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground/80">رأس المال الأساسي</h3>
            <p className="text-xs text-muted-foreground">رأس المال المبدئي لتسجيل الأرباح</p>
          </div>
          <Button size="sm" variant="ghost" className="text-primary h-8 px-2" onClick={onEditCapital}>
            <Edit3 className="size-3.5 ml-1" /> تعديل
          </Button>
        </div>
        <p className="text-foreground text-xl font-bold">{formatCurrency(stats.initialCapital)}</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground/80">إدارة المصروفات</h3>
            <p className="text-xs text-muted-foreground">تخصم مباشرة من الرصيد الكلي</p>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground h-8 px-2 text-xs" onClick={onAddExpense}>
            <Plus className="size-3.5 ml-1" /> إضافة مصروف
          </Button>
        </div>
        {expenses.length === 0 ? (
          <p className="text-muted-foreground text-xs text-center py-4">لا توجد مصروفات</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between bg-background/50 p-2.5 rounded-lg border border-border/60 text-xs"
              >
                <button
                  type="button"
                  className="min-w-0 text-right flex-1"
                  onClick={() => onEditExpense?.(exp)}
                >
                  <p className="text-foreground font-medium truncate">{exp.name}</p>
                  <p className="text-muted-foreground text-[10px]">{formatDate(exp.createdAt)}</p>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-semibold">{formatCurrency(exp.amount)}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 h-7 w-7 p-0"
                    onClick={() => onDeleteExpense?.(exp.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {stats.executorDebts.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground/80">ديون المنفذين</h3>
          <div className="space-y-2">
            {stats.executorDebts.map((d) => (
              <div key={d.executorId} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{d.executorName}</span>
                <span className="text-amber-400 font-medium">{formatCurrency(d.totalRemaining)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-1.5">
          <ActivityIcon className="size-4 text-primary" /> سجل النشاطات
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-xs text-center py-4">لا توجد نشاطات بعد</p>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="text-xs border-b border-border/40 pb-2 last:border-0">
                <p className="text-foreground/90">{act.message}</p>
                <p className="text-muted-foreground text-[10px] mt-0.5">{formatDate(act.createdAt)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
