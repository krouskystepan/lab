import { useMemo } from 'react'
import { WIRE_HEX, type BoardState, type Wire } from '../game/types'

type Props = {
  board: BoardState
  onProbe: (wireId: string | null) => void
  onJumperClick: (wireId: string) => void
  onHoldStart: (wireId: string) => void
  onHoldEnd: () => void
}

type Pt = { x: number; y: number }

/** Tall viewBox so wires read long even with meet. */
const VW = 640
const VH = 720
const TOP = 64
const BOT = 640
const CX = VW / 2
const TOP_PAD = 28
const BOT_PAD = 72

function wirePath(i: number, n: number): { d: string; mid: Pt; top: Pt; bot: Pt } {
  const topSpan = VW - TOP_PAD * 2
  const botSpan = VW - BOT_PAD * 2
  const t = n <= 1 ? 0.5 : i / (n - 1)
  const xTop = TOP_PAD + t * topSpan
  const xBot = BOT_PAD + t * botSpan
  const mid: Pt = { x: (xTop + xBot) / 2, y: (TOP + BOT) / 2 }
  const d = [
    `M ${xTop} ${TOP}`,
    `C ${xTop} ${TOP + 160}, ${xBot} ${BOT - 160}, ${xBot} ${BOT}`
  ].join(' ')
  return { d, mid, top: { x: xTop, y: TOP }, bot: { x: xBot, y: BOT } }
}

