import { useEffect, type ReactNode } from 'react'
import { type AppTheme, themeCssVars, themeGlow } from '../shared/theme'
import { cn } from '../shared/lib/cn'

type ThemeScopeProps = {
  theme: AppTheme
  children: ReactNode
  className?: string
}

/** Scopes accent vars + page glow (scrolls with content - not fixed to the viewport). */
export function ThemeScope({ theme, children, className }: ThemeScopeProps) {
  const glow = themeGlow(theme)

  // Clear legacy body glow from older ThemeScope (was fixed to the viewport).
  useEffect(() => {
    document.body.style.backgroundImage = ''
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
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: [
            `radial-gradient(ellipse 75% 45% at 50% -8%, color-mix(in srgb, ${glow} 14%, transparent) 0%, transparent 55%)`,
            `radial-gradient(ellipse 60% 40% at 100% 100%, color-mix(in srgb, ${glow} 10%, transparent) 0%, transparent 45%)`
          ].join(', ')
        }}
      />
      {children}
    </div>
  )
}
