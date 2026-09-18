import { useEffect, useMemo, useState } from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { gameBtn } from '../../../shared/gameUi'
import { formatExpr } from '../solver/format'
import { evalExpr } from '../solver/radical'
import { hasSqrtOneMinusSq } from '../solver/trig'
import type { EqPlot, Expr } from '../solver/types'

const W = 720
const H = 360
const PAD = { l: 28, r: 20, t: 20, b: 40 }
const ZOOM_MIN = 0.25
const ZOOM_MAX = 8
const ZOOM_STEP = 1.35

function clampZoom(z: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z))
}

function zoomWindow(base: [number, number], zoom: number): [number, number] {
  const [a, b] = base
  const mid = (a + b) / 2
  const half = (b - a) / 2 / zoom
  return [mid - half, mid + half]
}

function hasTrigFn(e: Expr): boolean {
  switch (e.k) {
    case 'fn':
      return true
    case 'n':
    case 'v':
    case 'pi':
      return false
    case 'neg':
    case 'abs':
    case 'sqrt':
      return hasTrigFn(e.x)
    case 'pow':
      return hasTrigFn(e.b) || hasTrigFn(e.e)
    default:
      return hasTrigFn(e.l) || hasTrigFn(e.r)
  }
}

function niceCeil(v: number, step: number): number {
  return Math.ceil(v / step) * step
}

/** Textbook-style window: origin in view, room to see slopes / intercepts. */
function windowX(plot: EqPlot): [number, number] {
  const { left, right, variable: v, roots } = plot
  if (hasSqrtOneMinusSq(left, v) || hasSqrtOneMinusSq(right, v)) {
    return [-1.25, 1.25]
  }
  if (hasTrigFn(left) || hasTrigFn(right)) {
    if (v === 'α' || v === 'θ') return [-0.2, Math.PI + 0.25]
    return [-Math.PI - 0.3, Math.PI + 0.3]
  }
  const xs = roots.filter((x) => Number.isFinite(x))
  const need = Math.max(30, ...xs.map((x) => Math.abs(x) + 10), 12)
  const half = niceCeil(need, 10)
  return [-half, half]
}

function niceStep(span: number, target: number): number {
  const raw = span / Math.max(1, target)
  const pow = 10 ** Math.floor(Math.log10(Math.max(raw, 1e-9)))
  const n = raw / pow
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return nice * pow
}

function ticks(lo: number, hi: number, target: number): number[] {
  const step = niceStep(hi - lo, target)
  const start = Math.ceil((lo + step * 1e-9) / step) * step
  const out: number[] = []
  for (let v = start; v <= hi + step * 1e-9; v += step) {
    const t = Math.abs(v) < step * 1e-8 ? 0 : v
    if (t >= lo - step * 1e-9 && t <= hi + step * 1e-9) out.push(t)
  }
  return out
}

function fmtTick(v: number, step: number): string {
  if (Math.abs(v) < 1e-10) return '0'
  const abs = Math.abs(v)
  if (Math.abs(abs - Math.PI) < 0.04) return v < 0 ? '−π' : 'π'
  if (Math.abs(abs - Math.PI / 2) < 0.04) return v < 0 ? '−π/2' : 'π/2'
  if (Math.abs(abs - Math.PI / 4) < 0.04) return v < 0 ? '−π/4' : 'π/4'
  if (Math.abs(abs - (3 * Math.PI) / 4) < 0.04) {
    return v < 0 ? '−3π/4' : '3π/4'
  }
  const decimals = step >= 1 ? 0 : step >= 0.1 ? 1 : 2
  const s = v.toFixed(decimals)
  return s
    .replace(/^-/, '−')
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?)0+$/, '$1')
}

function fmtCoord(v: number): string {
  if (!Number.isFinite(v)) return '?'
  if (Math.abs(v) < 1e-10) return '0'
  const abs = Math.abs(v)
  if (Math.abs(abs - Math.SQRT1_2) < 0.008) return v < 0 ? '−√2/2' : '√2/2'
  if (Math.abs(abs - 0.5) < 0.008) return v < 0 ? '−1/2' : '1/2'
  if (Math.abs(abs - 1) < 0.008) return v < 0 ? '−1' : '1'
  if (Number.isInteger(Math.round(v * 1e6) / 1e6)) {
    return String(Math.round(v)).replace(/^-/, '−')
  }
  const s = Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(2)
  return s.replace(/^-/, '−').replace(/0+$/, '').replace(/\.$/, '')
}

