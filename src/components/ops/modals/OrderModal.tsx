import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { SimpleImageUpload } from '@/components/ops/shared/SimpleImageUpload'
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
import type { Executor, Order, OrderStatus } from '@/types/ops'

export function OrderModal({
  open,
  onClose,
  order,
  executors,
  onSave,
  saving,
}: {
  open: boolean
  onClose: () => void
  order?: Order | null
  executors: Executor[]
  onSave: (data: Record<string, unknown>) => void
  saving?: boolean
}) {
  const isEdit = !!order
  const isUrgent = order?.isUrgent ?? false

  const [form, setForm] = useState({
    clientName: '',
    clientPhone: '',
    address: '',
    totalPrice: '',
    deposit: '',
    shippingCost: '',
    executorId: 'none',
    executorPrice: '',
    executorDeposit: '',
    moderatorCommission: '',
    deliveryPeriod: '',
    status: 'pending' as OrderStatus,
  })
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    if (order) {
      setForm({
        clientName: order.clientName,
        clientPhone: order.clientPhone,
        address: order.address,
        totalPrice: String(order.totalPrice),
        deposit: String(order.deposit),
        shippingCost: String(order.shippingCost),
        executorId: order.executorId || 'none',
        executorPrice: String(order.executorPrice),
        executorDeposit: String(order.executorDeposit),
        moderatorCommission: String(order.moderatorCommission),
        deliveryPeriod: order.deliveryPeriod,
        status: order.status,
      })
      try {
        setImages(JSON.parse(order.images || '[]'))
      } catch {
        setImages([])
      }
    } else {
      setForm({
        clientName: '',
        clientPhone: '',
        address: '',
        totalPrice: '',
        deposit: '',
        shippingCost: '',
        executorId: executors[0]?.id ?? 'none',
        executorPrice: '',
        executorDeposit: '',
        moderatorCommission: '',
        deliveryPeriod: '',
        status: 'pending',
      })
      setImages([])
    }
  }, [order, open, executors])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const base = {
      images: JSON.stringify(images),
      clientName: form.clientName.trim(),
      clientPhone: form.clientPhone,
      address: form.address,
      totalPrice: Number(form.totalPrice),
      shippingCost: Number(form.shippingCost) || 0,
      moderatorCommission: Number(form.moderatorCommission) || 0,
    }

    if (isUrgent) {
      onSave({
        ...base,
        deposit: 0,
        executorId: null,
        executorPrice: 0,
        executorDeposit: 0,
        deliveryPeriod: '',
        ...(isEdit ? { status: form.status } : {}),
      })
      return
    }

    onSave({
      ...base,
      deposit: Number(form.deposit) || 0,
      executorId: form.executorId === 'none' ? null : form.executorId,
      executorPrice: Number(form.executorPrice) || 0,
      executorDeposit: Number(form.executorDeposit) || 0,
      deliveryPeriod: form.deliveryPeriod,
      ...(isEdit ? { status: form.status } : {}),
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل الأوردر' : 'إضافة أوردر جديد'}</DialogTitle>
          <DialogDescription>بيانات العميل والمنفذ والأسعار</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">الصور</Label>
            <SimpleImageUpload images={images} onChange={setImages} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">اسم العميل *</Label>
            <Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className="bg-card h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">هاتف العميل</Label>
            <Input value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} dir="ltr" className="bg-card h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">العنوان</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bg-card h-10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">الإجمالي *</Label>
              <Input type="number" value={form.totalPrice} onChange={(e) => setForm({ ...form, totalPrice: e.target.value })} dir="ltr" className="bg-card h-10" />
            </div>
            {!isUrgent && (
              <div className="space-y-1.5">
                <Label className="text-xs">العربون</Label>
                <Input type="number" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} dir="ltr" className="bg-card h-10" />
              </div>
            )}
          </div>
          {!isUrgent && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">المنفذ</Label>
                <select
                  value={form.executorId}
                  onChange={(e) => setForm({ ...form, executorId: e.target.value })}
                  className="w-full h-10 rounded-md border border-border bg-card px-3 text-sm"
                >
                  <option value="none">بدون منفذ</option>
                  {executors.map((ex) => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">سعر المنفذ</Label>
                  <Input type="number" value={form.executorPrice} onChange={(e) => setForm({ ...form, executorPrice: e.target.value })} dir="ltr" className="bg-card h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">عربون المنفذ</Label>
                  <Input type="number" value={form.executorDeposit} onChange={(e) => setForm({ ...form, executorDeposit: e.target.value })} dir="ltr" className="bg-card h-10" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">مدة التسليم</Label>
                <Input value={form.deliveryPeriod} onChange={(e) => setForm({ ...form, deliveryPeriod: e.target.value })} className="bg-card h-10" />
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">عمولة المودريتور</Label>
            <Input type="number" value={form.moderatorCommission} onChange={(e) => setForm({ ...form, moderatorCommission: e.target.value })} dir="ltr" className="bg-card h-10" />
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
