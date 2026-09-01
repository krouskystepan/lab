import { useEffect, useRef, useState } from 'react'
import type { AnswerId, Country, GameStatus, Question } from '../game/types'
import { countryName, flagEmoji, flagPng } from '../game/catalog'
import { isCapitalQuestion, typedIsCorrect } from '../game/match'
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
  const showFlag =
    question.kind === 'flagToCountry' || question.kind === 'flagToCapital'
  const promptKey =
    question.kind === 'flagToCountry'
      ? 'geoQuiz.prompt.flagToCountry'
      : question.kind === 'countryToCapital'
        ? 'geoQuiz.prompt.countryToCapital'
        : question.kind === 'capitalToCountry'
          ? 'geoQuiz.prompt.capitalToCountry'
          : 'geoQuiz.prompt.flagToCapital'
  const promptName = subject ? countryName(subject, locale) : question.subject
  const promptCapital = subject?.capital ?? ''

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
          missCount={misses.length}
          capitalKind={capitalKind}
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
              ? capitalKind
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
  missCount,
  capitalKind,
  matches,
  onType
}: {
  questionKey: string
  revealed: boolean
  missCount: number
  capitalKind: boolean
  matches: (text: string) => boolean
  onType: (text: string) => void
}) {
  const { t } = useI18n()
  const [draft, setDraft] = useState('')
  const [flashBad, setFlashBad] = useState(false)
  const [lockAutoFill, setLockAutoFill] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const missRef = useRef(missCount)

  useEffect(() => {
    setDraft('')
    setFlashBad(false)
    setLockAutoFill(true)
    missRef.current = missCount
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(id)
  }, [questionKey])

  useEffect(() => {
    if (missCount <= missRef.current) {
      missRef.current = missCount
      return
    }
    missRef.current = missCount
    setFlashBad(true)
    setDraft('')
    setLockAutoFill(true)
    const id = window.setTimeout(() => {
      setFlashBad(false)
      inputRef.current?.focus()
    }, 1600)
    return () => window.clearTimeout(id)
  }, [missCount])

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-stretch gap-1.5">
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
            'box-border h-11 min-h-11 min-w-0 flex-1 cursor-text appearance-none rounded-(--panel-btn-r) border border-line bg-cell px-3 text-left text-[0.95rem] font-semibold leading-none outline-none focus:border-accent disabled:cursor-text disabled:opacity-100',
            flashBad &&
              !revealed &&
              'border-danger/80 bg-danger/30 text-[#ffb0b0]'
          )}
          placeholder={
            capitalKind
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
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return
            e.preventDefault()
            if (revealed) return
            onType(draft)
          }}
        />
        <button
          type="button"
          disabled={revealed}
          className={cn(
            gameBtn,
            'h-11 shrink-0 px-3 text-[0.85rem] border-accent bg-accent font-bold text-on-accent hover:border-accent-hover hover:bg-accent-hover'
          )}
          onClick={() => {
            if (revealed) return
            onType(draft)
          }}
        >
          {t('geoQuiz.type.submit')}
        </button>
      </div>
      {flashBad ? (
        <p className="m-0 text-center text-[0.85rem] font-semibold text-[#ffb0b0]">
          {t('geoQuiz.type.tryAgain')}
        </p>
      ) : null}
    </div>
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
