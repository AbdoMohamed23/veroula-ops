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
  onSave: (data: {
    owner: 'abdo' | 'osha'
    type: 'withdraw' | 'repay' | 'ops_owes'
    name: string
    amount: number
  }) => void
  saving?: boolean
}) {
  const isEdit = !!debt
  const [owner, setOwner] = useState<'abdo' | 'osha'>('abdo')
  const [type, setType] = useState<'withdraw' | 'repay' | 'ops_owes'>('withdraw')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (!open) return
    if (debt) {
      setOwner(debt.owner)
      setType(debt.type)
      setName(debt.name)
      setAmount(String(debt.amount))
    } else {
      setOwner('abdo')
      setType('withdraw')
      setName('')
      setAmount('')
    }
  }, [debt, open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('البيان مطلوب')
      return
    }
    const num = Number(amount)
    if (!num || num <= 0) {
      toast.error('أدخل مبلغاً صحيحاً')
      return
    }
    onSave({
      owner,
      type,
      name: name.trim(),
      amount: num,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-background border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل حركة ديون المالكين' : 'إضافة حركة ديون المالكين'}</DialogTitle>
          <DialogDescription>
            سحب سلف، تسديد دين، أو تسجيل التزام مالي على الموقع للمالك
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">المالك *</Label>
              <select
                value={owner}
                onChange={(e) => setOwner(e.target.value as 'abdo' | 'osha')}
                className="w-full h-10 rounded-md border border-border bg-card px-3 text-sm"
              >
                <option value="abdo">عبده (Abdo)</option>
                <option value="osha">أوشا (Osha)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">نوع المعاملة *</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'withdraw' | 'repay' | 'ops_owes')}
                className="w-full h-10 rounded-md border border-border bg-card px-3 text-sm"
              >
                <option value="withdraw">سحب شخصي / سلفة</option>
                <option value="repay">تسديد جزء من الدين</option>
                <option value="ops_owes">OPS عليه للمالك</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">البيان / الوصف *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: سحب سلفة للمصاريف الشخصية، تسديد..."
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
