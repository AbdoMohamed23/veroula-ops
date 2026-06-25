export type ThemeMode =
  | 'light'
  | 'dark'
  | 'system'
  | 'neo-blue'
  | 'neo-green'
  | 'neo-red'
  | 'neo-yellow'

export const THEME_STORAGE_KEY = 'veroula-ops-theme'

export const NEO_THEMES = ['neo-blue', 'neo-green', 'neo-red', 'neo-yellow'] as const
export type NeoTheme = (typeof NEO_THEMES)[number]

export const ALL_THEMES: ThemeMode[] = [
  'light',
  'dark',
  'system',
  'neo-blue',
  'neo-green',
  'neo-red',
  'neo-yellow',
]

export function isNeoTheme(mode: ThemeMode): mode is NeoTheme {
  return (NEO_THEMES as readonly string[]).includes(mode)
}

export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (isNeoTheme(mode)) return 'dark'
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

const THEME_COLORS: Record<string, string> = {
  light: '#f4f2e3',
  dark: '#1c2610',
  'neo-blue': '#07070c',
  'neo-green': '#060a08',
  'neo-red': '#0a0606',
  'neo-yellow': '#0a0906',
}

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement
  root.classList.remove('dark', 'theme-neo-blue', 'theme-neo-green', 'theme-neo-red', 'theme-neo-yellow')

  const resolved = resolveTheme(mode)

  if (isNeoTheme(mode)) {
    root.classList.add(`theme-${mode}`)
    root.style.colorScheme = 'dark'
  } else if (resolved === 'dark') {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  } else {
    root.style.colorScheme = 'light'
  }

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    const color = isNeoTheme(mode)
      ? THEME_COLORS[mode]
      : resolved === 'dark'
        ? THEME_COLORS.dark
        : THEME_COLORS.light
    meta.setAttribute('content', color)
  }
}

export function isValidTheme(value: string | null): value is ThemeMode {
  return value != null && (ALL_THEMES as readonly string[]).includes(value)
}
