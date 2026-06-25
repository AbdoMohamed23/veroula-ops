import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { StarRating } from '@/components/ops/StarRating'
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
import type { Executor } from '@/types/ops'

export function ExecutorModal({
  open,
  onClose,
  executor,
  onSave,
  saving,
}: {
  open: boolean
  onClose: () => void
  executor?: Executor | null
  onSave: (data: { name: string; phone: string; address: string; rating: number }) => void
  saving?: boolean
}) {
  const isEdit = !!executor
  const [form, setForm] = useState({ name: '', phone: '', address: '', rating: 5 })

  useEffect(() => {
    if (!open) return
    if (executor) {
      setForm({
        name: executor.name,
        phone: executor.phone,
        address: executor.address || '',
        rating: executor.rating,
      })
    } else {
      setForm({ name: '', phone: '', address: '', rating: 5 })
    }
  }, [executor, open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      rating: form.rating,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل المنفذ' : 'إضافة منفذ جديد'}</DialogTitle>
          <DialogDescription>بيانات منفذ من فريق العمل</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">الاسم *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-card h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">الهاتف *</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" className="bg-card h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">العنوان</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bg-card h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">التقييم</Label>
            <StarRating rating={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>إلغاء</Button>
            <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground">
              {saving ? <Loader2 className="size-4 animate-spin" /> : isEdit ? 'حفظ' : 'إضافة'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
