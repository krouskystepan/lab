import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FlipHorizontal2 } from 'lucide-react'
import { AxisPanel } from './components/AxisPanel'
import { Grid } from './components/Grid'
import { HotkeysBar } from './components/HotkeysBar'
import { LegendStrip } from './components/LegendStrip'
import { SizeBar } from './components/SizeBar'
import { Toolbar } from './components/Toolbar'
import { solve, countMines } from './solver/solve'
import { axisWhyMessage } from './solver/explainAxis'
import { placementLeavesAxis } from './solver/validate'
import type {
  AxisId,
  BoardCell,
  CellAspect,
  EditMode,
  EnabledFamilies,
  UserCell
} from './solver/types'
import { BoardHistory, type BoardSnapshot } from './storage/boardHistory'
import {
  emptyBoard,
  loadBoard,
  resizeCells,
  saveBoard,
  type SavedBoard
} from './storage/gameStore'
import { showToast } from '../../shared/toast'
import {
  MobileHelpCard,
  boardStage,
  gameShell,
  gameStickyControls
} from '../../shared/gameUi'
import { useI18n } from '../../i18n'
import { LangSwitch } from '../../shell/LangSwitch'

function clearSolver(board: BoardCell[]): BoardCell[] {
  return board.map((c) => ({ user: c.user }))
}

function paintMarks(
  board: BoardCell[],
  width: number,
  height: number,
  enabled: EnabledFamilies,
  totalMines?: number
): {
  cells: BoardCell[]
  possibleCount: number
  candidateCount: number
} {
  const result = solve({
    width,
    height,
    cells: board.map((c) => c.user),
    enabled,
    totalMines
  })
  const base = clearSolver(board)
  for (const [i, mark] of result.marks) {
    base[i] = { ...base[i], solver: mark }
  }
  return {
    cells: base,
    possibleCount: result.possibleCount,
    candidateCount: result.axes.length
  }
}

