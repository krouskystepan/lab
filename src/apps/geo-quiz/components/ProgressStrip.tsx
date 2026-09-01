import { useEffect, useRef, useState } from 'react'
import { countryName, flagEmoji, flagPng } from '../game/catalog'
import type { Country, Question } from '../game/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'

type ProgressStripProps = {
  questions: Question[]
  lookup: Map<string, Country>
  index: number
  picked: (string | null)[]
  misses: string[][]
  onGoto: (index: number) => void
}

export function ProgressStrip({
  questions,
  lookup,
  index,
  picked,
  misses,
  onGoto
}: ProgressStripProps) {
  const { t, locale } = useI18n()
  const currentRef = useRef<HTMLButtonElement>(null)
  const done = picked.filter((p) => p != null).length
  const open = questions.length - done

  useEffect(() => {
    currentRef.current?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest'
    })
  }, [index])

  if (questions.length === 0) return null

  return (
    <div className="flex w-full shrink-0 flex-col gap-1 border-t border-line px-1 pt-1.5">
      <p className="m-0 text-center text-[0.72rem] font-semibold text-muted">
        {t('geoQuiz.progress.summary', { done, open, n: questions.length })}
      </p>
      <div
        className="grid max-h-36 grid-cols-[repeat(auto-fill,minmax(2.35rem,1fr))] items-start gap-1 overflow-y-auto p-0.5 min-[520px]:max-h-40"
        role="list"
        aria-label={t('geoQuiz.progress.aria')}
      >
        {questions.map((q, i) => {
          const country = lookup.get(q.subject)
          const name = country ? countryName(country, locale) : q.subject
          const ok = picked[i] != null
          const tried = (misses[i] ?? []).length > 0
          const current = i === index
          return (
            <button
              key={`${q.subject}-${i}`}
              ref={current ? currentRef : undefined}
              type="button"
              role="listitem"
              title={t('geoQuiz.progress.itemTitle', {
                country: name,
                state: ok
                  ? t('geoQuiz.progress.done')
                  : tried
                    ? t('geoQuiz.progress.tried')
                    : t('geoQuiz.progress.open')
              })}
              aria-current={current ? 'true' : undefined}
              aria-label={name}
              className={cn(
                'relative aspect-3/2 w-full self-start overflow-hidden border bg-elevated p-0 leading-0 disabled:cursor-default disabled:opacity-100',
                ok
                  ? 'border-2 border-[#4cbe6a]'
                  : tried
                    ? 'border-danger/80'
                    : 'border-line',
                current && 'ring-2 ring-accent/70',
                !ok && !tried && !current && 'opacity-70'
              )}
              disabled={ok}
              onClick={() => {
                if (ok) return
                onGoto(i)
              }}
            >
              {country ? (
                <FlagThumb country={country} />
              ) : (
                <span className="text-[0.65rem]">{q.subject}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FlagThumb({ country }: { country: Country }) {
  const { t } = useI18n()
  const [broken, setBroken] = useState(false)
  if (broken) {
    return (
      <span className="text-[1rem] leading-none" aria-hidden>
        {flagEmoji(country.code)}
      </span>
    )
  }
  return (
    <img
      src={flagPng(country.code, 320)}
      alt={t('geoQuiz.flagAlt', { country: country.nameEn })}
      className="absolute inset-0 block h-full w-full object-fill"
      onError={() => setBroken(true)}
    />
  )
}
