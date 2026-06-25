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
import type { Executor, SupplyOrder } from '@/types/ops'

export function SupplyOrderModal({
  open,
  onClose,
  order,
  executors,
  onSave,
  saving,
}: {
  open: boolean
  onClose: () => void
  order?: SupplyOrder | null
  executors: Executor[]
  onSave: (data: {
    executorName: string
    phone: string
    address: string
    price: number
    deposit: number
    shippingCost: number
    deliveryDate: string
    images: string
  }) => void
  saving?: boolean
}) {
  const isEdit = !!order
  const [images, setImages] = useState<string[]>([])
  const [useCustom, setUseCustom] = useState(false)
  const [form, setForm] = useState({
    executorName: '',
    phone: '',
    address: '',
    price: '',
    deposit: '',
    shippingCost: '',
    deliveryDate: '',
  })

  useEffect(() => {
    if (!open) return
    if (order) {
      try {
        setImages(JSON.parse(order.images))
      } catch {
        setImages([])
      }
      setForm({
        executorName: order.executorName,
        phone: order.phone,
        address: order.address,
        price: String(order.price),
        deposit: String(order.deposit),
        shippingCost: String(order.shippingCost),
        deliveryDate: order.deliveryDate,
      })
      setUseCustom(!executors.some((e) => e.name === order.executorName))
    } else {
      setImages([])
      setForm({ executorName: '', phone: '', address: '', price: '', deposit: '', shippingCost: '', deliveryDate: '' })
      setUseCustom(false)
    }
  }, [order, open, executors])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      executorName: form.executorName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      price: Number(form.price),
      deposit: Number(form.deposit) || 0,
      shippingCost: Number(form.shippingCost) || 0,
      deliveryDate: form.deliveryDate,
      images: JSON.stringify(images),
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل المشتريات' : 'طلب توريد جديد'}</DialogTitle>
          <DialogDescription>مشتريات من الموردين — العربون يُخصم من الرصيد</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SimpleImageUpload images={images} onChange={setImages} />
          <div className="space-y-2">
            <Label className="text-xs">اسم المنفذ / المورد *</Label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setUseCustom(false)} className={`text-xs px-3 py-1 rounded-full border ${!useCustom ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>من الفريق</button>
              <button type="button" onClick={() => setUseCustom(true)} className={`text-xs px-3 py-1 rounded-full border ${useCustom ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>جديد</button>
            </div>
            {!useCustom ? (
              <select
                value={form.executorName}
                onChange={(e) => {
                  const ex = executors.find((x) => x.name === e.target.value)
                  setForm((f) => ({ ...f, executorName: e.target.value, phone: ex?.phone || f.phone }))
                }}
                className="w-full h-10 rounded-md border border-border bg-card px-3 text-sm"
              >
                <option value="">اختر...</option>
                {executors.map((e) => (
                  <option key={e.id} value={e.name}>{e.name}</option>
                ))}
              </select>
            ) : (
              <Input value={form.executorName} onChange={(e) => setForm({ ...form, executorName: e.target.value })} className="bg-card h-10" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">الهاتف</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" className="bg-card h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">تاريخ الاستلام</Label>
              <Input type="date" value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} dir="ltr" className="bg-card h-10" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">الإجمالي *</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} dir="ltr" className="bg-card h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">العربون</Label>
              <Input type="number" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} dir="ltr" className="bg-card h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">الشحن</Label>
              <Input type="number" value={form.shippingCost} onChange={(e) => setForm({ ...form, shippingCost: e.target.value })} dir="ltr" className="bg-card h-10" />
            </div>
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
