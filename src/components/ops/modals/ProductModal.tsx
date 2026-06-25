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
import type { Product } from '@/types/ops'

export function ProductModal({
  open,
  onClose,
  product,
  onSave,
  saving,
}: {
  open: boolean
  onClose: () => void
  product?: Product | null
  onSave: (data: {
    name: string
    description: string
    price: number
    costPrice: number
    stock: number
    image: string
  }) => void
  saving?: boolean
}) {
  const isEdit = !!product
  const [form, setForm] = useState({ name: '', description: '', price: '', costPrice: '', stock: '' })
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        price: String(product.price),
        costPrice: String(product.costPrice),
        stock: String(product.stock),
      })
      try {
        if (product.image.startsWith('[')) setImages(JSON.parse(product.image))
        else if (product.image) setImages([product.image])
        else setImages([])
      } catch {
        setImages(product.image ? [product.image] : [])
      }
    } else {
      setForm({ name: '', description: '', price: '', costPrice: '', stock: '' })
      setImages([])
    }
  }, [product, open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      costPrice: Number(form.costPrice) || 0,
      stock: Number(form.stock) || 0,
      image: images.length > 1 ? JSON.stringify(images) : images[0] || '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل المنتج' : 'إضافة منتج للكتالوج'}</DialogTitle>
          <DialogDescription>منتجات المخزن والكتالوج</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SimpleImageUpload images={images} onChange={setImages} />
          <div className="space-y-1.5">
            <Label className="text-xs">اسم المنتج *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-card h-10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">سعر البيع *</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} dir="ltr" className="bg-card h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">سعر الشراء *</Label>
              <Input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} dir="ltr" className="bg-card h-10" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">المخزون *</Label>
            <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} dir="ltr" className="bg-card h-10" />
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
