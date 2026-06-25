import { BookOpen, Edit3, ShoppingCart, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import type { Product } from '@/types/ops'

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onSell,
}: {
  product: Product
  onEdit?: (product: Product) => void
  onDelete?: (id: string) => void
  onSell?: (product: Product) => void
}) {
  let displayImg = ''
  if (product.image) {
    try {
      if (product.image.startsWith('[')) {
        const parsed = JSON.parse(product.image)
        displayImg = parsed[0] || ''
      } else {
        displayImg = product.image
      }
    } catch {
      displayImg = product.image
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3 relative group overflow-hidden">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-background border border-border">
        {displayImg ? (
          <img
            src={displayImg}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${product.stock <= 0 ? 'opacity-50' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-1">
            <BookOpen className="size-8" />
            <span className="text-[10px]">بدون صورة</span>
          </div>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="text-red-400 font-bold text-sm border border-red-400/40 px-3 py-1 rounded-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-start gap-1">
          <h3 className="text-foreground font-semibold text-sm truncate flex-1">{product.name}</h3>
          <Badge
            className={
              product.stock > 0
                ? 'bg-primary/10 text-primary border-primary/20 text-[10px]'
                : 'bg-red-500/10 text-red-400 border-red-500/20 text-[10px]'
            }
          >
            {product.stock > 0 ? `متوفر: ${product.stock}` : 'نفذت'}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-primary font-medium text-xs">{formatCurrency(product.price)}</p>
          {product.costPrice > 0 && (
            <p className="text-muted-foreground text-[10px]">
              الشراء: {formatCurrency(product.costPrice)}
            </p>
          )}
        </div>
      </div>

      {onSell && product.stock > 0 && (
        <Button
          size="sm"
          className="w-full bg-primary/90 hover:bg-primary text-primary-foreground h-8 text-xs rounded-xl"
          onClick={() => onSell(product)}
        >
          <ShoppingCart className="size-3.5 ml-1" /> بيع سريع
        </Button>
      )}

      <div className="flex gap-2">
        <Button size="sm" variant="ghost" className="h-8 px-2 flex-1" onClick={() => onEdit?.(product)}>
          <Edit3 className="size-3.5 ml-1" /> تعديل
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-red-400 h-8 px-2"
          onClick={() => onDelete?.(product.id)}
        >
          <Trash2 className="size-3.5 ml-1" /> حذف
        </Button>
      </div>
    </div>
  )
}
