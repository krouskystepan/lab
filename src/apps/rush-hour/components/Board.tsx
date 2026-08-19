import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { axisRange } from '../game/engine'
import { exitRow, visCols, type Vehicle } from '../game/types'
import { isPrimary, vehicleColor } from '../game/colors'

type BoardProps = {
  vehicles: Vehicle[]
  size: number
  walls: number[]
  selected: string | null
  hintId: string | null
  ended: boolean
  onSelect: (id: string | null) => void
  onSlide: (id: string, row: number, col: number) => void
}

type DragState = {
  id: string
  pointerId: number
  startX: number
  startY: number
  startRow: number
  startCol: number
  min: number
  max: number
  dir: 'h' | 'v'
}

export function Board({
  vehicles,
  size,
  walls,
  selected,
  hintId,
  ended,
  onSelect,
  onSlide
}: BoardProps) {
  const { t } = useI18n()
  const cols = visCols(size)
  const outRow = exitRow(size)
  const blocked = new Set(walls)
  const lot = { size, walls }
  const gridRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [live, setLive] = useState<{ id: string; row: number; col: number } | null>(
    null
  )
  const dragRef = useRef(drag)
  dragRef.current = drag
  const liveRef = useRef(live)
  liveRef.current = live
  const vehiclesRef = useRef(vehicles)
  vehiclesRef.current = vehicles
  const lotRef = useRef(lot)
  lotRef.current = lot
  const colsRef = useRef(cols)
  colsRef.current = cols
  const onSlideRef = useRef(onSlide)
  onSlideRef.current = onSlide

  const shown = vehicles.map((v) =>
    live && live.id === v.id ? { ...v, row: live.row, col: live.col } : v
  )

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current
      if (!d || e.pointerId !== d.pointerId) return
      const el = gridRef.current
      const cellPx = el ? el.getBoundingClientRect().width / colsRef.current : 1
      const dx = (e.clientX - d.startX) / cellPx
      const dy = (e.clientY - d.startY) / cellPx
      if (d.dir === 'h') {
        const col = clamp(d.startCol + dx, d.min, d.max)
        setLive({ id: d.id, row: d.startRow, col })
      } else {
        const row = clamp(d.startRow + dy, d.min, d.max)
        setLive({ id: d.id, col: d.startCol, row })
      }
    }
    const onUp = (e: PointerEvent) => {
      const d = dragRef.current
      if (!d || e.pointerId !== d.pointerId) return
      const cur = liveRef.current
      setDrag(null)
      setLive(null)
      if (!cur || cur.id !== d.id) return
      const v = vehiclesRef.current.find((x) => x.id === d.id)
      if (!v) return
      const row =
        d.dir === 'h' ? d.startRow : clamp(Math.round(cur.row), d.min, d.max)
      const col =
        d.dir === 'v' ? d.startCol : clamp(Math.round(cur.col), d.min, d.max)
      if (row === v.row && col === v.col) return
      onSlideRef.current(d.id, row, col)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])

  const onCarDown = (e: ReactPointerEvent, v: Vehicle) => {
    if (ended) return
    e.preventDefault()
    e.stopPropagation()
    onSelect(v.id)
    const { min, max } = axisRange(vehiclesRef.current, v.id, lotRef.current)
    const next: DragState = {
      id: v.id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startRow: v.row,
      startCol: v.col,
      min,
      max,
      dir: v.dir
    }
    setDrag(next)
    setLive({ id: v.id, row: v.row, col: v.col })
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  return (
    <div
      ref={gridRef}
      className="mine-grid rush-grid"
      style={
        {
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          ['--cols' as string]: cols,
          ['--rows' as string]: size,
          ['--cell-ar' as string]: 1
        } as CSSProperties
      }
      role="grid"
      aria-label={t('rushHour.gridAria')}
      aria-colcount={cols}
      aria-rowcount={size}
      onPointerDown={() => {
        if (!drag) onSelect(null)
      }}
    >
      {Array.from({ length: size * cols }, (_, vis) => {
        const row = Math.floor(vis / cols)
        const col = vis % cols
        const exit = col === size && row === outRow
        const gutter = col === size && !exit
        const gate = col === size - 1 && row === outRow
        const isWall = col < size && blocked.has(row * size + col)
        return (
          <div
            key={vis}
            className={cn(
              'rush-cell',
              gutter && 'rush-cell-gutter',
              exit && 'rush-cell-exit',
              col < size && !isWall && 'rush-cell-lot',
              isWall && 'rush-cell-wall',
              gate && !isWall && 'rush-cell-gate'
            )}
            role="gridcell"
            aria-label={
              exit
                ? t('rushHour.exit')
                : isWall
                  ? t('rushHour.wall')
                  : gutter
                    ? undefined
                    : `${row + 1},${col + 1}`
            }
          >
            {isWall ? (
              <span className="rush-wall" aria-hidden>
                <span className="rush-wall-bar" />
                <span className="rush-wall-bar" />
              </span>
            ) : null}
            {exit ? (
              <span className="rush-exit" aria-hidden>
                <span className="rush-exit-chevron" />
                <span className="rush-exit-chevron" />
              </span>
            ) : null}
          </div>
        )
      })}
      {shown.map((v) => (
        <Car
          key={v.id}
          vehicle={v}
          size={size}
          selected={selected === v.id}
          hinted={hintId === v.id}
          dragging={drag?.id === v.id}
          ended={ended}
          label={
            isPrimary(v) ? t('rushHour.car.red') : t('rushHour.car.other', { id: v.id })
          }
          onPointerDown={(e) => onCarDown(e, v)}
        />
      ))}
    </div>
  )
}

