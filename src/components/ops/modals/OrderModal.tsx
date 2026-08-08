import { useEffect, useState } from 'react'
import { Loader2, Plus, Trash2, UserCheck, Users } from 'lucide-react'
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
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Executor, Order, OrderExecutorItem, OrderStatus } from '@/types/ops'

type ExecutorMode = 'single' | 'multiple'

interface LocalExecutorItem {
  executorId: string
  price: string
  deposit: string
  deliveryPeriod: string
  images: string[]
  notes: string
}

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

  const [executorMode, setExecutorMode] = useState<ExecutorMode>('single')
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
    notes: '',
  })
  const [images, setImages] = useState<string[]>([])
  const [executorsDetail, setExecutorsDetail] = useState<LocalExecutorItem[]>([])

  useEffect(() => {
    if (!open) return
    if (order) {
      const hasMulti = Array.isArray(order.executorsDetail) && order.executorsDetail.length > 0
      setExecutorMode(hasMulti ? 'multiple' : 'single')
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
        notes: order.notes || '',
      })
      try {
        setImages(JSON.parse(order.images || '[]'))
      } catch {
        setImages([])
      }

      if (hasMulti) {
        setExecutorsDetail(
          (order.executorsDetail || []).map((e) => ({
            executorId: e.executorId,
            price: String(e.price),
            deposit: String(e.deposit),
            deliveryPeriod: e.deliveryPeriod || '',
            images: e.images || [],
            notes: e.notes || '',
          })),
        )
      } else {
        setExecutorsDetail([])
      }
    } else {
      setExecutorMode('single')
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
        notes: '',
      })
      setImages([])
      setExecutorsDetail([])
    }
  }, [order, open, executors])

  function handleAddExecutorItem() {
    setExecutorsDetail((prev) => [
      ...prev,
      {
        executorId: executors[0]?.id || '',
        price: '',
        deposit: '',
        deliveryPeriod: '',
        images: [],
        notes: '',
      },
    ])
  }

  function handleRemoveExecutorItem(index: number) {
    setExecutorsDetail((prev) => prev.filter((_, i) => i !== index))
  }

  function handleUpdateExecutorItem(
    index: number,
    field: keyof LocalExecutorItem,
    value: string | string[],
  ) {
    setExecutorsDetail((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    )
  }

  const multiTotals = executorsDetail.reduce(
    (acc, curr) => {
      const p = Number(curr.price) || 0
      const d = Number(curr.deposit) || 0
      return {
        totalPrice: acc.totalPrice + p,
        totalDeposit: acc.totalDeposit + d,
        totalRemaining: acc.totalRemaining + (p - d),
      }
    },
    { totalPrice: 0, totalDeposit: 0, totalRemaining: 0 },
  )

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
      notes: form.notes.trim(),
    }

    if (isUrgent) {
      onSave({
        ...base,
        deposit: 0,
        executorId: null,
        executorPrice: 0,
        executorDeposit: 0,
        deliveryPeriod: '',
        executorsDetail: null,
        ...(isEdit ? { status: form.status } : {}),
      })
      return
    }

    if (executorMode === 'multiple' && executorsDetail.length > 0) {
      const validItems: OrderExecutorItem[] = executorsDetail
        .filter((item) => !!item.executorId)
        .map((item) => {
          const exObj = executors.find((ex) => ex.id === item.executorId)
          const p = Number(item.price) || 0
          const d = Number(item.deposit) || 0
          return {
            executorId: item.executorId,
            executorName: exObj?.name || '',
            price: p,
            deposit: d,
            remaining: p - d,
            deliveryPeriod: item.deliveryPeriod,
            images: item.images,
            notes: item.notes.trim(),
          }
        })

      const combinedPeriods = Array.from(
        new Set(validItems.map((i) => i.deliveryPeriod).filter(Boolean)),
      ).join(' | ')

      onSave({
        ...base,
        deposit: Number(form.deposit) || 0,
        executorId: validItems[0]?.executorId || null,
        executorPrice: multiTotals.totalPrice,
        executorDeposit: multiTotals.totalDeposit,
        deliveryPeriod: combinedPeriods,
        executorsDetail: validItems,
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
      executorsDetail: null,
      ...(isEdit ? { status: form.status } : {}),
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل الأوردر' : 'إضافة أوردر جديد'}</DialogTitle>
          <DialogDescription>بيانات العميل، المنفذين والأسعار</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">الصور العامة للأوردر</Label>
            <SimpleImageUpload images={images} onChange={setImages} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">اسم العميل *</Label>
            <Input
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              className="bg-card h-10"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">هاتف العميل</Label>
            <Input
              value={form.clientPhone}
              onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
              dir="ltr"
              className="bg-card h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">العنوان</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="bg-card h-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">الإجمالي الكلي للأوردر *</Label>
              <Input
                type="number"
                value={form.totalPrice}
                onChange={(e) => setForm({ ...form, totalPrice: e.target.value })}
                dir="ltr"
                className="bg-card h-10"
                required
              />
            </div>
            {!isUrgent && (
              <div className="space-y-1.5">
                <Label className="text-xs">عربون العميل</Label>
                <Input
                  type="number"
                  value={form.deposit}
                  onChange={(e) => setForm({ ...form, deposit: e.target.value })}
                  dir="ltr"
                  className="bg-card h-10"
                />
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">الشحن (معلومة)</Label>
            <Input
              type="number"
              value={form.shippingCost}
              onChange={(e) => setForm({ ...form, shippingCost: e.target.value })}
              dir="ltr"
              className="bg-card h-10"
            />
          </div>

          {!isUrgent && (
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Users className="size-4 text-primary" />
                  تنفيذ الأوردر
                </Label>
                <div className="flex gap-1 bg-muted p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setExecutorMode('single')}
                    className={cn(
                      'px-3 py-1 text-xs rounded-lg font-medium transition-colors flex items-center gap-1',
                      executorMode === 'single'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <UserCheck className="size-3.5" /> منفذة واحدة
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExecutorMode('multiple')
                      if (executorsDetail.length === 0) {
                        handleAddExecutorItem()
                      }
                    }}
                    className={cn(
                      'px-3 py-1 text-xs rounded-lg font-medium transition-colors flex items-center gap-1',
                      executorMode === 'multiple'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Users className="size-3.5" /> أكثر من منفذة
                  </button>
                </div>
              </div>

              {executorMode === 'single' ? (
                <div className="space-y-3 bg-muted/30 p-3 rounded-xl border border-border/50">
                  <div className="space-y-1.5">
                    <Label className="text-xs">اختر المنفذة</Label>
                    <select
                      value={form.executorId}
                      onChange={(e) => setForm({ ...form, executorId: e.target.value })}
                      className="w-full h-10 rounded-md border border-border bg-card px-3 text-sm"
                    >
                      <option value="none">بدون منفذ</option>
                      {executors.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">سعر المنفذة</Label>
                      <Input
                        type="number"
                        value={form.executorPrice}
                        onChange={(e) => setForm({ ...form, executorPrice: e.target.value })}
                        dir="ltr"
                        className="bg-card h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">عربون المنفذة</Label>
                      <Input
                        type="number"
                        value={form.executorDeposit}
                        onChange={(e) => setForm({ ...form, executorDeposit: e.target.value })}
                        dir="ltr"
                        className="bg-card h-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">مدة التسليم</Label>
                    <Input
                      value={form.deliveryPeriod}
                      onChange={(e) => setForm({ ...form, deliveryPeriod: e.target.value })}
                      placeholder="مثال: 5 أيام"
                      className="bg-card h-10"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {executorsDetail.map((item, idx) => {
                    const priceNum = Number(item.price) || 0
                    const depNum = Number(item.deposit) || 0
                    const remNum = priceNum - depNum
                    return (
                      <div
                        key={idx}
                        className="bg-card border border-border/80 rounded-2xl p-3.5 space-y-3 relative shadow-sm hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-border/40">
                          <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                            <span className="size-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            تفاصيل المنفذة رقم #{idx + 1}
                          </span>
                          {executorsDetail.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-red-400 hover:text-red-500 hover:bg-red-500/10 px-2"
                              onClick={() => handleRemoveExecutorItem(idx)}
                            >
                              <Trash2 className="size-3.5 ml-1" /> إزالة
                            </Button>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[11px] text-muted-foreground">المنفذة *</Label>
                          <select
                            value={item.executorId}
                            onChange={(e) =>
                              handleUpdateExecutorItem(idx, 'executorId', e.target.value)
                            }
                            className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs"
                          >
                            <option value="">اختر منفذة...</option>
                            {executors.map((ex) => (
                              <option key={ex.id} value={ex.id}>
                                {ex.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground">
                              السعر للمنفذة
                            </Label>
                            <Input
                              type="number"
                              value={item.price}
                              onChange={(e) =>
                                handleUpdateExecutorItem(idx, 'price', e.target.value)
                              }
                              placeholder="0"
                              dir="ltr"
                              className="bg-background h-9 rounded-xl text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground">
                              العربون لها
                            </Label>
                            <Input
                              type="number"
                              value={item.deposit}
                              onChange={(e) =>
                                handleUpdateExecutorItem(idx, 'deposit', e.target.value)
                              }
                              placeholder="0"
                              dir="ltr"
                              className="bg-background h-9 rounded-xl text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center bg-muted/40 px-2.5 py-1.5 rounded-lg text-[11px]">
                          <span className="text-muted-foreground">المتبقي لهذه المنفذة:</span>
                          <span className="font-semibold text-amber-500" dir="ltr">
                            {formatCurrency(remNum)}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">مدة التسليم</Label>
                          <Input
                            value={item.deliveryPeriod}
                            onChange={(e) =>
                              handleUpdateExecutorItem(idx, 'deliveryPeriod', e.target.value)
                            }
                            placeholder="مثال: 3 أيام"
                            className="bg-background h-9 rounded-xl text-xs"
                          />
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <Label className="text-[11px] text-muted-foreground flex items-center justify-between">
                            <span>صور القطع الخاصة بهذه المنفذة</span>
                            <span className="text-[10px] text-primary">
                              ({item.images.length} صورة)
                            </span>
                          </Label>
                          <SimpleImageUpload
                            images={item.images}
                            onChange={(urls) => handleUpdateExecutorItem(idx, 'images', urls)}
                            max={6}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">
                            ملاحظات أو وصف القطع (اختياري)
                          </Label>
                          <Input
                            value={item.notes}
                            onChange={(e) =>
                              handleUpdateExecutorItem(idx, 'notes', e.target.value)
                            }
                            placeholder="مثال: قطعة 1 و 2 بلون أحمر"
                            className="bg-background h-8 rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    )
                  })}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 rounded-xl border-dashed border-primary/40 text-primary hover:bg-primary/5 text-xs font-semibold"
                    onClick={handleAddExecutorItem}
                  >
                    <Plus className="size-4 ml-1" /> إضافة منفذة أخرى للأوردر
                  </Button>

                  {executorsDetail.length > 0 && (
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 space-y-1 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>إجمالي سعر المنفذات:</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(multiTotals.totalPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>إجمالي عربون المنفذات:</span>
                        <span className="font-semibold text-green-500">
                          {formatCurrency(multiTotals.totalDeposit)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-primary/20 font-bold">
                        <span>إجمالي المتبقي للمنفذات:</span>
                        <span className="text-amber-500">
                          {formatCurrency(multiTotals.totalRemaining)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">عمولة المودريتور</Label>
            <Input
              type="number"
              value={form.moderatorCommission}
              onChange={(e) => setForm({ ...form, moderatorCommission: e.target.value })}
              dir="ltr"
              className="bg-card h-10"
            />
          </div>
          {isEdit && (
            <div className="space-y-1.5">
              <Label className="text-xs">الحالة</Label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as OrderStatus })}
                className="w-full h-10 rounded-md border border-border bg-card px-3 text-sm"
              >
                <option value="pending">معلق</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">ملاحظات الأوردر العامة</Label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full min-h-[70px] rounded-md border border-border bg-card p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              إلغاء
            </Button>
            <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground">
              {saving ? <Loader2 className="size-4 animate-spin" /> : isEdit ? 'حفظ' : 'إضافة'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
