import { useEffect, useState } from 'react'
import { Loader2, Zap } from 'lucide-react'
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
import type { Product } from '@/types/ops'

export function UrgentOrderModal({
  open,
  onClose,
  product,
  onSave,
  saving,
}: {
  open: boolean
  onClose: () => void
  product: Product | null
  onSave: (data: Record<string, unknown>) => void
  saving?: boolean
}) {
  const [form, setForm] = useState({
    clientName: '',
    clientPhone: '',
    address: '',
    totalPrice: '',
    moderatorCommission: '',
    shippingCost: '',
  })

  useEffect(() => {
    if (open && product) {
      setForm((f) => ({ ...f, totalPrice: String(product.price) }))
    } else if (open) {
      setForm({
        clientName: '',
        clientPhone: '',
        address: '',
        totalPrice: '',
        moderatorCommission: '',
        shippingCost: '',
      })
    }
  }, [open, product])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.clientName.trim()) {
      toast.error('اسم العميل مطلوب')
      return
    }
    const total = Number(form.totalPrice)
    if (!total || total <= 0) {
      toast.error('السعر مطلوب')
      return
    }

    const images = product?.image
      ? product.image.startsWith('[')
        ? product.image
        : JSON.stringify([product.image])
      : '[]'

    onSave({
      clientName: form.clientName.trim(),
      clientPhone: form.clientPhone.trim(),
      address: form.address.trim(),
      totalPrice: total,
      moderatorCommission: Number(form.moderatorCommission) || 0,
      shippingCost: Number(form.shippingCost) || 0,
      isUrgent: true,
      productId: product?.id ?? null,
      images,
      status: 'pending',
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-background border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="size-4 text-yellow-400" /> بيع مستعجل
          </DialogTitle>
          <DialogDescription>
            {product ? `بيع: ${product.name}` : 'بيع من الكتالوج'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">اسم العميل *</Label>
            <Input
              value={form.clientName}
              onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
              className="bg-card border-border h-10 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">رقم الموبايل</Label>
              <Input
                value={form.clientPhone}
                onChange={(e) => setForm((f) => ({ ...f, clientPhone: e.target.value }))}
                dir="ltr"
                className="bg-card border-border h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">العنوان</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="bg-card border-border h-10 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">السعر *</Label>
              <Input
                type="number"
                value={form.totalPrice}
                onChange={(e) => setForm((f) => ({ ...f, totalPrice: e.target.value }))}
                dir="ltr"
                className="bg-card border-border h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">نسبة مودريتور</Label>
              <Input
                type="number"
                value={form.moderatorCommission}
                onChange={(e) => setForm((f) => ({ ...f, moderatorCommission: e.target.value }))}
                dir="ltr"
                className="bg-card border-border h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">الشحن (معلومة)</Label>
              <Input
                type="number"
                value={form.shippingCost}
                onChange={(e) => setForm((f) => ({ ...f, shippingCost: e.target.value }))}
                dir="ltr"
                className="bg-card border-border h-10 text-sm"
              />
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground">
            الشحن مجرد معلومة ولا يُخصم من الربح. المودريتور لا يُخصم حتى تسدده.
          </p>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={saving} className="bg-yellow-600 hover:bg-yellow-700 text-white">
              {saving ? <Loader2 className="size-4 animate-spin" /> : '⚡ إنشاء أوردر مستعجل'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
