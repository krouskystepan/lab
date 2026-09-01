import { useEffect, useRef, useState } from 'react'
import type { AnswerId, Country, GameStatus, Question } from '../game/types'
import { countryName, flagEmoji, flagPng } from '../game/catalog'
import {
  isCapitalQuestion,
  isCodeQuestion,
  typedIsCorrect
} from '../game/match'
import { resultStats } from '../game/resultStats'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { gameBtn, gameBtnActive } from '../../../shared/gameUi'

type StagePromptProps = {
  loading: boolean
  error: boolean
  onRetry: () => void
  question: Question | null
  lookup: Map<string, Country>
}

type StageGuessProps = {
  question: Question | null
  lookup: Map<string, Country>
  picked: string | null
  misses: string[]
  selected: number | null
  status: GameStatus
  answerId: AnswerId
  onPick: (code: string) => void
  onType: (text: string) => void
  onClearSelect: () => void
}

export function StageStart({
  groupLabel,
  onStart
}: {
  groupLabel: string
  onStart: () => void
}) {
  const { t } = useI18n()
  return (
    <div
      className="flex w-full max-w-xl flex-col items-center gap-4 px-4 py-10"
      role="group"
      aria-label={t('geoQuiz.stageAria')}
    >
      <p className="m-0 text-center text-[1.15rem] font-bold tracking-[-0.03em] text-ink">
        {groupLabel}
      </p>
      <p className="m-0 text-center text-[0.9rem] text-muted">
        {t('geoQuiz.startHint')}
      </p>
      <button
        type="button"
        className={cn(
          gameBtn,
          'h-11 px-5 text-[0.95rem] border-accent bg-accent font-bold text-on-accent hover:border-accent-hover hover:bg-accent-hover'
        )}
        onClick={onStart}
      >
        {t('geoQuiz.start')}
      </button>
    </div>
  )
}

