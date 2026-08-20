import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { PieceGlyph } from './PieceGlyph'
import { fileOf, indexFromVisual, rankOf, squareName, visualIndex } from '../solver/fen'
import type { Piece, Position } from '../solver/types'

const FILES = 'abcdefgh'
const ANIM_MS = 280

export type BoardMoveAnim = {
  id: number
  piece: Piece
  from: number
  to: number
  dir: 'fwd' | 'back'
}

type BoardProps = {
  pos: Position
  flipped: boolean
  lastFrom: number | null
  lastTo: number | null
  moveLabel: string | null
  checkIndex: number | null
  anim: BoardMoveAnim | null
  onSelect: (index: number) => void
}

export function Board({
  pos,
  flipped,
  lastFrom,
  lastTo,
  moveLabel,
  checkIndex,
  anim,
  onSelect
}: BoardProps) {
  const { t } = useI18n()
  const [settledId, setSettledId] = useState<number | null>(null)
  const flying = anim != null && settledId !== anim.id
  const hideIndex = flying && anim
    ? anim.dir === 'fwd'
      ? anim.to
      : anim.from
    : null

  useEffect(() => {
    if (!anim) return
    const t = window.setTimeout(() => setSettledId(anim.id), ANIM_MS)
    return () => window.clearTimeout(t)
  }, [anim])

  return (
    <div className="relative mx-auto w-fit max-w-full self-center">
      <div
        className="mine-grid chess-grid"
        style={
          {
            gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
            ['--cols' as string]: 8,
            ['--rows' as string]: 8,
            ['--cell-ar' as string]: 1
          } as CSSProperties
        }
        role="grid"
        aria-label={t('chessMate.gridAria')}
        aria-colcount={8}
        aria-rowcount={8}
      >
        {Array.from({ length: 64 }, (_, vis) => {
          const row = Math.floor(vis / 8)
          const col = vis % 8
          const index = indexFromVisual(row, col, flipped)
          const piece = pos.squares[index]
          const light = (row + col) % 2 === 0
          const showFile = row === 7
          const showRank = col === 0
          return (
            <Square
              key={vis}
              name={squareName(index)}
              piece={hideIndex === index ? null : piece}
              light={light}
              fileLabel={showFile ? FILES[fileOf(index)] : null}
              rankLabel={showRank ? String(rankOf(index) + 1) : null}
              isFrom={lastFrom === index}
              isTo={lastTo === index}
              moveLabel={lastTo === index ? moveLabel : null}
              inCheck={checkIndex === index}
              onSelect={() => onSelect(index)}
            />
          )
        })}
      </div>
      {flying && anim ? <MoveFlyer key={anim.id} anim={anim} flipped={flipped} /> : null}
    </div>
  )
}

function MoveFlyer({
  anim,
  flipped
}: {
  anim: BoardMoveAnim
  flipped: boolean
}) {
  const [slide, setSlide] = useState(false)
  const start = visualIndex(anim.dir === 'fwd' ? anim.from : anim.to, flipped)
  const end = visualIndex(anim.dir === 'fwd' ? anim.to : anim.from, flipped)

  useEffect(() => {
    let cancelled = false
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setSlide(true)
      })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <span
      className="chess-move-flyer"
      style={{
        left: `${start.col * 12.5}%`,
        top: `${start.row * 12.5}%`,
        transform: slide
          ? `translate(${(end.col - start.col) * 100}%, ${(end.row - start.row) * 100}%)`
          : 'translate(0, 0)'
      }}
    >
      <PieceGlyph
        kind={anim.piece.kind}
        side={anim.piece.side}
        className="h-[72%] w-[72%]"
      />
    </span>
  )
}

function Square({
  name,
  piece,
  light,
  fileLabel,
  rankLabel,
  isFrom,
  isTo,
  moveLabel,
  inCheck,
  onSelect
}: {
  name: string
  piece: Piece | null
  light: boolean
  fileLabel: string | null
  rankLabel: string | null
  isFrom: boolean
  isTo: boolean
  moveLabel: string | null
  inCheck: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={cn(
        'cell relative flex h-full w-full min-h-0 min-w-0 cursor-pointer items-center justify-center overflow-hidden border-0 p-0 leading-none touch-manipulation select-none focus:outline-none focus-visible:outline-none',
        light ? 'chess-sq-light' : 'chess-sq-dark',
        isFrom && 'chess-sq-from',
        isTo && 'chess-sq-to',
        inCheck && 'chess-sq-check'
      )}
      aria-label={moveLabel ? `${name} ${moveLabel}` : name}
      role="gridcell"
      onClick={onSelect}
    >
      {rankLabel ? (
        <span
          className={cn(
            'pointer-events-none absolute top-0.5 left-0.5 text-[0.55rem] font-bold leading-none',
            light ? 'text-[#3d4654]' : 'text-[#d5dbe4]'
          )}
        >
          {rankLabel}
        </span>
      ) : null}
      {fileLabel ? (
        <span
          className={cn(
            'pointer-events-none absolute right-0.5 bottom-0.5 text-[0.55rem] font-bold leading-none',
            light ? 'text-[#3d4654]' : 'text-[#d5dbe4]'
          )}
        >
          {fileLabel}
        </span>
      ) : null}
      {piece ? (
        <span className="cell-glyph chess-glyph">
          <PieceGlyph kind={piece.kind} side={piece.side} className="h-[72%] w-[72%]" />
        </span>
      ) : null}
      {moveLabel ? (
        <span className="pointer-events-none absolute bottom-0.5 left-1/2 z-3 max-w-[92%] -translate-x-1/2 truncate rounded-[0.2rem] bg-[#1a1a14]/90 px-0.5 text-[0.55rem] font-bold leading-tight text-best">
          {moveLabel}
        </span>
      ) : null}
    </button>
  )
}
