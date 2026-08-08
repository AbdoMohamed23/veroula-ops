import type { ElementType } from 'react'

export function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  icon: ElementType
  color: string
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-foreground/85 text-sm font-medium">{title}</span>
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon className="size-4" />
        </div>
      </div>
      <p className="text-foreground font-bold text-lg">{value}</p>
    </div>
  )
}
