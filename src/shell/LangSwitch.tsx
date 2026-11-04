import { useI18n } from '../i18n'
import { cn } from '../shared/lib/cn'

const btn =
  'cursor-pointer appearance-none inline-flex h-full items-center border-0 px-[0.45rem] text-[0.68rem] font-bold tracking-[0.04em]'

export function LangSwitch() {
  const { t, locale, setLocale } = useI18n()

  return (
    <div
      className="inline-flex h-[1.7rem] shrink-0 rounded-sm bg-line p-px"
      role="group"
      aria-label={t('lang.switch')}
    >
      <div className="inline-flex h-full overflow-hidden rounded-[3px] bg-cell">
        <button
          type="button"
          className={cn(
            btn,
            locale === 'en'
              ? 'bg-accent/30 text-on-accent'
              : 'bg-transparent text-muted hover:bg-cell-hover hover:text-ink'
          )}
          aria-pressed={locale === 'en'}
          onClick={() => setLocale('en')}
        >
          {t('lang.en')}
        </button>
        <button
          type="button"
          className={cn(
            btn,
            locale === 'cs'
              ? 'bg-accent/30 text-on-accent'
              : 'bg-transparent text-muted hover:bg-cell-hover hover:text-ink'
          )}
          aria-pressed={locale === 'cs'}
          onClick={() => setLocale('cs')}
        >
          {t('lang.cs')}
        </button>
      </div>
    </div>
  )
}
