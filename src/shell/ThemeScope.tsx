import { useEffect, type ReactNode } from 'react'
import { type AppTheme, themeCssVars, themeGlow } from '../shared/theme'
import { cn } from '../shared/lib/cn'

type ThemeScopeProps = {
  theme: AppTheme
  children: ReactNode
  className?: string
}

/** Scopes accent vars. Atmosphere sits on body — no soft dual-blob wash here. */
export function ThemeScope({ theme, children, className }: ThemeScopeProps) {
  const glow = themeGlow(theme)

  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', theme.accent)
    document.documentElement.style.setProperty(
      '--color-accent-hover',
      theme.accentHover
    )
    document.documentElement.style.setProperty(
      '--color-on-accent',
      theme.onAccent
    )
    document.documentElement.style.setProperty('--theme-glow', glow)
  }, [theme.accent, theme.accentHover, theme.onAccent, glow])

  return (
    <div
      className={cn('relative', className)}
      style={{
        ...themeCssVars(theme),
        ['--theme-glow' as string]: glow
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${glow} 5%, transparent) 0%, transparent 100%)`
        }}
      />
      {children}
    </div>
  )
}