export default function MirrorHelperApp() {
  const { t, locale } = useI18n()
  const [saved] = useState<SavedBoard>(() => loadBoard())

  const [width, setWidth] = useState(saved.width)
  const [height, setHeight] = useState(saved.height)
  const [cellAspect, setCellAspect] = useState<CellAspect>(
    saved.cellAspect ?? 'square'
  )
  const [cells, setCells] = useState<BoardCell[]>(saved.cells)
  const [mode, setMode] = useState<EditMode>(() =>
    saved.mode === 'not' ? 'not' : 'mine'
  )
  const [enabled, setEnabled] = useState<EnabledFamilies>(saved.enabled)
  const [autoSolve, setAutoSolve] = useState(saved.autoSolve !== false)
  const [useTotal, setUseTotal] = useState(Boolean(saved.useTotal))
  const [totalMines, setTotalMines] = useState(saved.totalMines ?? 8)
  const [hydrated, setHydrated] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [cursorIndex, setCursorIndex] = useState<number | null>(null)
  const [keyboardCursor, setKeyboardCursor] = useState(false)
  const [whyCells, setWhyCells] = useState<ReadonlySet<number>>(() => new Set())

  const historyRef = useRef(new BoardHistory())
  const cellsRef = useRef(cells)
  cellsRef.current = cells
  const widthRef = useRef(width)
  widthRef.current = width
  const heightRef = useRef(height)
  heightRef.current = height
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled
  const modeRef = useRef(mode)
  modeRef.current = mode
  const autoSolveRef = useRef(autoSolve)
  autoSolveRef.current = autoSolve
  const useTotalRef = useRef(useTotal)
  useTotalRef.current = useTotal
  const totalMinesRef = useRef(totalMines)
  totalMinesRef.current = totalMines
  const cursorRef = useRef(cursorIndex)
  cursorRef.current = cursorIndex

  const activeTotal = useCallback(
    () => (useTotalRef.current ? totalMinesRef.current : undefined),
    []
  )

  const syncHistoryFlags = useCallback(() => {
    setCanUndo(historyRef.current.canUndo)
    setCanRedo(historyRef.current.canRedo)
  }, [])

  const currentSnapshot = useCallback((): BoardSnapshot => {
    return {
      width,
      height,
      cellAspect,
      cells,
      enabled
    }
  }, [width, height, cellAspect, cells, enabled])

  const applySnapshot = useCallback((snap: BoardSnapshot) => {
    setWidth(snap.width)
    setHeight(snap.height)
    setCellAspect(snap.cellAspect)
    setCells(snap.cells)
    setEnabled(snap.enabled)
  }, [])

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    document.title = `${t('mirrorHelper.appName')} · ${t('hub.brand')}`
  }, [t, locale])

  useEffect(() => {
    if (!hydrated) return
    saveBoard({
      width,
      height,
      cellAspect,
      cells: cells.map((c) => ({ user: c.user })),
      mode,
      enabled,
      autoSolve,
      useTotal,
      totalMines
    })
  }, [
    hydrated,
    width,
    height,
    cellAspect,
    cells,
    mode,
    enabled,
    autoSolve,
    useTotal,
    totalMines
  ])

  useEffect(() => {
    setCursorIndex((prev) => {
      if (prev == null) return prev
      if (prev >= width * height) return 0
      return prev
    })
  }, [width, height])

  // Disable diagonal family when board becomes non-square
  useEffect(() => {
    if (width === height) return
    setEnabled((e) => (e.diagonal ? { ...e, diagonal: false } : e))
  }, [width, height])

  const pushHistory = useCallback(() => {
    historyRef.current.push(currentSnapshot())
    syncHistoryFlags()
  }, [currentSnapshot, syncHistoryFlags])

  const applySolve = useCallback(
    (
      board: BoardCell[],
      opts?: {
        w?: number
        h?: number
        enabled?: EnabledFamilies
        totalMines?: number | null
        toast?: boolean
      }
    ) => {
      const w = opts?.w ?? widthRef.current
      const h = opts?.h ?? heightRef.current
      const en = opts?.enabled ?? enabledRef.current
      const total =
        opts?.totalMines === null
          ? undefined
          : opts?.totalMines !== undefined
            ? opts.totalMines
            : activeTotal()
      const painted = paintMarks(board, w, h, en, total)

      if (opts?.toast) {
        notifySolve(painted.possibleCount, painted.candidateCount)
      }
      return painted.cells
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- notifySolve uses t
    [t, activeTotal]
  )

  function notifySolve(possibleCount: number, candidateCount: number) {
    if (candidateCount === 0) return
    if (possibleCount === 0) {
      showToast(t('mirrorHelper.solve.zero'), 'warn')
    } else if (possibleCount === 1) {
      showToast(t('mirrorHelper.solve.one'), 'info')
    } else if (!autoSolveRef.current) {
      showToast(t('mirrorHelper.solve.many', { n: possibleCount }), 'info')
    }
  }

  const commitBoard = useCallback(
    (next: BoardCell[], size?: { width: number; height: number }) => {
      const w = size?.width ?? widthRef.current
      const h = size?.height ?? heightRef.current
      if (size) {
        setWidth(size.width)
        setHeight(size.height)
      }
      const withSolve = autoSolveRef.current
        ? applySolve(next, { w, h, toast: false })
        : clearSolver(next)
      setCells(withSolve)
    },
    [applySolve]
  )

  const onSolve = useCallback(() => {
    pushHistory()
    setCells(applySolve(cellsRef.current, { toast: true }))
  }, [applySolve, pushHistory])

  const onAutoSolveChange = useCallback(
    (v: boolean) => {
      setAutoSolve(v)
      if (v) {
        setCells(applySolve(cellsRef.current, { toast: false }))
      }
    },
    [applySolve]
  )

  const onUseTotalChange = useCallback(
    (v: boolean) => {
      setUseTotal(v)
      useTotalRef.current = v
      if (autoSolveRef.current) {
        setCells(
          applySolve(cellsRef.current, {
            totalMines: v ? totalMinesRef.current : null,
            toast: false
          })
        )
      }
    },
    [applySolve]
  )

  const onTotalMinesChange = useCallback(
    (n: number) => {
      setTotalMines(n)
      totalMinesRef.current = n
      if (useTotalRef.current && autoSolveRef.current) {
        setCells(applySolve(cellsRef.current, { totalMines: n, toast: false }))
      }
    },
    [applySolve]
  )

  const onUndo = useCallback(() => {
    const prev = historyRef.current.undo(currentSnapshot())
    if (!prev) return
    applySnapshot(prev)
    syncHistoryFlags()
  }, [currentSnapshot, applySnapshot, syncHistoryFlags])

  const onRedo = useCallback(() => {
    const next = historyRef.current.redo(currentSnapshot())
    if (!next) return
    applySnapshot(next)
    syncHistoryFlags()
  }, [currentSnapshot, applySnapshot, syncHistoryFlags])

  const onClearBoard = useCallback(() => {
    pushHistory()
    commitBoard(emptyBoard(width, height))
  }, [width, height, pushHistory, commitBoard])

  const onSizeChange = useCallback(
    (w: number, h: number) => {
      if (w === width && h === height) return
      pushHistory()
      const next = resizeCells(cellsRef.current, width, height, w, h)
      let nextEnabled = enabledRef.current
      if (w !== h && nextEnabled.diagonal) {
        nextEnabled = { ...nextEnabled, diagonal: false }
        setEnabled(nextEnabled)
      }
      setWidth(w)
      setHeight(h)
      const withSolve = autoSolveRef.current
        ? applySolve(next, {
            w,
            h,
            enabled: nextEnabled,
            toast: false
          })
        : clearSolver(next)
      setCells(withSolve)
    },
    [width, height, pushHistory, applySolve]
  )

  const onEnabledChange = useCallback(
    (next: EnabledFamilies) => {
      pushHistory()
      setEnabled(next)
      if (autoSolveRef.current) {
        setCells(
          applySolve(cellsRef.current, {
            enabled: next,
            toast: false
          })
        )
      }
    },
    [pushHistory, applySolve]
  )

  const applyToolAt = useCallback(
    (index: number, tool: EditMode | 'erase') => {
      const board = cellsRef.current
      const cur = board[index]?.user
      if (!cur) return

      let nextUser: UserCell
      if (tool === 'erase') {
        if (cur.type === 'empty') return
        nextUser = { type: 'empty' }
      } else if (tool === 'mine') {
        nextUser = cur.type === 'mine' ? { type: 'empty' } : { type: 'mine' }
      } else {
        nextUser = cur.type === 'not' ? { type: 'empty' } : { type: 'not' }
      }

      if (
        nextUser.type !== 'empty' &&
        !placementLeavesAxis(
          widthRef.current,
          heightRef.current,
          board.map((c) => c.user),
          index,
          nextUser,
          enabledRef.current,
          activeTotal()
        )
      ) {
        showToast(t('mirrorHelper.validate.noAxis'), 'error')
        return
      }

      pushHistory()
      const next = board.map((c, i) =>
        i === index ? { user: nextUser } : { user: c.user }
      )
      commitBoard(next)
    },
    [pushHistory, commitBoard, t, activeTotal]
  )

  const onCellClick = useCallback(
    (index: number) => {
      setWhyCells(new Set())
      setKeyboardCursor(false)
      setCursorIndex(index)
      applyToolAt(index, modeRef.current)
    },
    [applyToolAt]
  )

  const onCellClear = useCallback(
    (index: number) => {
      setWhyCells(new Set())
      setKeyboardCursor(false)
      setCursorIndex(index)
      applyToolAt(index, 'erase')
    },
    [applyToolAt]
  )

  // Initial auto-solve after hydrate
  useEffect(() => {
    if (!hydrated || !autoSolve) return
    if (cellsRef.current.some((c) => c.solver != null)) return
    setCells(applySolve(cellsRef.current, { toast: false }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) onRedo()
        else onUndo()
        return
      }
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault()
        onSolve()
        return
      }
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        setMode('mine')
        return
      }
      if (e.key === 'x' || e.key === 'X') {
        e.preventDefault()
        setMode('not')
        return
      }

      const w = widthRef.current
      const h = heightRef.current
      const idx = cursorRef.current ?? 0
      let next: number | null = null
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setKeyboardCursor(true)
        next = idx >= w ? idx - w : idx
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setKeyboardCursor(true)
        next = idx + w < w * h ? idx + w : idx
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setKeyboardCursor(true)
        next = idx % w > 0 ? idx - 1 : idx
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setKeyboardCursor(true)
        next = idx % w < w - 1 ? idx + 1 : idx
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const at = cursorRef.current
        if (at != null) applyToolAt(at, modeRef.current)
        return
      }
      if (next != null) setCursorIndex(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onUndo, onRedo, onSolve, applyToolAt])

  const axisSolve = useMemo(
    () =>
      solve({
        width,
        height,
        cells: cells.map((c) => c.user),
        enabled,
        totalMines: useTotal ? totalMines : undefined
      }),
    [width, height, cells, enabled, useTotal, totalMines]
  )

  const onExplainAxis = useCallback(
    (id: AxisId) => {
      const axis = axisSolve.axes.find((a) => a.id === id)
      if (!axis?.why) return
      const msg = axisWhyMessage(axis.why, width)
      showToast(t(msg.key, msg.vars), 'warn')
      if (axis.why.kind === 'conflict') {
        setWhyCells(new Set([axis.why.a, axis.why.b]))
      } else {
        setWhyCells(new Set())
      }
    },
    [axisSolve.axes, width, t]
  )

  const knownMines = useMemo(
    () => countMines(cells.map((c) => c.user)),
    [cells]
  )

  return (
    <div className={gameShell}>
      <header className="order-0 flex shrink-0 flex-col gap-1.5">
        <div className="flex w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
          <div className="flex min-w-0 items-center gap-[0.55rem]">
            <Link
              to="/"
              className="inline-flex h-[1.35rem] w-[1.35rem] shrink-0 items-center justify-center rounded-full bg-accent text-ink no-underline shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-accent)_35%,transparent),0_0_12px_color-mix(in_srgb,var(--color-accent)_40%,transparent)]"
              aria-label={t('hub.backHome')}
              title={t('hub.backHome')}
            >
              <FlipHorizontal2
                className="h-[0.85rem] w-[0.85rem]"
                strokeWidth={2.25}
              />
            </Link>
            <h1 className="m-0 truncate text-[1.15rem] font-bold tracking-[-0.03em] max-[720px]:text-base [@media(max-height:700px)]:text-base">
              {t('mirrorHelper.appName')}
            </h1>
          </div>
          <div className="ml-auto flex min-w-0 max-w-full flex-wrap items-center justify-end gap-[0.45rem]">
            <LangSwitch />
            <div className="flex min-[981px]:hidden">
              <MobileHelpCard
                variant="inline"
                sections={[
                  {
                    title: t('mirrorHelper.help.title'),
                    body: (
                      <>
                        <p className="m-0 mb-1.5">
                          {t('mirrorHelper.help.body')}
                        </p>
                        <p className="m-0">{t('mirrorHelper.help.axes')}</p>
                      </>
                    )
                  },
                  {
                    title: t('mirrorHelper.legend.title'),
                    body: (
                      <>
                        <p className="m-0 mb-1">
                          <strong>{t('mirrorHelper.legend.mine')}</strong> -{' '}
                          {t('mirrorHelper.legend.mineBody')}
                        </p>
                        <p className="m-0 mb-1">
                          <strong>{t('mirrorHelper.legend.not')}</strong> -{' '}
                          {t('mirrorHelper.legend.notBody')}
                        </p>
                        <p className="m-0 mb-1">
                          <strong>{t('mirrorHelper.legend.certain')}</strong> -{' '}
                          {t('mirrorHelper.legend.certainBody')}
                        </p>
                        <p className="m-0 mb-1">
                          <strong>{t('mirrorHelper.legend.hint')}</strong> -{' '}
                          {t('mirrorHelper.legend.hintBody')}
                        </p>
                        <p className="m-0">
                          <strong>{t('mirrorHelper.legend.probe')}</strong> -{' '}
                          {t('mirrorHelper.legend.probeBody')}
                        </p>
                      </>
                    )
                  }
                ]}
              />
            </div>
          </div>
        </div>
        <div className="hidden w-full flex-wrap items-center justify-start gap-x-3 gap-y-1.5 min-[981px]:flex">
          <LegendStrip />
          <HotkeysBar />
        </div>
      </header>

      {/* Board first - same order as Mine Helper */}
      <div className="board-frame order-1 rounded-md border border-line bg-elevated shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)]">
        <div className={boardStage}>
          <Grid
            width={width}
            height={height}
            cellAspect={cellAspect}
            cells={cells}
            axes={axisSolve.axes}
            onExplainAxis={onExplainAxis}
            whyCells={whyCells}
            onCellClick={onCellClick}
            onCellClear={onCellClear}
            cursorIndex={cursorIndex}
            keyboardCursor={keyboardCursor}
          />
        </div>
      </div>

      {/* Tools sticky on phone; Size | Axes | Tools under board on desktop */}
      <div
        className={`${gameStickyControls} relative z-5 order-2 w-full shrink-0 max-[980px]:order-2`}
      >
        <Toolbar
          mode={mode}
          onModeChange={setMode}
          useTotal={useTotal}
          onUseTotalChange={onUseTotalChange}
          totalMines={totalMines}
          onTotalMinesChange={onTotalMinesChange}
          knownMines={knownMines}
          autoSolve={autoSolve}
          onAutoSolveChange={onAutoSolveChange}
          onSolve={onSolve}
          onClearBoard={onClearBoard}
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </div>

      <div className="game-secondary relative z-5 order-3 flex w-full shrink-0 flex-col gap-[0.55rem] max-[980px]:order-3 min-[981px]:grid min-[981px]:grid-cols-2 min-[981px]:items-stretch">
        <SizeBar
          width={width}
          height={height}
          cellAspect={cellAspect}
          onSizeChange={onSizeChange}
          onCellAspectChange={setCellAspect}
        />
        <AxisPanel
          width={width}
          height={height}
          enabled={enabled}
          onEnabledChange={onEnabledChange}
          axes={axisSolve.axes}
          onExplainAxis={onExplainAxis}
          possibleCount={axisSolve.possibleCount}
        />
      </div>
    </div>
  )
}