export function StageResult({
  status,
  answerId,
  picked,
  misses
}: {
  status: 'won' | 'lost'
  answerId: AnswerId
  picked: readonly (string | null)[]
  misses: readonly string[][]
}) {
  const { t } = useI18n()
  const lost = status === 'lost'
  const stats = resultStats(picked, misses)
  const typing = answerId === 'type'
  const rows = typing
    ? [
        { n: stats.solved, label: t('geoQuiz.stats.correct') },
        ...(stats.open > 0
          ? [{ n: stats.open, label: t('geoQuiz.stats.open') }]
          : [])
      ]
    : [
        { n: stats.first, label: t('geoQuiz.stats.first') },
        { n: stats.second, label: t('geoQuiz.stats.second') },
        { n: stats.third, label: t('geoQuiz.stats.third') },
        { n: stats.last, label: t('geoQuiz.stats.last') },
        ...(stats.open > 0
          ? [{ n: stats.open, label: t('geoQuiz.stats.open') }]
          : [])
      ]
  return (
    <div
      className="flex w-full max-w-[16rem] flex-col items-center gap-6 px-4 py-10"
      role="status"
      aria-label={t('geoQuiz.score')}
    >
      <div className="flex flex-col items-center gap-2">
        <p
          className={cn(
            'm-0 text-center text-[0.95rem] font-semibold',
            lost ? 'text-danger' : 'text-[#4cbe6a]'
          )}
        >
          {lost ? t('geoQuiz.status.timesUp') : t('geoQuiz.status.done')}
        </p>
        <p className="m-0 text-center text-[2.6rem] font-bold tabular-nums leading-none tracking-[-0.04em] text-ink">
          {stats.pct}%
        </p>
        <p className="m-0 text-center text-[0.9rem] tabular-nums text-muted">
          {t('geoQuiz.stats.summary', {
            solved: stats.solved,
            n: stats.total
          })}
        </p>
      </div>
      <ul className="m-0 flex w-full list-none flex-col gap-1.5 p-0">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-baseline justify-between gap-4 text-[0.9rem]"
          >
            <span className="text-muted">{row.label}</span>
            <span className="font-semibold tabular-nums text-ink">{row.n}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function StagePrompt({
  loading,
  error,
  onRetry,
  question,
  lookup
}: StagePromptProps) {
  const { t, locale } = useI18n()

  if (loading) {
    return (
      <p className="m-0 px-4 py-10 text-center text-[0.95rem] text-muted">
        {t('geoQuiz.loading')}
      </p>
    )
  }

  if (error || !question) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-10">
        <p className="m-0 text-center text-[0.95rem] text-muted">
          {t('geoQuiz.loadFailed')}
        </p>
        <button
          type="button"
          className={cn(gameBtn, 'px-3 py-1.5 text-[0.85rem]')}
          onClick={onRetry}
        >
          {t('geoQuiz.retry')}
        </button>
      </div>
    )
  }

  const subject = lookup.get(question.subject)
  const promptName = subject ? countryName(subject, locale) : question.subject
  const promptCapital = subject?.capital ?? ''
  const codeKind = question.kind === 'countryToCode'
  const showFlag =
    question.kind === 'flagToCountry' ||
    question.kind === 'flagToCapital' ||
    codeKind
  const promptKey =
    question.kind === 'flagToCountry'
      ? 'geoQuiz.prompt.flagToCountry'
      : question.kind === 'countryToCapital'
        ? 'geoQuiz.prompt.countryToCapital'
        : question.kind === 'capitalToCountry'
          ? 'geoQuiz.prompt.capitalToCountry'
          : question.kind === 'countryToCode'
            ? 'geoQuiz.prompt.countryToCode'
            : 'geoQuiz.prompt.flagToCapital'

  return (
    <div
      className="flex w-full max-w-xl flex-col items-center gap-4 px-2 py-3 min-[981px]:py-5"
      role="group"
      aria-label={t('geoQuiz.stageAria')}
    >
      <p className="m-0 text-center text-[0.95rem] font-semibold text-ink">
        {t(promptKey, { country: promptName, capital: promptCapital })}
      </p>
      {showFlag && subject ? (
        <FlagCard key={subject.code} country={subject} />
      ) : question.kind === 'capitalToCountry' ? (
        <p className="m-0 text-center text-[1.65rem] font-bold tracking-[-0.03em] text-ink">
          {promptCapital}
        </p>
      ) : (
        <p className="m-0 text-center text-[1.65rem] font-bold tracking-[-0.03em] text-ink">
          {promptName}
        </p>
      )}
      {codeKind ? (
        <p className="m-0 text-center text-[1.35rem] font-bold tracking-[-0.03em] text-ink">
          {promptName}
        </p>
      ) : null}
    </div>
  )
}

