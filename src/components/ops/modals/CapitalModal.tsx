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

export function CapitalModal({
  open,
  onClose,
  initialAmount,
  onSave,
  saving,
}: {
  open: boolean
  onClose: () => void
  initialAmount: number
  onSave: (amount: number) => void
  saving?: boolean
}) {
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (open) setAmount(String(initialAmount))
  }, [open, initialAmount])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = Number(amount)
    if (Number.isNaN(num) || num < 0) {
      toast.error('أدخل رقماً صحيحاً')
      return
    }
    onSave(num)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-background border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل رأس المال الأساسي</DialogTitle>
          <DialogDescription>رأس المال المبدئي لتسجيل الأرباح</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">رأس المال (ج.م)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              dir="ltr"
              className="bg-card border-border h-10"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              إلغاء
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : 'حفظ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
