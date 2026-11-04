import { useI18n } from '../../../i18n'
import type { MessageKey } from '../../../i18n'
import type { BoardState } from '../game/types'

const HINT_KEY: Record<string, MessageKey> = {
  clipA: 'starter.hint.clipA',
  dash: 'starter.hint.dash',
  holding: 'starter.hint.holding',
  live: 'starter.hint.live',
  wrong: 'starter.hint.wrong',
  needStarter: 'starter.hint.needStarter',
  won: 'starter.hint.won',
  lost: 'starter.hint.lost'
}

type Props = {
  board: BoardState
}

export function StatusBanner({ board }: Props) {
  const { t } = useI18n()
  const key = board.hint ? HINT_KEY[board.hint] : null
  if (!key) return null

  return (
    <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 max-w-[min(22rem,90%)] -translate-x-1/2 rounded-md border border-[#2a2a30] bg-[#0c0c0e] px-3 py-2 text-center shadow-lg">
      <p className="m-0 text-[0.8rem] leading-snug text-ink">{t(key)}</p>
    </div>
  )
}
