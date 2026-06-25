import { useEffect, useRef, useState } from 'react'
import { Check, Monitor, Moon, Palette, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOpsTheme } from '@/components/theme/OpsThemeProvider'
import { cn } from '@/lib/utils'
import type { ThemeMode } from '@/lib/theme'

const baseThemes: { id: ThemeMode; icon: typeof Sun; label: string }[] = [
  { id: 'light', icon: Sun, label: 'فاتح' },
  { id: 'dark', icon: Moon, label: 'داكن (زيتوني)' },
  { id: 'system', icon: Monitor, label: 'تلقائي' },
]

const neoThemes: { id: ThemeMode; label: string; swatch: string; ring: string }[] = [
  { id: 'neo-blue', label: 'أسود + أزرق', swatch: '#3b82f6', ring: 'ring-blue-500' },
  { id: 'neo-green', label: 'أسود + أخضر', swatch: '#22c55e', ring: 'ring-green-500' },
  { id: 'neo-red', label: 'أسود + أحمر', swatch: '#ef4444', ring: 'ring-red-500' },
  { id: 'neo-yellow', label: 'أسود + أصفر', swatch: '#eab308', ring: 'ring-yellow-500' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useOpsTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  if (!mounted) return <div className="h-8 w-8" />

  const currentNeo = neoThemes.find((t) => t.id === theme)
  const currentBase = baseThemes.find((t) => t.id === theme)
  const CurrentIcon = currentBase?.icon ?? (currentNeo ? Palette : Monitor)

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        className="relative text-muted-foreground hover:text-foreground h-8 w-8 p-0 rounded-xl"
        onClick={() => setOpen((v) => !v)}
        title="اختيار الثيم"
        aria-expanded={open}
      >
        {currentNeo ? (
          <span
            className="size-4 rounded-full border-2 border-background shadow-sm"
            style={{ backgroundColor: currentNeo.swatch }}
          />
        ) : (
          <CurrentIcon className="size-4" />
        )}
      </Button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 z-50 w-52 rounded-xl border border-border bg-card shadow-xl p-2 space-y-2"
          dir="rtl"
        >
          <p className="text-[10px] text-muted-foreground px-2 pt-0.5">الثيم الأساسي</p>
          {baseThemes.map((t) => {
            const Icon = t.icon
            const active = theme === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id)
                  setOpen(false)
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors',
                  active ? 'bg-primary/15 text-primary' : 'hover:bg-muted text-foreground',
                )}
              >
                <Icon className="size-3.5 shrink-0" />
                <span className="flex-1 text-right">{t.label}</span>
                {active && <Check className="size-3.5 shrink-0" />}
              </button>
            )
          })}

          <div className="border-t border-border/60 pt-2">
            <p className="text-[10px] text-muted-foreground px-2 pb-1">Neo — أسود + لون</p>
            <div className="grid grid-cols-2 gap-1.5 px-1">
              {neoThemes.map((t) => {
                const active = theme === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.id)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] transition-colors border',
                      active
                        ? `bg-background border-border ring-2 ${t.ring}`
                        : 'border-transparent hover:bg-muted',
                    )}
                  >
                    <span
                      className="size-6 rounded-full ring-2 ring-background"
                      style={{
                        background: `linear-gradient(135deg, #0a0a0a 50%, ${t.swatch} 50%)`,
                      }}
                    />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