export function StageGuess({
  question,
  lookup,
  picked,
  misses,
  selected,
  status,
  answerId,
  onPick,
  onType,
  onClearSelect
}: StageGuessProps) {
  const { locale } = useI18n()
  if (!question) return null

  const subject = lookup.get(question.subject)
  const showAnswer = status === 'revealed' || status === 'won'
  const locked = showAnswer || status === 'lost'
  const capitalKind = isCapitalQuestion(question.kind)
  const codeKind = isCodeQuestion(question.kind)
  const okCls =
    'border-[#4cbe6a] bg-[#4cbe6a]/30 text-[#c8f5d4] shadow-[0_0_12px_color-mix(in_srgb,#4cbe6a_35%,transparent)]'
  const badCls =
    'border-danger/80 bg-danger/30 text-[#ffb0b0] shadow-[0_0_12px_color-mix(in_srgb,#e24a4a_30%,transparent)]'

  return (
    <div className="mx-auto w-full max-w-xl">
      {answerId === 'type' ? (
        <TypeField
          key={`${question.subject}-${question.kind}`}
          questionKey={`${question.subject}-${question.kind}`}
          revealed={locked}
          capitalKind={capitalKind}
          codeKind={codeKind}
          matches={(text) => typedIsCorrect(question, text, locale, subject)}
          onType={onType}
        />
      ) : (
        <div
          className="grid w-full grid-cols-1 gap-1.5 min-[520px]:grid-cols-2"
          onMouseLeave={onClearSelect}
        >
          {question.choices.map((code, i) => {
            const country = lookup.get(code)
            const isAnswer = code === question.subject
            const isMiss = misses.includes(code)
            const isPicked = picked === code
            const lockedChoice = locked || isMiss
            const label = country
              ? codeKind
                ? country.code
                : capitalKind
                  ? country.capital
                  : countryName(country, locale)
              : code
            return (
              <button
                key={code}
                type="button"
                disabled={lockedChoice}
                tabIndex={isMiss ? -1 : selected === i ? 0 : -1}
                className={cn(
                  gameBtn,
                  'min-h-11 px-3 py-2 text-left text-[0.92rem] leading-snug max-[980px]:min-h-12',
                  codeKind && 'font-mono font-bold tracking-[0.08em]',
                  !locked &&
                    !isMiss &&
                    'hover:border-accent hover:bg-accent/25 hover:text-on-accent',
                  selected === i && !locked && !isMiss && gameBtnActive,
                  (showAnswer && isAnswer) || (isPicked && isAnswer)
                    ? okCls
                    : null,
                  isMiss && badCls
                )}
                onClick={(e) => {
                  onPick(code)
                  e.currentTarget.blur()
                }}
                onMouseEnter={onClearSelect}
              >
                <span className="mr-2 font-mono text-[0.72rem] text-muted">
                  {i + 1}
                </span>
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TypeField({
  questionKey,
  revealed,
  capitalKind,
  codeKind,
  matches,
  onType
}: {
  questionKey: string
  revealed: boolean
  capitalKind: boolean
  codeKind: boolean
  matches: (text: string) => boolean
  onType: (text: string) => void
}) {
  const { t } = useI18n()
  const [draft, setDraft] = useState('')
  const [lockAutoFill, setLockAutoFill] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft('')
    setLockAutoFill(true)
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(id)
  }, [questionKey])

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="text"
      value={draft}
      disabled={revealed}
      readOnly={lockAutoFill}
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      aria-autocomplete="none"
      data-1p-ignore="true"
      data-lpignore="true"
      className={cn(
        'box-border mx-auto block h-10 min-h-10 w-full max-w-88 min-w-0 cursor-text appearance-none rounded-(--panel-btn-r) border border-line bg-cell px-3 text-left text-[0.9rem] font-semibold leading-none outline-none focus:border-accent disabled:cursor-text disabled:opacity-100',
        codeKind && 'font-mono uppercase tracking-[0.12em]'
      )}
      placeholder={
        codeKind
          ? t('geoQuiz.type.placeholderCode')
          : capitalKind
            ? t('geoQuiz.type.placeholderCapital')
            : t('geoQuiz.type.placeholderCountry')
      }
      aria-label={t('geoQuiz.type.aria')}
      onFocus={(e) => {
        window.requestAnimationFrame(() => {
          setLockAutoFill(false)
          e.currentTarget.removeAttribute('readonly')
        })
      }}
      onChange={(e) => {
        const value = e.target.value
        setDraft(value)
        if (revealed) return
        if (matches(value)) onType(value)
      }}
    />
  )
}

function FlagCard({ country }: { country: Country }) {
  const { t } = useI18n()
  const [broken, setBroken] = useState(false)

  return (
    <div className="mx-auto flex h-34 w-fit max-w-full min-w-0 items-center justify-center leading-0 shadow-[0_8px_24px_rgba(0,0,0,0.22)] min-[981px]:h-42">
      {broken ? (
        <span
          className="flex h-full items-center justify-center text-[4.5rem] leading-none"
          aria-hidden
        >
          {flagEmoji(country.code)}
        </span>
      ) : (
        <img
          src={flagPng(country.code, 640)}
          srcSet={`${flagPng(country.code, 320)} 1x, ${flagPng(country.code, 640)} 2x`}
          alt={t('geoQuiz.flagAlt', { country: country.nameEn })}
          className="block h-full w-auto max-w-full"
          onError={() => setBroken(true)}
        />
      )}
    </div>
  )
}
