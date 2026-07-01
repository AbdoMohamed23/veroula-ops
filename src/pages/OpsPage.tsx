import { useCallback, useState, type ElementType } from 'react'
import {
  BookOpen,
  ClipboardList,
  Home as HomeIcon,
  LogOut,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { OpsFab } from '@/components/ops/OpsFab'
import { OpsBrand } from '@/components/ops/OpsLogo'
import { CapitalBreakdownModal } from '@/components/ops/modals/CapitalBreakdownModal'
import { CapitalModal } from '@/components/ops/modals/CapitalModal'
import { ConfirmDeleteModal } from '@/components/ops/modals/ConfirmDeleteModal'
import { ExecutorModal } from '@/components/ops/modals/ExecutorModal'
import { ExecutorOrdersModal } from '@/components/ops/modals/ExecutorOrdersModal'
import { ExpenseModal } from '@/components/ops/modals/ExpenseModal'
import { ImageLightbox } from '@/components/ops/modals/ImageLightbox'
import { MonthlyHistoryModal } from '@/components/ops/modals/MonthlyHistoryModal'
import { OwnerDebtModal } from '@/components/ops/modals/OwnerDebtModal'
import { OwnerDebtsListModal } from '@/components/ops/modals/OwnerDebtsListModal'
import { OrderModal } from '@/components/ops/modals/OrderModal'
import { OrderTicketsModal } from '@/components/ops/modals/OrderTicketsModal'
import { ProductModal } from '@/components/ops/modals/ProductModal'
import { SupplyOrderModal } from '@/components/ops/modals/SupplyOrderModal'
import { UrgentOrderModal } from '@/components/ops/modals/UrgentOrderModal'
import { CatalogTab } from '@/components/ops/tabs/CatalogTab'
import { DashboardTab } from '@/components/ops/tabs/DashboardTab'
import { ModeratorTab } from '@/components/ops/tabs/ModeratorTab'
import { OrdersTab } from '@/components/ops/tabs/OrdersTab'
import { SupplyTab } from '@/components/ops/tabs/SupplyTab'
import { TeamTab } from '@/components/ops/tabs/TeamTab'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { Button } from '@/components/ui/button'
import {
  useActivities,
  useCapitalMutation,
  useExecutorMutations,
  useExpenseMutations,
  useExpenses,
  useExecutors,
  useModeratorPaymentMutation,
  useModeratorPayments,
  useOrderMutations,
  useOrders,
  useOwnerDebts,
  useOwnerDebtMutations,
  useProductMutations,
  useProducts,
  useStats,
  useSupplyMutations,
  useSupplyOrders,
} from '@/hooks/useOpsQueries'
import { cn } from '@/lib/utils'
import type { Executor, Expense, Order, OwnerDebt, Product, SupplyOrder, TabId } from '@/types/ops'

const TAB_STORAGE_KEY = 'veroula-ops-tab'

const tabs: { id: TabId; label: string; icon: ElementType }[] = [
  { id: 'dashboard', label: 'الرئيسية', icon: HomeIcon },
  { id: 'orders', label: 'الأوردرات', icon: ClipboardList },
  { id: 'supply', label: 'مشترياتي', icon: Zap },
  { id: 'catalog', label: 'الكتالوج', icon: BookOpen },
  { id: 'team', label: 'الفريق', icon: Users },
  { id: 'moderator', label: 'المودريتور', icon: ShieldCheck },
]

function readStoredTab(): TabId {
  const stored = localStorage.getItem(TAB_STORAGE_KEY) as TabId | null
  if (stored && tabs.some((t) => t.id === stored)) return stored
  return 'dashboard'
}

function TabLoader() {
  return (
    <div className="flex justify-center py-16">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  )
}

export function OpsShell() {
  const { profile, signOut } = useAuth()
  const [activeTab, setActiveTabState] = useState<TabId>(() => readStoredTab())

  const [orderModal, setOrderModal] = useState<{ open: boolean; order?: Order | null }>({ open: false })
  const [supplyModal, setSupplyModal] = useState<{ open: boolean; order?: SupplyOrder | null }>({ open: false })
  const [productModal, setProductModal] = useState<{ open: boolean; product?: Product | null }>({ open: false })
  const [executorModal, setExecutorModal] = useState<{ open: boolean; executor?: Executor | null }>({ open: false })
  const [executorOrdersModal, setExecutorOrdersModal] = useState<{
    open: boolean
    executor: Executor | null
  }>({ open: false, executor: null })
  const [urgentModal, setUrgentModal] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  })
  const [expenseModal, setExpenseModal] = useState<{ open: boolean; expense: Expense | null }>({
    open: false,
    expense: null,
  })
  const [ownerDebtModal, setOwnerDebtModal] = useState<{ open: boolean; debt: OwnerDebt | null }>({
    open: false,
    debt: null,
  })
  const [capitalModal, setCapitalModal] = useState(false)
  const [capitalBreakdownModal, setCapitalBreakdownModal] = useState(false)
  const [monthlyHistoryModal, setMonthlyHistoryModal] = useState(false)
  const [ownerDebtsListModal, setOwnerDebtsListModal] = useState(false)
  const [orderTicketsModal, setOrderTicketsModal] = useState<{ open: boolean; order: Order | null }>({
    open: false,
    order: null,
  })
  const [lightbox, setLightbox] = useState<{ open: boolean; src: string | null }>({
    open: false,
    src: null,
  })
  const [deleteConfirm, setDeleteConfirm] = useState<{
    title: string
    description: string
    onConfirm: () => void
  } | null>(null)

  const { data: orders = [], isLoading: ordersLoading } = useOrders()
  const { data: executors = [], isLoading: executorsLoading } = useExecutors()
  const { data: products = [], isLoading: productsLoading } = useProducts()
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses()
  const { data: ownerDebts = [], isLoading: ownerDebtsLoading } = useOwnerDebts()
  const { data: supplyOrders = [], isLoading: supplyLoading } = useSupplyOrders()
  const { data: stats, isLoading: statsLoading } = useStats()
  const { data: activities = [], isLoading: activitiesLoading } = useActivities()
  const { data: moderatorPayments = [] } = useModeratorPayments()

  const orderMutations = useOrderMutations()
  const supplyMutations = useSupplyMutations()
  const executorMutations = useExecutorMutations()
  const productMutations = useProductMutations()
  const expenseMutations = useExpenseMutations()
  const ownerDebtMutations = useOwnerDebtMutations()
  const capitalMutation = useCapitalMutation()
  const moderatorPayMutation = useModeratorPaymentMutation()

  const askDelete = useCallback((title: string, description: string, action: () => void) => {
    setDeleteConfirm({ title, description, onConfirm: action })
  }, [])

  const deleteLoading =
    orderMutations.remove.isPending ||
    supplyMutations.remove.isPending ||
    productMutations.remove.isPending ||
    executorMutations.remove.isPending ||
    expenseMutations.remove.isPending ||
    ownerDebtMutations.remove.isPending

  const setActiveTab = useCallback((tab: TabId) => {
    setActiveTabState(tab)
    localStorage.setItem(TAB_STORAGE_KEY, tab)
  }, [])

  const handleFabClick = useCallback(() => {
    switch (activeTab) {
      case 'orders':
        setOrderModal({ open: true, order: null })
        break
      case 'supply':
        setSupplyModal({ open: true, order: null })
        break
      case 'catalog':
        setProductModal({ open: true, product: null })
        break
      case 'team':
        setExecutorModal({ open: true, executor: null })
        break
    }
  }, [activeTab])

  const dashboardLoading = statsLoading || expensesLoading || ownerDebtsLoading || activitiesLoading

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground" dir="rtl">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <OpsBrand />
          <div className="flex items-center gap-1.5">
            <span className="text-foreground/80 text-xs bg-card border border-border px-2 py-1 rounded-xl flex items-center gap-1.5 max-w-[140px]">
              <span className="size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="truncate">{profile?.name || 'ops'}</span>
            </span>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-red-400 h-8 w-8 p-0 rounded-xl"
              onClick={() => void signOut().then(() => toast.success('تم تسجيل الخروج'))}
              title="تسجيل الخروج"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-lg mx-auto px-4 py-4">
          {activeTab === 'dashboard' &&
            (dashboardLoading || !stats ? (
              <TabLoader />
            ) : (
              <DashboardTab
                stats={stats}
                expenses={expenses}
                activities={activities}
                onEditCapital={() => setCapitalModal(true)}
                onAddExpense={() => setExpenseModal({ open: true, expense: null })}
                onEditExpense={(exp) => setExpenseModal({ open: true, expense: exp })}
                onDeleteExpense={(id) =>
                  askDelete('حذف المصروف', 'هل تريد حذف هذا المصروف؟', () =>
                    expenseMutations.remove.mutate(id, { onSuccess: () => setDeleteConfirm(null) }),
                  )
                }
                onOpenOwnerDebts={() => setOwnerDebtsListModal(true)}
                onCapitalBreakdown={() => setCapitalBreakdownModal(true)}
                onMonthlyHistory={() => setMonthlyHistoryModal(true)}
              />
            ))}

          {activeTab === 'orders' &&
            (ordersLoading ? (
              <TabLoader />
            ) : (
              <OrdersTab
                orders={orders}
                products={products}
                onComplete={(id) => orderMutations.complete.mutate(id)}
                onCancel={(id) => orderMutations.cancel.mutate(id)}
                onDelete={(id) =>
                  askDelete('حذف الأوردر', 'هل تريد حذف هذا الأوردر نهائياً؟', () =>
                    orderMutations.remove.mutate(id, { onSuccess: () => setDeleteConfirm(null) }),
                  )
                }
                onEdit={(order) => setOrderModal({ open: true, order })}
                onDetails={(order) => setOrderTicketsModal({ open: true, order })}
                onViewImage={(src) => setLightbox({ open: true, src })}
              />
            ))}

          {activeTab === 'supply' &&
            (supplyLoading || !stats ? (
              <TabLoader />
            ) : (
              <SupplyTab
                supplyOrders={supplyOrders}
                stats={stats}
                onComplete={(id) => supplyMutations.complete.mutate(id)}
                onCancel={(id) => supplyMutations.cancel.mutate(id)}
                onDelete={(id) =>
                  askDelete('حذف المشتريات', 'هل تريد حذف طلب المشتريات هذا؟', () =>
                    supplyMutations.remove.mutate(id, { onSuccess: () => setDeleteConfirm(null) }),
                  )
                }
                onEdit={(order) => setSupplyModal({ open: true, order })}
              />
            ))}

          {activeTab === 'catalog' &&
            (productsLoading ? (
              <TabLoader />
            ) : (
              <CatalogTab
                products={products}
                onDelete={(id) =>
                  askDelete('حذف المنتج', 'هل تريد حذف هذا المنتج من الكتالوج؟', () =>
                    productMutations.remove.mutate(id, { onSuccess: () => setDeleteConfirm(null) }),
                  )
                }
                onEdit={(product) => setProductModal({ open: true, product })}
                onSell={(product) => setUrgentModal({ open: true, product })}
              />
            ))}

          {activeTab === 'team' &&
            (executorsLoading || ordersLoading ? (
              <TabLoader />
            ) : (
              <TeamTab
                executors={executors}
                orders={orders}
                onDelete={(id) =>
                  askDelete('حذف المنفذ', 'هل تريد حذف هذا المنفذ؟', () =>
                    executorMutations.remove.mutate(id, { onSuccess: () => setDeleteConfirm(null) }),
                  )
                }
                onEdit={(executor) => setExecutorModal({ open: true, executor })}
                onViewOrders={(executor) =>
                  setExecutorOrdersModal({ open: true, executor })
                }
              />
            ))}

          {activeTab === 'moderator' &&
            (!stats ? (
              <TabLoader />
            ) : (
              <ModeratorTab
                stats={stats}
                orders={orders}
                moderatorPayments={moderatorPayments}
                onPay={(amount, screenshot) =>
                  moderatorPayMutation.mutate({ amount, screenshot })
                }
                paying={moderatorPayMutation.isPending}
                onViewImage={(src) => setLightbox({ open: true, src })}
              />
            ))}
        </div>
      </main>

      <OpsFab activeTab={activeTab} onClick={handleFabClick} />

      <OrderModal
        open={orderModal.open}
        onClose={() => setOrderModal({ open: false })}
        order={orderModal.order}
        executors={executors}
        saving={orderMutations.create.isPending || orderMutations.update.isPending}
        onSave={(data) => {
          if (orderModal.order) {
            orderMutations.update.mutate(
              { id: orderModal.order.id, payload: data },
              { onSuccess: () => setOrderModal({ open: false }) },
            )
          } else {
            orderMutations.create.mutate(data, { onSuccess: () => setOrderModal({ open: false }) })
          }
        }}
      />

      <SupplyOrderModal
        open={supplyModal.open}
        onClose={() => setSupplyModal({ open: false })}
        order={supplyModal.order}
        executors={executors}
        saving={supplyMutations.create.isPending || supplyMutations.update.isPending}
        onSave={(data) => {
          if (supplyModal.order) {
            supplyMutations.update.mutate(
              { id: supplyModal.order.id, payload: data },
              { onSuccess: () => setSupplyModal({ open: false }) },
            )
          } else {
            supplyMutations.create.mutate(data, { onSuccess: () => setSupplyModal({ open: false }) })
          }
        }}
      />

      <ProductModal
        open={productModal.open}
        onClose={() => setProductModal({ open: false })}
        product={productModal.product}
        saving={productMutations.create.isPending || productMutations.update.isPending}
        onSave={(data) => {
          if (productModal.product) {
            productMutations.update.mutate(
              { id: productModal.product.id, payload: data },
              { onSuccess: () => setProductModal({ open: false }) },
            )
          } else {
            productMutations.create.mutate(data, { onSuccess: () => setProductModal({ open: false }) })
          }
        }}
      />

      <ExecutorModal
        open={executorModal.open}
        onClose={() => setExecutorModal({ open: false })}
        executor={executorModal.executor}
        saving={executorMutations.create.isPending || executorMutations.update.isPending}
        onSave={(data) => {
          if (executorModal.executor) {
            executorMutations.update.mutate(
              { id: executorModal.executor.id, payload: data },
              { onSuccess: () => setExecutorModal({ open: false }) },
            )
          } else {
            executorMutations.create.mutate(data, { onSuccess: () => setExecutorModal({ open: false }) })
          }
        }}
      />

      <ExecutorOrdersModal
        open={executorOrdersModal.open}
        onClose={() => setExecutorOrdersModal({ open: false, executor: null })}
        executor={executorOrdersModal.executor}
        orders={orders}
        onEditOrder={(order) => {
          setExecutorOrdersModal({ open: false, executor: null })
          setOrderModal({ open: true, order })
        }}
      />

      <UrgentOrderModal
        open={urgentModal.open}
        onClose={() => setUrgentModal({ open: false, product: null })}
        product={urgentModal.product}
        saving={orderMutations.create.isPending}
        onSave={(data) =>
          orderMutations.create.mutate(data, {
            onSuccess: () => setUrgentModal({ open: false, product: null }),
          })
        }
      />

      <ExpenseModal
        open={expenseModal.open}
        onClose={() => setExpenseModal({ open: false, expense: null })}
        expense={expenseModal.expense}
        saving={expenseMutations.create.isPending || expenseMutations.update.isPending}
        onSave={(data) => {
          if (expenseModal.expense) {
            expenseMutations.update.mutate(
              { id: expenseModal.expense.id, payload: data },
              { onSuccess: () => setExpenseModal({ open: false, expense: null }) },
            )
          } else {
            expenseMutations.create.mutate(data, {
              onSuccess: () => setExpenseModal({ open: false, expense: null }),
            })
          }
        }}
      />

      <OwnerDebtModal
        open={ownerDebtModal.open}
        onClose={() => setOwnerDebtModal({ open: false, debt: null })}
        debt={ownerDebtModal.debt}
        saving={ownerDebtMutations.create.isPending || ownerDebtMutations.update.isPending}
        onSave={(data) => {
          if (ownerDebtModal.debt) {
            ownerDebtMutations.update.mutate(
              { id: ownerDebtModal.debt.id, payload: data },
              { onSuccess: () => setOwnerDebtModal({ open: false, debt: null }) },
            )
          } else {
            ownerDebtMutations.create.mutate(data, {
              onSuccess: () => setOwnerDebtModal({ open: false, debt: null }),
            })
          }
        }}
      />

      {stats && (
        <OwnerDebtsListModal
          open={ownerDebtsListModal}
          onClose={() => setOwnerDebtsListModal(false)}
          stats={stats}
          ownerDebts={ownerDebts}
          onAddOwnerDebt={() => setOwnerDebtModal({ open: true, debt: null })}
          onEditOwnerDebt={(debt) => setOwnerDebtModal({ open: true, debt })}
          onDeleteOwnerDebt={(id) =>
            askDelete('حذف الدين', 'هل تريد حذف هذا الدين؟', () =>
              ownerDebtMutations.remove.mutate(id, { onSuccess: () => {
                setDeleteConfirm(null)
                // Don't close list modal so user stays there
              } }),
            )
          }
        />
      )}

      <CapitalModal
        open={capitalModal}
        onClose={() => setCapitalModal(false)}
        initialAmount={stats?.initialCapital ?? 0}
        saving={capitalMutation.isPending}
        onSave={(amount) =>
          capitalMutation.mutate(amount, { onSuccess: () => setCapitalModal(false) })
        }
      />

      {stats && (
        <>
          <CapitalBreakdownModal
            open={capitalBreakdownModal}
            onClose={() => setCapitalBreakdownModal(false)}
            total={stats.totalAvailableCapital}
            breakdown={stats.balanceBreakdown ?? []}
          />
          <MonthlyHistoryModal
            open={monthlyHistoryModal}
            onClose={() => setMonthlyHistoryModal(false)}
            history={stats.monthlyHistory}
          />
        </>
      )}

      <OrderTicketsModal
        open={orderTicketsModal.open}
        order={orderTicketsModal.order}
        onClose={() => setOrderTicketsModal({ open: false, order: null })}
      />

      <ImageLightbox
        open={lightbox.open}
        src={lightbox.src}
        onClose={() => setLightbox({ open: false, src: null })}
      />

      <ConfirmDeleteModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm?.onConfirm()}
        title={deleteConfirm?.title}
        description={deleteConfirm?.description}
        loading={deleteLoading}
      />

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-lg mx-auto flex items-stretch">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {isActive && (
                  <span className="absolute top-0 inset-x-4 h-0.5 bg-primary rounded-full" />
                )}
                <Icon className={cn('size-5', isActive && 'scale-110')} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
