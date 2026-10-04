import type { PointerEvent as ReactPointerEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../../i18n'
import { clampInset, dist, problemEdges, type Edge, type Vec } from '../game/geometry'
import type { Hint } from '../game/hint'

type BoardProps = {
  edges: Edge[]
  pos: Vec[]
  hint: Hint | null
  ended: boolean
  onGrab: () => void
  onMove: (index: number, pos: Vec) => void
}

type Drag = { index: number; pointerId: number; origin: Vec }
type Live = { index: number; pos: Vec }

function clientToBoard(svg: SVGSVGElement, clientX: number, clientY: number): Vec {
  const pt = svg.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return { x: 0.5, y: 0.5 }
  const local = pt.matrixTransform(ctm.inverse())
  return { x: local.x / 100, y: local.y / 100 }
}

export function Board({ edges, pos, hint, ended, onGrab, onMove }: BoardProps) {
  const { t } = useI18n()
  const svgRef = useRef<SVGSVGElement>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [live, setLive] = useState<Live | null>(null)
  const [hitR, setHitR] = useState(7)
  const dragRef = useRef(drag)
  dragRef.current = drag
  const liveRef = useRef(live)
  liveRef.current = live
  const posRef = useRef(pos)
  posRef.current = pos
  const onMoveRef = useRef(onMove)
  onMoveRef.current = onMove
  const onGrabRef = useRef(onGrab)
  onGrabRef.current = onGrab
  const endedRef = useRef(ended)
  endedRef.current = ended

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const update = () => {
      const w = el.getBoundingClientRect().width
      setHitR(w > 0 ? Math.max((14 / w) * 100, 4.5) : 7)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const onMovePtr = (e: PointerEvent) => {
      const d = dragRef.current
      const svg = svgRef.current
      if (!d || !svg || e.pointerId !== d.pointerId) return
      const p = clampInset(clientToBoard(svg, e.clientX, e.clientY))
      const point = { index: d.index, pos: p }
      liveRef.current = point
      setLive(point)
    }
    const onUp = (e: PointerEvent) => {
      const d = dragRef.current
      if (!d || e.pointerId !== d.pointerId) return
      const cur = liveRef.current
      dragRef.current = null
      liveRef.current = null
      setDrag(null)
      setLive(null)
      onGrabRef.current()
      if (!cur || cur.index !== d.index) return
      if (dist(cur.pos, d.origin) <= 0.01) return
      onMoveRef.current(d.index, cur.pos)
    }
    window.addEventListener('pointermove', onMovePtr)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMovePtr)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])

  const shown = pos.map((p, i) => (live && live.index === i ? live.pos : p))
  const bad = problemEdges(edges, shown)

  const onDown = (e: ReactPointerEvent, index: number) => {
    if (endedRef.current || dragRef.current) return
    e.preventDefault()
    e.stopPropagation()
    const active = document.activeElement
    if (active instanceof HTMLElement) active.blur()
    onGrabRef.current()
    const origin = posRef.current[index]
    const next = { index, pointerId: e.pointerId, origin }
    const point = { index, pos: origin }
    dragRef.current = next
    liveRef.current = point
    setDrag(next)
    setLive(point)
    try {
      ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
    } catch {
      /* capture needs a real pointer; move listeners still follow pointerId */
    }
  }

  const dotR = pos.length > 14 ? 2.85 : pos.length > 8 ? 3.55 : 4.35
  const fontSize = pos.length > 9 ? dotR * 0.7 : dotR * 0.78
  const dragging = drag?.index

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      className="aspect-square w-full touch-none select-none"
      role="application"
      aria-label={t('untangle.boardAria')}
    >
      <defs>
        <pattern id="untangle-dots" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="0.35" cy="0.35" r="0.16" fill="#ffffff" fillOpacity="0.045" />
        </pattern>
        <radialGradient id="untangle-vignette" cx="50%" cy="46%" r="62%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.035" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="untangle-node" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0.35" stdDeviation="0.45" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>
      <rect width="100" height="100" fill="url(#untangle-dots)" />
      <rect width="100" height="100" fill="url(#untangle-vignette)" />
      <g pointerEvents="none">
        {edges.map(([a, b], i) =>
          bad[i] ? null : (
            <line
              key={i}
              x1={shown[a].x * 100}
              y1={shown[a].y * 100}
              x2={shown[b].x * 100}
              y2={shown[b].y * 100}
              stroke="#9aafc2"
              strokeOpacity={0.72}
              strokeWidth={1.15}
              strokeLinecap="round"
            />
          )
        )}
        {edges.map(([a, b], i) =>
          bad[i] ? (
            <line
              key={i}
              x1={shown[a].x * 100}
              y1={shown[a].y * 100}
              x2={shown[b].x * 100}
              y2={shown[b].y * 100}
              stroke="#ff5d6c"
              strokeWidth={1.25}
              strokeLinecap="round"
            />
          ) : null
        )}
      </g>
      {hint ? <HintMark hint={hint} from={shown[hint.index]} dotR={dotR} /> : null}
      {shown.map((p, i) => {
        const held = dragging === i
        return (
          <g
            key={i}
            role="button"
            aria-label={t('untangle.vertex', { n: i + 1 })}
            onPointerDown={(e) => onDown(e, i)}
            className={ended ? '' : held ? 'cursor-grabbing' : 'cursor-grab'}
            filter="url(#untangle-node)"
          >
            <circle cx={p.x * 100} cy={p.y * 100} r={hitR} fill="transparent" />
            <circle
              cx={p.x * 100}
              cy={p.y * 100}
              r={dotR}
              fill={held ? '#243246' : '#1b2633'}
              stroke="#f4f7fb"
              strokeOpacity={0.9}
              strokeWidth={0.55}
            />
            <text
              x={p.x * 100}
              y={p.y * 100}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={fontSize}
              className="pointer-events-none fill-[#f7fafc] font-mono font-semibold"
            >
              {i + 1}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function HintMark({ hint, from, dotR }: { hint: Hint; from: Vec; dotR: number }) {
  const x1 = from.x * 100
  const y1 = from.y * 100
  const x2 = hint.target.x * 100
  const y2 = hint.target.y * 100
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const px = -uy
  const py = ux
  const base = dotR + 2.8
  const tip = base + 5.2
  const wing = 2.15
  const showArrow = len > tip + dotR + 1
  const landStop = len - dotR - 0.7

  return (
    <g pointerEvents="none">
      <circle
        cx={x1}
        cy={y1}
        r={dotR + 2.15}
        fill="none"
        stroke="var(--color-accent)"
        strokeOpacity={0.85}
        strokeWidth={0.65}
      />
      {showArrow ? (
        <polygon
          points={`${x1 + ux * tip},${y1 + uy * tip} ${x1 + ux * base + px * wing},${y1 + uy * base + py * wing} ${x1 + ux * base - px * wing},${y1 + uy * base - py * wing}`}
          fill="var(--color-accent)"
        />
      ) : null}
      {showArrow ? (
        <line
          x1={x1 + ux * (tip + 0.6)}
          y1={y1 + uy * (tip + 0.6)}
          x2={x1 + ux * landStop}
          y2={y1 + uy * landStop}
          stroke="var(--color-accent)"
          strokeOpacity={0.45}
          strokeWidth={0.5}
          strokeLinecap="round"
        />
      ) : null}
      {len > dotR + 1 ? (
        <circle
          cx={x2}
          cy={y2}
          r={hint.radius * 100}
          fill="var(--color-accent)"
          fillOpacity={0.06}
          stroke="var(--color-accent)"
          strokeWidth={0.7}
        />
      ) : null}
    </g>
  )
}
