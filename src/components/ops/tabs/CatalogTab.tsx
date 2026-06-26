import { useMemo } from 'react'
import { ProductCard } from '@/components/ops/cards/ProductCard'
import { formatCurrency } from '@/lib/format'
import type { Product } from '@/types/ops'

export function CatalogTab({
  products,
  onDelete,
  onEdit,
  onSell,
}: {
  products: Product[]
  onDelete?: (id: string) => void
  onEdit?: (product: Product) => void
  onSell?: (product: Product) => void
}) {
  const stats = useMemo(() => {
    let costCapital = 0
    let sellingTotal = 0
    let totalStock = 0

    for (const p of products) {
      const stock = Math.max(0, p.stock)
      totalStock += stock
      costCapital += p.costPrice * stock
      sellingTotal += p.price * stock
    }

    return {
      productCount: products.length,
      costCapital,
      sellingTotal,
      totalStock,
    }
  }, [products])

  return (
    <div className="tab-content space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold">الكتالوج</h2>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] px-2 py-1 rounded-full bg-card border border-border text-foreground font-semibold">
            {stats.productCount}
          </span>
          <span className="text-[10px] px-2 py-1 rounded-full bg-card border border-border text-muted-foreground">
            الشراء:{' '}
            <span className="text-primary font-semibold">{formatCurrency(stats.costCapital)}</span>
          </span>
          <span className="text-[10px] px-2 py-1 rounded-full bg-card border border-border text-muted-foreground">
            البيع:{' '}
            <span className="text-primary font-semibold">{formatCurrency(stats.sellingTotal)}</span>
          </span>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">لا توجد منتجات</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 pb-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
              onSell={onSell}
            />
          ))}
        </div>
      )}
    </div>
  )
}
