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
  const catalogCapital = products.reduce(
    (sum, p) => sum + p.costPrice * Math.max(0, p.stock),
    0,
  )

  return (
    <div className="tab-content space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">الكتالوج</h2>
        <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
          رأس مال البضاعة: {formatCurrency(catalogCapital)}
        </span>
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
