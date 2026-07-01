import { fetchCapitalAmount } from '@/lib/services/capital'
import { fetchExpenses } from '@/lib/services/expenses'
import { fetchExecutors } from '@/lib/services/executors'
import { fetchModeratorPayments } from '@/lib/services/moderator'
import { fetchOrders } from '@/lib/services/orders'
import { fetchOwnerDebts } from '@/lib/services/owner-debts'
import { fetchSupplyOrders } from '@/lib/services/supply'
import type { Stats } from '@/types/ops'

function monthKey(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export async function computeStats(): Promise<Stats> {
  const [initialCapital, allOrders, supplyOrders, expenses, moderatorPayments, executors, ownerDebts] =
    await Promise.all([
      fetchCapitalAmount(),
      fetchOrders(),
      fetchSupplyOrders(),
      fetchExpenses(),
      fetchModeratorPayments(),
      fetchExecutors(),
      fetchOwnerDebts(),
    ])

  const completedOrders = allOrders.filter((o) => o.status === 'completed')
  const nonCancelledOrders = allOrders.filter((o) => o.status !== 'cancelled')
  const pendingOrders = allOrders.filter((o) => o.status === 'pending')
  const pendingCashflow = pendingOrders.reduce(
    (sum, o) => sum + (o.deposit - o.executorDeposit),
    0,
  )

  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const executorDebtMap = new Map<
    string,
    { executorId: string; executorName: string; totalRemaining: number }
  >()
  for (const order of pendingOrders) {
    if (!order.executorId || !order.executor) continue
    const existing = executorDebtMap.get(order.executorId)
    if (existing) {
      existing.totalRemaining += order.executorRemaining
    } else {
      executorDebtMap.set(order.executorId, {
        executorId: order.executorId,
        executorName: order.executor.name,
        totalRemaining: order.executorRemaining,
      })
    }
  }
  const executorDebts = Array.from(executorDebtMap.values()).filter((d) => d.totalRemaining > 0)

  let totalModeratorCommission = 0
  for (const o of nonCancelledOrders) {
    totalModeratorCommission += o.moderatorCommission || 0
  }

  let totalModeratorPaymentsAllTime = 0
  let currentMonthModeratorPaid = 0
  for (const mp of moderatorPayments) {
    totalModeratorPaymentsAllTime += mp.amount
    if (monthKey(mp.createdAt) === currentMonthKey) {
      currentMonthModeratorPaid += mp.amount
    }
  }
  const moderatorDue = totalModeratorCommission - totalModeratorPaymentsAllTime

  const monthlyStats: Record<string, { monthStr: string; profit: number; expenses: number }> = {}

  const addProfit = (dateStr: string, amount: number) => {
    const key = monthKey(dateStr)
    if (!monthlyStats[key]) monthlyStats[key] = { monthStr: key, profit: 0, expenses: 0 }
    monthlyStats[key].profit += amount
  }

  const addExpense = (dateStr: string, amount: number) => {
    const key = monthKey(dateStr)
    if (!monthlyStats[key]) monthlyStats[key] = { monthStr: key, profit: 0, expenses: 0 }
    monthlyStats[key].expenses += amount
  }

  for (const mp of moderatorPayments) {
    addProfit(mp.createdAt, -mp.amount)
  }

  let totalNormalProfit = 0
  for (const o of completedOrders) {
    totalNormalProfit += o.netProfit
    addProfit(o.createdAt, o.netProfit)
  }

  let totalExpensesAmount = 0
  for (const ex of expenses) {
    totalExpensesAmount += ex.amount
    addExpense(ex.createdAt, ex.amount)
  }

  let abdoBalance = 0
  let oshaBalance = 0
  for (const d of ownerDebts) {
    const factor = d.type === 'withdraw' ? 1 : -1
    const val = d.amount * factor
    if (d.owner === 'abdo') {
      abdoBalance += val
    } else if (d.owner === 'osha') {
      oshaBalance += val
    }
  }
  const totalOwnerDebtsAmount = abdoBalance + oshaBalance

  const currentMonthStats = monthlyStats[currentMonthKey] || {
    monthStr: currentMonthKey,
    profit: 0,
    expenses: 0,
  }

  const monthlyHistory = Object.values(monthlyStats).sort((a, b) =>
    b.monthStr.localeCompare(a.monthStr),
  )

  const pendingSupplyOrdersCount = supplyOrders.filter((o) => o.status === 'pending').length

  let supplyPurchasesTotal = 0
  let pendingSupplyDeposits = 0
  for (const so of supplyOrders) {
    if (so.status === 'cancelled') continue
    if (so.status === 'pending') {
      supplyPurchasesTotal += so.deposit
      pendingSupplyDeposits += so.deposit
    } else if (so.status === 'completed') {
      supplyPurchasesTotal += so.price + so.shippingCost
    }
  }

  const completedSupplyTotal = supplyPurchasesTotal - pendingSupplyDeposits

  const totalAvailableCapital =
    initialCapital +
    totalNormalProfit +
    pendingCashflow -
    totalExpensesAmount -
    totalModeratorPaymentsAllTime -
    supplyPurchasesTotal -
    totalOwnerDebtsAmount

  return {
    initialCapital,
    totalAvailableCapital,
    totalOwnerDebtsAllTime: totalOwnerDebtsAmount,
    abdoBalance,
    oshaBalance,
    totalNetProfitAllTime: totalNormalProfit,
    totalExpensesAllTime: totalExpensesAmount,
    currentMonthProfit: currentMonthStats.profit,
    currentMonthExpenses: currentMonthStats.expenses,
    pendingOrdersCount: pendingOrders.length,
    completedOrdersCount: completedOrders.length,
    totalExecutors: executors.length,
    executorDebts,
    moderatorDue,
    currentMonthModeratorPaid,
    pendingSupplyOrdersCount,
    supplyPurchasesTotal,
    pendingSupplyDeposits,
    pendingCashflow,
    totalModeratorPaymentsAllTime,
    monthlyHistory,
    balanceBreakdown: [
      { label: 'رأس المال الأساسي', amount: initialCapital, type: 'add' as const },
      { label: 'أرباح الأوردرات المكتملة', amount: totalNormalProfit, type: 'add' as const },
      ...(pendingCashflow >= 0
        ? [{ label: 'أوردرات معلقة', amount: pendingCashflow, type: 'add' as const }]
        : [{ label: 'أوردرات معلقة', amount: Math.abs(pendingCashflow), type: 'subtract' as const }]),
      { label: 'المصروفات', amount: totalExpensesAmount, type: 'subtract' as const },
      { label: 'مدفوعات المودريتور', amount: totalModeratorPaymentsAllTime, type: 'subtract' as const },
      { label: 'عربونات مشتريات معلقة', amount: pendingSupplyDeposits, type: 'subtract' as const },
      { label: 'مشتريات مكتملة', amount: completedSupplyTotal, type: 'subtract' as const },
      ...(abdoBalance > 0
        ? [{ label: 'سحوبات المالك (Abdo)', amount: abdoBalance, type: 'subtract' as const }]
        : abdoBalance < 0
          ? [{ label: 'دائن للموقع (Abdo)', amount: Math.abs(abdoBalance), type: 'add' as const }]
          : []),
      ...(oshaBalance > 0
        ? [{ label: 'سحوبات المالك (Osha)', amount: oshaBalance, type: 'subtract' as const }]
        : oshaBalance < 0
          ? [{ label: 'دائن للموقع (Osha)', amount: Math.abs(oshaBalance), type: 'add' as const }]
          : []),
    ].filter((x) => x.amount !== 0),
  }
}