function jumperCurve(from: Pt, to: Pt): string {
  const mx = (from.x + to.x) / 2
  const my = Math.min(from.y, to.y) - 40
  return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`
}

export function WireLoom({
  board,
  onProbe,
  onJumperClick,
  onHoldStart,
  onHoldEnd
}: Props) {
  const paths = useMemo(
    () => board.wires.map((w, i) => ({ wire: w, ...wirePath(i, board.wires.length) })),
    [board.wires]
  )

  const byId = useMemo(() => {
    const m = new Map<string, (typeof paths)[number]>()
    for (const p of paths) m.set(p.wire.id, p)
    return m
  }, [paths])

  const a = board.jumperA ? byId.get(board.jumperA) : undefined
  const b = board.jumperB ? byId.get(board.jumperB) : undefined
  const probe = board.probingId ? byId.get(board.probingId) : undefined

  const interact = (wire: Wire) => {
    if (board.status !== 'playing') return
    if (board.tool === 'probe') return
    if (board.dashOn && wire.role === 'starter') return
    onJumperClick(wire.id)
  }

  const press = (wire: Wire) => {
    if (board.status !== 'playing') return
    if (board.tool === 'probe') {
      onProbe(wire.id)
      return
    }
    if (board.dashOn) onHoldStart(wire.id)
  }

  const release = () => {
    if (board.tool === 'probe') onProbe(null)
    onHoldEnd()
  }

  const botLeft = BOT_PAD - 24
  const botWidth = VW - botLeft * 2

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full select-none touch-none"
      role="img"
      aria-label="Ignition wiring loom"
    >
      <defs>
        <linearGradient id="colTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3a42" />
          <stop offset="100%" stopColor="#1a1a1e" />
        </linearGradient>
        <linearGradient id="colBot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2c2c32" />
          <stop offset="100%" stopColor="#101014" />
        </linearGradient>
      </defs>

      {/* Top housing */}
      <rect
        x={TOP_PAD - 14}
        y={28}
        width={VW - (TOP_PAD - 14) * 2}
        height={48}
        rx={7}
        fill="url(#colTop)"
        stroke="#555"
        strokeWidth={1.5}
      />
      <rect x={CX - 44} y={14} width={88} height={18} rx={3} fill="#1c1c20" stroke="#555" />
      <circle cx={CX} cy={23} r={5} fill="#333" stroke="#777" />

      {/* Bottom connector — full width of cable ends */}
      <rect
        x={botLeft}
        y={BOT - 14}
        width={botWidth}
        height={64}
        rx={7}
        fill="url(#colBot)"
        stroke="#555"
        strokeWidth={1.5}
      />

      {paths.map((p, i) => (
        <rect
          key={`pin-${p.wire.id}`}
          x={p.bot.x - 8}
          y={BOT + 12}
          width={16}
          height={20}
          rx={2}
          fill="#9a9aa2"
          opacity={0.75 + (i % 3) * 0.05}
        />
      ))}

      {paths.map((p) => {
        const hex = WIRE_HEX[p.wire.color]
        const active =
          board.probingId === p.wire.id ||
          board.jumperA === p.wire.id ||
          board.jumperB === p.wire.id ||
          (board.holdingStarter && p.wire.role === 'starter')
        const stroke = p.wire.color === 'black' ? '#6a6a72' : hex
        return (
          <g key={p.wire.id}>
            {p.wire.color === 'black' ? (
              <path
                d={p.d}
                fill="none"
                stroke="#c8c8d0"
                strokeWidth={active ? 16 : 14}
                strokeLinecap="round"
                opacity={0.25}
              />
            ) : null}
            <path
              d={p.d}
              fill="none"
              stroke={stroke}
              strokeWidth={active ? 14 : 11}
              strokeLinecap="round"
            />
            <path
              d={p.d}
              fill="none"
              stroke="transparent"
              strokeWidth={36}
              strokeLinecap="round"
              className={board.status === 'playing' ? 'cursor-pointer' : 'cursor-default'}
              onPointerEnter={() => {
                if (board.tool === 'probe' && board.status === 'playing') onProbe(p.wire.id)
              }}
              onPointerLeave={() => {
                if (board.tool === 'probe') onProbe(null)
              }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId)
                press(p.wire)
              }}
              onPointerUp={() => {
                release()
                if (board.tool === 'jumper' && !board.dashOn) interact(p.wire)
                else if (
                  board.tool === 'jumper' &&
                  board.dashOn &&
                  p.wire.role !== 'starter'
                ) {
                  interact(p.wire)
                }
              }}
              onPointerCancel={release}
            />
            <circle
              cx={p.top.x}
              cy={p.top.y}
              r={6}
              fill={stroke}
              stroke="#111"
              strokeWidth={1}
            />
          </g>
        )
      })}

      {a ? (
        <>
          {b ? (
            <path
              d={jumperCurve(a.mid, b.mid)}
              fill="none"
              stroke="#c42828"
              strokeWidth={6}
              strokeLinecap="round"
            />
          ) : (
            <path
              d={`M ${a.mid.x} ${a.mid.y} q 48 36 64 84`}
              fill="none"
              stroke="#c42828"
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray="7 6"
              opacity={0.75}
            />
          )}
          <Alligator pt={a.mid} dangling={!b} />
          {b ? <Alligator pt={b.mid} dangling={false} /> : null}
        </>
      ) : null}

      {probe && board.tool === 'probe' ? (
        <g>
          <line
            x1={probe.mid.x + 22}
            y1={probe.mid.y - 34}
            x2={probe.mid.x + 5}
            y2={probe.mid.y - 2}
            stroke="#b02020"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <circle
            cx={probe.mid.x + 3}
            cy={probe.mid.y}
            r={5}
            fill="#e24a4a"
            stroke="#fff"
            strokeWidth={1.25}
          />
        </g>
      ) : null}

    </svg>
  )
}

function Alligator({ pt, dangling }: { pt: Pt; dangling: boolean }) {
  return (
    <g transform={`translate(${pt.x} ${pt.y})`}>
      <ellipse cx={0} cy={0} rx={12} ry={8} fill="#a01818" stroke="#5a0c0c" strokeWidth={1.5} />
      <path
        d="M -7 -2 L -13 -9 M 7 -2 L 13 -9"
        stroke="#5a0c0c"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      {dangling ? (
        <circle cx={0} cy={0} r={16} fill="none" stroke="#3a7ae2" strokeWidth={2} opacity={0.75} />
      ) : null}
    </g>
  )
}
