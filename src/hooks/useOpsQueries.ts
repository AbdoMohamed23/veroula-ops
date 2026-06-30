import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchActivities } from '@/lib/services/activities'
import { updateCapitalAmount } from '@/lib/services/capital'
import {
  createExpense,
  deleteExpense,
  fetchExpenses,
  updateExpense,
} from '@/lib/services/expenses'
import {
  createExecutor,
  deleteExecutor,
  fetchExecutors,
  updateExecutor,
} from '@/lib/services/executors'
import { createModeratorPayment, fetchModeratorPayments } from '@/lib/services/moderator'
import {
  createOrder,
  deleteOrder,
  fetchOrders,
  updateOrder,
  updateOrderStatus,
} from '@/lib/services/orders'
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from '@/lib/services/products'
import { computeStats } from '@/lib/services/stats'
import {
  createOwnerDebt,
  deleteOwnerDebt,
  fetchOwnerDebts,
  updateOwnerDebt,
} from '@/lib/services/owner-debts'
import {
  createSupplyOrder,
  deleteSupplyOrder,
  fetchSupplyOrders,
  updateSupplyOrder,
  updateSupplyOrderStatus,
} from '@/lib/services/supply'

export const opsKeys = {
  orders: ['orders'] as const,
  executors: ['executors'] as const,
  products: ['products'] as const,
  expenses: ['expenses'] as const,
  supplyOrders: ['supply-orders'] as const,
  stats: ['stats'] as const,
  activities: ['activities'] as const,
  moderatorPayments: ['moderator-payments'] as const,
  ownerDebts: ['owner-debts'] as const,
}

function invalidateCore(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: opsKeys.stats })
  void queryClient.invalidateQueries({ queryKey: opsKeys.activities })
}

export function useOrders() {
  return useQuery({ queryKey: opsKeys.orders, queryFn: () => fetchOrders() })
}

export function useExecutors() {
  return useQuery({ queryKey: opsKeys.executors, queryFn: fetchExecutors })
}

export function useProducts() {
  return useQuery({ queryKey: opsKeys.products, queryFn: fetchProducts })
}

export function useExpenses() {
  return useQuery({ queryKey: opsKeys.expenses, queryFn: fetchExpenses })
}

export function useSupplyOrders() {
  return useQuery({ queryKey: opsKeys.supplyOrders, queryFn: fetchSupplyOrders })
}

export function useStats() {
  return useQuery({ queryKey: opsKeys.stats, queryFn: computeStats })
}

export function useActivities() {
  return useQuery({ queryKey: opsKeys.activities, queryFn: () => fetchActivities(15) })
}

export function useModeratorPayments() {
  return useQuery({ queryKey: opsKeys.moderatorPayments, queryFn: fetchModeratorPayments })
}

export function useOwnerDebts() {
  return useQuery({ queryKey: opsKeys.ownerDebts, queryFn: fetchOwnerDebts })
}

