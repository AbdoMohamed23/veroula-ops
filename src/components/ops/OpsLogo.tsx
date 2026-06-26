import { cn } from '@/lib/utils'

export function OpsIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-bold leading-none select-none rounded-md bg-black text-white',
        className,
      )}
      aria-hidden
    >
      $
    </span>
  )
}

export function OpsBrand({ showLabel = true, iconClassName }: { showLabel?: boolean; iconClassName?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <OpsIcon className={cn('size-7 text-base', iconClassName)} />
      {showLabel && <span className="text-sm font-bold tracking-wide">OPS</span>}
    </div>
  )
}
