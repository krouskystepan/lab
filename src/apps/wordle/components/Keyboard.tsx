import { Delete } from 'lucide-react'
import type { Guess, TileMark } from '../game/types'
import { bestKeyMark } from '../game/score'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'

const ROWS: string[][] = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace']
]

const btn =
  'cursor-pointer appearance-none rounded-sm border font-semibold uppercase transition-[background,border-color,color] duration-100 hover:brightness-110 disabled:cursor-default disabled:opacity-40 max-[720px]:min-h-[2.35rem]'

type KeyboardProps = {
  guesses: readonly Guess[]
  disabled: boolean
  flashKey: string | null
  onLetter: (letter: string) => void
  onEnter: () => void
  onBackspace: () => void
}

export function Keyboard({
  guesses,
  disabled,
  flashKey,
  onLetter,
  onEnter,
  onBackspace
}: KeyboardProps) {
  const { t } = useI18n()

  return (
    <section className="flex min-w-0 w-full flex-col gap-2 overflow-visible rounded-md border border-line bg-panel px-3 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)] max-[720px]:px-2 max-[720px]:py-2">
      <h2 className="m-0 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase max-[720px]:hidden [@media(max-height:700px)]:hidden">
        {t('wordle.keyboard.title')}
      </h2>
      <div className="flex w-full flex-col gap-1.5">
        {ROWS.map((row, ri) => (
          <div
            key={ri}
            className={cn(
              'grid w-full gap-1.5',
              ri === 0 && 'grid-cols-10',
              ri === 1 && 'grid-cols-9 px-[5%]',
              ri === 2 && 'grid-cols-[1.6fr_repeat(7,1fr)_1.6fr]'
            )}
          >
            {row.map((key) => {
              if (key === 'Enter') {
                return (
                  <button
                    key={key}
                    type="button"
                    className={cn(
                      btn,
                      'border-line bg-cell px-1 text-[0.68rem] tracking-wide text-ink',
                      flashKey === 'Enter' && 'wordle-key-press'
                    )}
                    disabled={disabled}
                    title={t('wordle.keyboard.enterTitle')}
                    onClick={onEnter}
                  >
                    {t('wordle.keyboard.enter')}
                  </button>
                )
              }
              if (key === 'Backspace') {
                return (
                  <button
                    key={key}
                    type="button"
                    className={cn(
                      btn,
                      'inline-flex items-center justify-center border-line bg-cell text-ink',
                      flashKey === 'Backspace' && 'wordle-key-press'
                    )}
                    disabled={disabled}
                    title={t('wordle.keyboard.backspaceTitle')}
                    aria-label={t('wordle.keyboard.backspace')}
                    onClick={onBackspace}
                  >
                    <Delete className="h-[1em] w-[1em]" aria-hidden />
                  </button>
                )
              }
              const mark = bestKeyMark(key, guesses)
              return (
                <button
                  key={key}
                  type="button"
                  className={cn(
                    btn,
                    'px-0 py-[0.4rem] text-[0.85rem]',
                    keyClass(mark),
                    flashKey === key && 'wordle-key-press'
                  )}
                  disabled={disabled}
                  onClick={() => onLetter(key)}
                >
                  {key}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}

function keyClass(mark: TileMark | 'empty'): string {
  if (mark === 'correct') return 'wordle-mark-correct'
  if (mark === 'present') return 'wordle-mark-present'
  if (mark === 'absent') return 'wordle-mark-absent'
  return 'border-line bg-cell text-ink'
}
