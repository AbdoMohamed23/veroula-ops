import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TabId } from '@/types/ops'

const FAB_TABS: TabId[] = ['orders', 'supply', 'catalog', 'team']

export function OpsFab({ activeTab, onClick }: { activeTab: TabId; onClick: () => void }) {
  if (!FAB_TABS.includes(activeTab)) return null

  return (
    <Button
      type="button"
      aria-label="إضافة"
      className={cn(
        'fixed z-50 size-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 p-0',
        'bottom-[calc(5rem+env(safe-area-inset-bottom))] left-4 max-w-lg',
      )}
      style={{ position: 'fixed' }}
      onClick={onClick}
    >
      <Plus className="size-6" />
    </Button>
  )
}