function segments(
  xs: number[],
  ys: (number | null)[]
): { x: number; y: number }[][] {
  const out: { x: number; y: number }[][] = []
  let cur: { x: number; y: number }[] = []
  for (let i = 0; i < xs.length; i++) {
    const y = ys[i]
    if (y == null || !Number.isFinite(y)) {
      if (cur.length > 1) out.push(cur)
      cur = []
      continue
    }
    cur.push({ x: xs[i]!, y })
  }
  if (cur.length > 1) out.push(cur)
  return out
}

function toPath(
  segs: { x: number; y: number }[][],
  sx: (x: number) => number,
  sy: (y: number) => number
): string {
  return segs
    .map((s) =>
      s
        .map(
          (p, i) =>
            `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`
        )
        .join(' ')
    )
    .join(' ')
}

export function EqGraph({ plot }: { plot: EqPlot }) {
  const { t } = useI18n()
  const [zoom, setZoom] = useState(1)
  const plotKey = `${plot.variable}:${formatExpr(plot.left)}=${formatExpr(plot.right)}:${plot.roots.join(',')}`

  useEffect(() => {
    setZoom(1)
  }, [plotKey])

  const drawn = useMemo(() => {
    const base = windowX(plot)
    const [x0, x1] = zoomWindow(base, zoom)
    const [bx0, bx1] = base
    const n = 360
    const xs: number[] = []
    const yl: (number | null)[] = []
    const yr: (number | null)[] = []
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n
      xs.push(x)
      const a = evalExpr(plot.left, x)
      const b = evalExpr(plot.right, x)
      yl.push(a != null && Number.isFinite(a) ? a : null)
      yr.push(b != null && Number.isFinite(b) ? b : null)
    }
    const finite = [...yl, ...yr].filter((y): y is number => y != null)
    if (finite.length < 8) return null

    // Match X scale (Desmos-style): use intercepts + solutions, not edge blow-up.
    const halfX = (bx1 - bx0) / 2
    const focusXs = [
      0,
      ...plot.roots.filter((x) => Number.isFinite(x)),
      halfX * 0.15,
      -halfX * 0.15
    ]
    const focusYs: number[] = []
    for (const x of focusXs) {
      const a = evalExpr(plot.left, x)
      const b = evalExpr(plot.right, x)
      if (a != null && Number.isFinite(a)) focusYs.push(Math.abs(a))
      if (b != null && Number.isFinite(b)) focusYs.push(Math.abs(b))
    }
    const focusMax = focusYs.length ? Math.max(...focusYs) : 10
    const halfY = niceCeil(Math.max(halfX, focusMax * 1.35, 20), 10) / zoom
    const yLo = -halfY
    const yHi = halfY

    const iw = W - PAD.l - PAD.r
    const ih = H - PAD.t - PAD.b
    const sx = (x: number) => PAD.l + ((x - x0) / (x1 - x0)) * iw
    const sy = (y: number) => PAD.t + ((yHi - y) / (yHi - yLo)) * ih
    const clipY = (y: number | null) =>
      y == null || y < yLo || y > yHi ? null : y
    const left = segments(xs, yl.map(clipY))
    const right = segments(xs, yr.map(clipY))
    if (left.length === 0 && right.length === 0) return null

    const xStep = niceStep(x1 - x0, 8)
    const yStep = niceStep(yHi - yLo, 8)
    const xTicks = ticks(x0, x1, 8)
    const yTicks = ticks(yLo, yHi, 8)

    const rootPts = plot.roots
      .map((x, i) => {
        if (!(x >= x0 && x <= x1 && Number.isFinite(x))) return null
        const yL = evalExpr(plot.left, x)
        const yR = evalExpr(plot.right, x)
        const y =
          yL != null && Number.isFinite(yL)
            ? yL
            : yR != null && Number.isFinite(yR)
              ? yR
              : 0
        return {
          x,
          y,
          label: plot.labels?.[i] ?? fmtCoord(x)
        }
      })
      .filter((p): p is { x: number; y: number; label: string } => p != null)

    return {
      left,
      right,
      sx,
      sy,
      x0,
      x1,
      yLo,
      yHi,
      xStep,
      yStep,
      xTicks,
      yTicks,
      axisY: sy(0),
      axisX: sx(0),
      roots: rootPts
    }
  }, [plot, zoom])

  if (!drawn) return null

  const leftLabel = formatExpr(plot.left)
  const rightLabel = formatExpr(plot.right)
  const zoomPct = Math.round(zoom * 100)
  const zoomBtn = cn(
    gameBtn,
    'inline-flex size-8 shrink-0 items-center justify-center p-0'
  )

  return (
    <figure
      className="m-0 w-full min-w-0 rounded-sm border border-line bg-panel px-2.5 py-2"
      aria-label={t('equationSteps.graph.aria')}
    >
      <figcaption className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] text-muted">
        <span className="font-semibold tracking-wider uppercase">
          {t('equationSteps.graph.title')}
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-accent">
          <i
            className="inline-block h-0.5 w-3.5 rounded-full bg-accent"
            aria-hidden
          />
          {leftLabel}
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-info">
          <i
            className="inline-block h-0.5 w-3.5 rounded-full bg-info"
            aria-hidden
          />
          {rightLabel}
        </span>
        <span className="ml-auto inline-flex items-center gap-1">
          <button
            type="button"
            className={zoomBtn}
            title={t('equationSteps.graph.zoomOut')}
            aria-label={t('equationSteps.graph.zoomOut')}
            disabled={zoom <= ZOOM_MIN + 1e-9}
            onClick={() => setZoom((z) => clampZoom(z / ZOOM_STEP))}
          >
            <Minus className="h-[0.95em] w-[0.95em]" aria-hidden />
          </button>
          <span className="min-w-[3.2rem] text-center font-mono text-[0.7rem] tabular-nums text-ink">
            {zoomPct}%
          </span>
          <button
            type="button"
            className={zoomBtn}
            title={t('equationSteps.graph.zoomIn')}
            aria-label={t('equationSteps.graph.zoomIn')}
            disabled={zoom >= ZOOM_MAX - 1e-9}
            onClick={() => setZoom((z) => clampZoom(z * ZOOM_STEP))}
          >
            <Plus className="h-[0.95em] w-[0.95em]" aria-hidden />
          </button>
          <button
            type="button"
            className={zoomBtn}
            title={t('equationSteps.graph.zoomReset')}
            aria-label={t('equationSteps.graph.zoomReset')}
            disabled={Math.abs(zoom - 1) < 1e-9}
            onClick={() => setZoom(1)}
          >
            <RotateCcw className="h-[0.9em] w-[0.9em]" aria-hidden />
          </button>
        </span>
      </figcaption>
      <div
        className="relative touch-none"
        onWheel={(e) => {
          e.preventDefault()
          setZoom((z) => clampZoom(z * (e.deltaY > 0 ? 1 / 1.12 : 1.12)))
        }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full overflow-visible"
          role="img"
        >
          {drawn.xTicks.map((x) => (
            <line
              key={`vg-${x}`}
              x1={drawn.sx(x)}
              x2={drawn.sx(x)}
              y1={PAD.t}
              y2={H - PAD.b}
              stroke="var(--color-line)"
              strokeWidth="1"
              opacity={x === 0 ? 0 : 0.22}
            />
          ))}
          {drawn.yTicks.map((y) => (
            <line
              key={`hg-${y}`}
              x1={PAD.l}
              x2={W - PAD.r}
              y1={drawn.sy(y)}
              y2={drawn.sy(y)}
              stroke="var(--color-line)"
              strokeWidth="1"
              opacity={y === 0 ? 0 : 0.22}
            />
          ))}
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={drawn.axisY}
            y2={drawn.axisY}
            stroke="var(--color-muted)"
            strokeWidth="1.4"
          />
          {drawn.axisX >= PAD.l && drawn.axisX <= W - PAD.r ? (
            <line
              x1={drawn.axisX}
              x2={drawn.axisX}
              y1={PAD.t}
              y2={H - PAD.b}
              stroke="var(--color-muted)"
              strokeWidth="1.4"
            />
          ) : null}
        {drawn.xTicks.map((x) => (
          <g key={`xt-${x}`}>
            <line
              x1={drawn.sx(x)}
              x2={drawn.sx(x)}
              y1={drawn.axisY - 3.5}
              y2={drawn.axisY + 3.5}
              stroke="var(--color-muted)"
              strokeWidth="1"
            />
            {Math.abs(x) < drawn.xStep * 1e-8 ? null : (
              <text
                x={drawn.sx(x)}
                y={drawn.axisY + 15}
                fill="var(--color-ink)"
                fontSize="11"
                fontFamily="ui-monospace, monospace"
                textAnchor="middle"
              >
                {fmtTick(x, drawn.xStep)}
              </text>
            )}
          </g>
        ))}
        {(() => {
          const ay =
            drawn.axisX >= PAD.l && drawn.axisX <= W - PAD.r
              ? drawn.axisX
              : PAD.l
          return drawn.yTicks.map((y) => (
            <g key={`yt-${y}`}>
              <line
                x1={ay - 3.5}
                x2={ay + 3.5}
                y1={drawn.sy(y)}
                y2={drawn.sy(y)}
                stroke="var(--color-muted)"
                strokeWidth="1"
              />
              {Math.abs(y) < drawn.yStep * 1e-8 ? null : (
                <text
                  x={ay > PAD.l + 36 ? ay - 7 : ay + 7}
                  y={drawn.sy(y) + 3.5}
                  fill="var(--color-ink)"
                  fontSize="11"
                  fontFamily="ui-monospace, monospace"
                  textAnchor={ay > PAD.l + 36 ? 'end' : 'start'}
                >
                  {fmtTick(y, drawn.yStep)}
                </text>
              )}
            </g>
          ))
        })()}
        {drawn.x0 <= 0 &&
        drawn.x1 >= 0 &&
        drawn.yLo <= 0 &&
        drawn.yHi >= 0 ? (
          <text
            x={drawn.axisX - 6}
            y={drawn.axisY + 14}
            fill="var(--color-ink)"
            fontSize="11"
            fontFamily="ui-monospace, monospace"
            textAnchor="end"
          >
            0
          </text>
        ) : null}
        <text
          x={W - PAD.r}
          y={drawn.axisY - 7}
          fill="var(--color-muted)"
          fontSize="12"
          fontFamily="ui-monospace, monospace"
          textAnchor="end"
        >
          {plot.variable}
        </text>
        <text
          x={
            drawn.axisX >= PAD.l && drawn.axisX <= W - PAD.r
              ? drawn.axisX + 7
              : PAD.l + 7
          }
          y={PAD.t + 12}
          fill="var(--color-muted)"
          fontSize="12"
          fontFamily="ui-monospace, monospace"
        >
          y
        </text>
        {/* Curves + roots above tick labels. */}
        <path
          d={toPath(drawn.left, drawn.sx, drawn.sy)}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2.25"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={toPath(drawn.right, drawn.sx, drawn.sy)}
          fill="none"
          stroke="var(--color-info)"
          strokeWidth="2.25"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {drawn.roots.map((p, i) => {
          const px = drawn.sx(p.x)
          const py = drawn.sy(p.y)
          const placeRight = px < W - PAD.r - 90
          const lx = placeRight ? px + 10 : px - 10
          const anchor = placeRight ? 'start' : 'end'
          const stack = i % 2 === 0 ? -1 : 1
          return (
            <g key={`${p.x}-${p.label}`}>
              <circle
                cx={px}
                cy={py}
                r="4.5"
                fill="var(--color-best)"
                stroke="var(--color-panel)"
                strokeWidth="1.75"
              />
              <text
                x={lx}
                y={py + stack * 4}
                fill="var(--color-best)"
                fontSize="12"
                fontFamily="ui-monospace, monospace"
                fontWeight="700"
                textAnchor={anchor}
              >
                {`(${p.label}; ${fmtCoord(p.y)})`}
              </text>
            </g>
          )
        })}
        </svg>
      </div>
    </figure>
  )
}
