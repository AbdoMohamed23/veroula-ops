import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { OrderStatus } from '@/types/ops'

export function getStatusBadge(status: OrderStatus) {
  switch (status) {
    case 'pending':
      return (
        <span className="text-amber-400 text-[10px] flex items-center gap-1">
          <Clock className="size-3" /> معلق
        </span>
      )
    case 'completed':
      return (
        <span className="text-green-400 text-[10px] flex items-center gap-1">
          <CheckCircle2 className="size-3" /> مكتمل
        </span>
      )
    case 'cancelled':
      return (
        <span className="text-red-400 text-[10px] flex items-center gap-1">
          <XCircle className="size-3" /> ملغي
        </span>
      )
  }
}