export function useOrderMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: opsKeys.orders })
    invalidateCore(queryClient)
  }

  return {
    complete: useMutation({
      mutationFn: (id: string) => updateOrderStatus(id, 'completed', 'تم إكمال أوردر'),
      onSuccess: () => {
        invalidate()
        toast.success('تم إكمال الأوردر')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    cancel: useMutation({
      mutationFn: (id: string) => updateOrderStatus(id, 'cancelled', 'تم إلغاء أوردر'),
      onSuccess: () => {
        invalidate()
        void queryClient.invalidateQueries({ queryKey: opsKeys.products })
        toast.success('تم إلغاء الأوردر')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    remove: useMutation({
      mutationFn: deleteOrder,
      onSuccess: () => {
        invalidate()
        toast.success('تم حذف الأوردر')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    create: useMutation({
      mutationFn: createOrder,
      onSuccess: (_data, variables) => {
        invalidate()
        if (variables.isUrgent) {
          void queryClient.invalidateQueries({ queryKey: opsKeys.products })
        }
        toast.success(variables.isUrgent ? 'تم إنشاء الأوردر المستعجل ⚡' : 'تم إنشاء الأوردر')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateOrder>[1] }) =>
        updateOrder(id, payload),
      onSuccess: (_data, variables) => {
        invalidate()
        if (variables.payload.status) {
          void queryClient.invalidateQueries({ queryKey: opsKeys.products })
        }
        toast.success('تم تحديث الأوردر')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
  }
}

export function useSupplyMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: opsKeys.supplyOrders })
    invalidateCore(queryClient)
  }

  return {
    complete: useMutation({
      mutationFn: (id: string) => updateSupplyOrderStatus(id, 'completed'),
      onSuccess: () => {
        invalidate()
        toast.success('تم إكمال المشتريات')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    cancel: useMutation({
      mutationFn: (id: string) => updateSupplyOrderStatus(id, 'cancelled'),
      onSuccess: () => {
        invalidate()
        toast.info('تم إلغاء المشتريات')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    remove: useMutation({
      mutationFn: deleteSupplyOrder,
      onSuccess: () => {
        invalidate()
        toast.success('تم الحذف')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    create: useMutation({
      mutationFn: createSupplyOrder,
      onSuccess: () => {
        invalidate()
        toast.success('تمت إضافة المشتريات')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateSupplyOrder>[1] }) =>
        updateSupplyOrder(id, payload),
      onSuccess: () => {
        invalidate()
        toast.success('تم تحديث المشتريات')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
  }
}

export function useExecutorMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: opsKeys.executors })
    invalidateCore(queryClient)
  }

  return {
    remove: useMutation({
      mutationFn: deleteExecutor,
      onSuccess: () => {
        invalidate()
        toast.success('تم حذف المنفذ')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    create: useMutation({
      mutationFn: createExecutor,
      onSuccess: () => {
        invalidate()
        toast.success('تم إضافة المنفذ')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateExecutor>[1] }) =>
        updateExecutor(id, payload),
      onSuccess: () => {
        invalidate()
        toast.success('تم التحديث')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
  }
}

export function useProductMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: opsKeys.products })
    invalidateCore(queryClient)
  }

  return {
    remove: useMutation({
      mutationFn: deleteProduct,
      onSuccess: () => {
        invalidate()
        toast.success('تم حذف المنتج')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    create: useMutation({
      mutationFn: createProduct,
      onSuccess: () => {
        invalidate()
        toast.success('تم إضافة المنتج')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateProduct>[1] }) =>
        updateProduct(id, payload),
      onSuccess: () => {
        invalidate()
        toast.success('تم التحديث')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
  }
}

export function useExpenseMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: opsKeys.expenses })
    invalidateCore(queryClient)
  }

  return {
    remove: useMutation({
      mutationFn: deleteExpense,
      onSuccess: () => {
        invalidate()
        toast.success('تم حذف المصروف')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    create: useMutation({
      mutationFn: createExpense,
      onSuccess: () => {
        invalidate()
        toast.success('تمت إضافة المصروف')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateExpense>[1] }) =>
        updateExpense(id, payload),
      onSuccess: () => {
        invalidate()
        toast.success('تم التحديث')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
  }
}

export function useCapitalMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateCapitalAmount,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: opsKeys.stats })
      void queryClient.invalidateQueries({ queryKey: opsKeys.activities })
      toast.success('تم تحديث رأس المال')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useModeratorPaymentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createModeratorPayment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: opsKeys.moderatorPayments })
      invalidateCore(queryClient)
      toast.success('تم تسديد المبلغ للمودريتور')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useOwnerDebtMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: opsKeys.ownerDebts })
    invalidateCore(queryClient)
  }

  return {
    remove: useMutation({
      mutationFn: deleteOwnerDebt,
      onSuccess: () => {
        invalidate()
        toast.success('تم حذف الدين')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    create: useMutation({
      mutationFn: createOwnerDebt,
      onSuccess: () => {
        invalidate()
        toast.success('تمت إضافة الدين')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateOwnerDebt>[1] }) =>
        updateOwnerDebt(id, payload),
      onSuccess: () => {
        invalidate()
        toast.success('تم تحديث الدين')
      },
      onError: (e: Error) => toast.error(e.message),
    }),
  }
}
