import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { OwnerDebt } from '@/types/ops'

export function OwnerDebtModal({
  open,
  onClose,
  debt,
  onSave,
  saving,
}: {
  open: boolean
  onClose: () => void
  debt?: OwnerDebt | null
  onSave: (data: { name: string; amount: number }) => void
  saving?: boolean
}) {
  const isEdit = !!debt
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (!open) return
    if (debt) {
      setName(debt.name)
      setAmount(String(debt.amount))
    } else {
      setName('')
      setAmount('')
    }
  }, [debt, open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('اسم الدين مطلوب')
      return
    }
    const num = Number(amount)
    if (!num || num <= 0) {
      toast.error('أدخل مبلغاً صحيحاً')
      return
    }
    onSave({ name: name.trim(), amount: num })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-background border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل الدين' : 'إضافة دين مالكين'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'عدّل بيانات الدين' : 'يُخصم مباشرة من الرصيد الكلي'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">اسم الدين / البيان *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: دين مالك أحمد، قرض..."
              className="bg-card border-border h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">المبلغ (ج.م) *</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              dir="ltr"
              className="bg-card border-border h-10"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              إلغاء
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : isEdit ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
