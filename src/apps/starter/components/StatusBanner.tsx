import { useI18n } from '../../../i18n'
import type { MessageKey } from '../../../i18n'
import type { BoardState } from '../game/types'

const HINT_KEY: Record<string, MessageKey> = {
  clipA: 'starter.hint.clipA',
  dash: 'starter.hint.dash',
  holding: 'starter.hint.holding',
  release: 'starter.hint.release',
  overhold: 'starter.hint.overhold',
  ohmLive: 'starter.hint.ohmLive',
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
    <div className="pointer-events-none absolute bottom-2 left-1/2 z-20 max-w-[min(22rem,calc(100%-1rem))] -translate-x-1/2 rounded-md border border-[#2a2a30] bg-[#0c0c0e]/95 px-2.5 py-1.5 text-center shadow-lg backdrop-blur-sm min-[900px]:bottom-3 min-[900px]:px-3 min-[900px]:py-2">
      <p className="m-0 text-[0.72rem] leading-snug text-ink min-[900px]:text-[0.8rem]">
        {t(key)}
      </p>
    </div>
  )
}