export function BuildingLot({ size }: { size: number }) {
  const { t } = useI18n()
  const cols = visCols(size)
  const outRow = exitRow(size)
  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center">
      <div className="relative">
        <div
          className="mine-grid rush-grid rush-grid-building"
          style={
            {
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              ['--cols' as string]: cols,
              ['--rows' as string]: size,
              ['--cell-ar' as string]: 1
            } as CSSProperties
          }
          role="status"
          aria-live="polite"
          aria-label={t('rushHour.building')}
        >
        {Array.from({ length: size * cols }, (_, vis) => {
          const row = Math.floor(vis / cols)
          const col = vis % cols
          const exit = col === size && row === outRow
          const gutter = col === size && !exit
          return (
            <div
              key={vis}
              className={cn(
                'rush-cell',
                gutter && 'rush-cell-gutter',
                exit && 'rush-cell-exit',
                col < size && 'rush-cell-lot rush-cell-building'
              )}
            />
          )
        })}
        </div>
        <p className="rush-building-label">{t('rushHour.building')}</p>
      </div>
    </div>
  )
}

function Car({
  vehicle,
  size,
  selected,
  hinted,
  dragging,
  ended,
  label,
  onPointerDown
}: {
  vehicle: Vehicle
  size: number
  selected: boolean
  hinted: boolean
  dragging: boolean
  ended: boolean
  label: string
  onPointerDown: (e: ReactPointerEvent) => void
}) {
  const { row, col, len, dir } = vehicle
  const color = vehicleColor(vehicle.id)
  const cols = visCols(size)
  const gap = 'clamp(3px, 1.15cqmin, 7px)'
  const left = (col / cols) * 100
  const top = (row / size) * 100
  const width = ((dir === 'h' ? len : 1) / cols) * 100
  const height = ((dir === 'v' ? len : 1) / size) * 100

  return (
    <button
      type="button"
      className={cn(
        'rush-car',
        isPrimary(vehicle) && 'rush-car-red',
        selected && 'rush-car-selected',
        hinted && 'rush-car-hint',
        dragging && 'rush-car-dragging',
        ended && 'rush-car-ended'
      )}
      style={{
        left: `calc(${left}% + ${gap})`,
        top: `calc(${top}% + ${gap})`,
        width: `calc(${width}% - 2 * ${gap})`,
        height: `calc(${height}% - 2 * ${gap})`,
        backgroundColor: color,
        cursor: ended ? 'default' : dir === 'h' ? 'ew-resize' : 'ns-resize'
      }}
      aria-label={label}
      aria-pressed={selected}
      disabled={ended}
      onPointerDown={onPointerDown}
    >
      {isPrimary(vehicle) ? (
        <span className="rush-car-hero" aria-hidden>
          <span className="rush-car-hero-arrow" />
        </span>
      ) : (
        <span
          className={cn('rush-car-mark', dir === 'h' ? 'rush-car-mark-h' : 'rush-car-mark-v')}
          aria-hidden
        />
      )}
    </button>
  )
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
