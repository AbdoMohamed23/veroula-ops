import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  applyTheme,
  isValidTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from '@/lib/theme'

type ThemeContextValue = {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function OpsThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    const initial: ThemeMode = isValidTheme(stored) ? stored : 'system'
    setThemeState(initial)
    setResolvedTheme(resolveTheme(initial))
    applyTheme(initial)

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onSystemChange = () => {
      const current = localStorage.getItem(THEME_STORAGE_KEY)
      if (!current || current === 'system') {
        setResolvedTheme(resolveTheme('system'))
        applyTheme('system')
      }
    }
    mq.addEventListener('change', onSystemChange)
    return () => mq.removeEventListener('change', onSystemChange)
  }, [])

  const setTheme = useCallback((mode: ThemeMode) => {
    localStorage.setItem(THEME_STORAGE_KEY, mode)
    setThemeState(mode)
    setResolvedTheme(resolveTheme(mode))
    applyTheme(mode)
  }, [])

  const value = useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useOpsTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useOpsTheme must be used within OpsThemeProvider')
  return ctx
}
