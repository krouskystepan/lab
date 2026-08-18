import { findMate } from './mate'
import type { MateResult } from './types'

type InMsg = { id: number; fen: string; mateIn: number; timeMs?: number }
type OutMsg = { id: number; result: MateResult }

onmessage = (e: MessageEvent<InMsg>) => {
  const { id, fen, mateIn, timeMs } = e.data
  const result = findMate(fen, mateIn, timeMs)
  postMessage({ id, result } satisfies OutMsg)
}
