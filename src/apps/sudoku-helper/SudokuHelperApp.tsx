import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Grid3x3 } from 'lucide-react'
import { Grid } from './components/Grid'
import { HotkeysBar } from './components/HotkeysBar'
import { ControlsBar } from './components/ControlsBar'
import { CELL_COUNT, colOf, rowOf } from '../sudoku/game/board'
import { paintSolve } from './solver/solve'
import type { BoardCell, NextMove } from './solver/types'
import { BoardHistory, snapshotOf } from './storage/history'
import { loadBoard, saveBoard } from './storage/store'
import { useI18n } from '../../i18n'
import { LangSwitch } from '../../shell/LangSwitch'
import { showToast } from '../../shared/toast'
import {
  ExportImportButtons,
  exportSudokuHelperBoard,
  importSudokuToHelper,
  type BoardFile,
  type BoardImportResult
} from '../../shared/boardTransfer'
import { MobileHelpCard } from '../../shared/gameUi'

export default function SudokuHelperApp() {
  const { t, locale } = useI18n()
  const initial = useRef(loadBoard()).current
  const [cells, setCells] = useState<BoardCell[]>(initial.cells)
  const [digit, setDigit] = useState<number | null>(
    initial.eraseMode ? null : initial.digit
  )
  const [eraseMode, setEraseMode] = useState(initial.eraseMode)
  const [autoSolve, setAutoSolve] = useState(initial.autoSolve)
  const [selected, setSelected] = useState<number | null>(null)
  const [nextMove, setNextMove] = useState<NextMove | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const historyRef = useRef(new BoardHistory())
  const cellsRef = useRef(cells)
  cellsRef.current = cells
  const digitRef = useRef(digit)
  digitRef.current = digit
  const eraseModeRef = useRef(eraseMode)
  eraseModeRef.current = eraseMode
  const autoSolveRef = useRef(autoSolve)
  autoSolveRef.current = autoSolve
  const selectedRef = useRef(selected)
  selectedRef.current = selected

  const syncHistory = useCallback(() => {
    setCanUndo(historyRef.current.canUndo)
    setCanRedo(historyRef.current.canRedo)
  }, [])

  const pushHistory = useCallback(() => {
    historyRef.current.push(snapshotOf(cellsRef.current))
    syncHistory()
  }, [syncHistory])

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveBoard({
      cells,
      digit,
      eraseMode,
      mode: eraseMode ? 'erase' : 'digit',
      autoSolve
    })
  }, [hydrated, cells, digit, eraseMode, autoSolve])

  useEffect(() => {
    document.title = `${t('sudokuHelper.appName')} · ${t('hub.brand')}`
  }, [t, locale])

  const applySolve = useCallback(
    (board: BoardCell[], opts?: { silent?: boolean }): BoardCell[] => {
      const painted = paintSolve(board)
      setNextMove(painted.next)
      if (!painted.ok) {
        if (!opts?.silent) {
          showToast(t('sudokuHelper.solve.conflict'), 'error')
        }
      } else if (!opts?.silent) {
        const n = painted.next
        if (n) {
          showToast(
            t('sudokuHelper.solve.next', {
              digit: n.digit,
              kind: t(
                n.kind === 'naked'
                  ? 'sudokuHelper.solve.naked'
                  : 'sudokuHelper.solve.hidden'
              )
            }),
            'info'
          )
        } else {
          const empty = board.some((c) => c.user.value === 0)
          showToast(
            empty
              ? t('sudokuHelper.solve.noSingle')
              : t('sudokuHelper.solve.complete'),
            empty ? 'warn' : 'info'
          )
        }
      }
      return painted.cells
    },
    [t]
  )

  const commit = useCallback(
    (next: BoardCell[]) => {
      const withSolve = autoSolveRef.current
        ? applySolve(next, { silent: true })
        : next.map((c) => ({ user: { ...c.user } }))
      if (!autoSolveRef.current) setNextMove(null)
      setCells(withSolve)
    },
    [applySolve]
  )

  const onSolve = useCallback(() => {
    pushHistory()
    setCells(applySolve(cellsRef.current))
  }, [applySolve, pushHistory])

  const onNext = useCallback(() => {
    let board = cellsRef.current
    let move = nextMove
    if (!move) {
      const painted = paintSolve(board)
      board = painted.cells
      move = painted.next
      if (!move) {
        showToast(t('sudokuHelper.solve.noSingle'), 'warn')
        setCells(painted.cells)
        setNextMove(null)
        return
      }
    }
    pushHistory()
    const next = board.map((c, i) =>
      i === move!.index
        ? { user: { value: move!.digit } }
        : { user: { ...c.user } }
    )
    setSelected(move.index)
    commit(next)
  }, [commit, nextMove, pushHistory, t])

  const onAutoSolveChange = useCallback(
    (v: boolean) => {
      setAutoSolve(v)
      if (v) {
        setCells(applySolve(cellsRef.current, { silent: true }))
      }
    },
    [applySolve]
  )

  const onUndo = useCallback(() => {
    const prev = historyRef.current.undo(snapshotOf(cellsRef.current))
    if (!prev) return
    setCells(prev.cells)
    setNextMove(null)
    syncHistory()
  }, [syncHistory])

  const onRedo = useCallback(() => {
    const next = historyRef.current.redo(snapshotOf(cellsRef.current))
    if (!next) return
    setCells(next.cells)
    setNextMove(null)
    syncHistory()
  }, [syncHistory])

  const onClear = useCallback(() => {
    pushHistory()
    setNextMove(null)
    setCells(
      Array.from({ length: CELL_COUNT }, () => ({ user: { value: 0 } }))
    )
  }, [pushHistory])

  const onExportBoard = useCallback(
    () => exportSudokuHelperBoard(cellsRef.current),
    []
  )

  const onImportBoard = useCallback(
    (file: BoardFile): BoardImportResult => {
      if (file.family !== 'sudoku') {
        return { ok: false, reason: 'wrong_family' }
      }
      try {
        const values = importSudokuToHelper(file)
        pushHistory()
        setNextMove(null)
        const next = values.map((value) => ({ user: { value } }))
        commit(next)
        return { ok: true }
      } catch {
        return { ok: false, reason: 'invalid' }
      }
    },
    [pushHistory, commit]
  )

  const onDigitChange = useCallback((d: number) => {
    setEraseMode(false)
    setDigit((prev) => (prev === d ? null : d))
  }, [])

  const onEraseMode = useCallback(() => {
    setEraseMode((on) => {
      const next = !on
      if (next) setDigit(null)
      return next
    })
  }, [])

  const onSelect = useCallback(
    (index: number) => {
      setSelected(index)
      const cell = cellsRef.current[index]
      if (!cell) return

      if (eraseModeRef.current) {
        if (cell.user.value === 0) return
        pushHistory()
        const next = cellsRef.current.map((c, i) =>
          i === index ? { user: { value: 0 } } : { user: { ...c.user } }
        )
        commit(next)
        return
      }

      const d = digitRef.current
      if (d == null) return
      if (cell.user.value === d) return
      pushHistory()
      const next = cellsRef.current.map((c, i) =>
        i === index ? { user: { value: d } } : { user: { ...c.user } }
      )
      commit(next)
    },
    [commit, pushHistory]
  )

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
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        onNext()
        return
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        onClear()
        return
      }
      if (
        e.key === 'Backspace' ||
        e.key === 'Delete' ||
        e.key === '0' ||
        e.key === 'e' ||
        e.key === 'E'
      ) {
        e.preventDefault()
        onEraseMode()
        return
      }
      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault()
        const d = Number(e.key)
        setEraseMode(false)
        setDigit((prev) => (prev === d ? null : d))
        return
      }
      const idx = selectedRef.current ?? 0
      let next: number | null = null
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        next = rowOf(idx) > 0 ? idx - 9 : idx
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        next = rowOf(idx) < 8 ? idx + 9 : idx
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        next = colOf(idx) > 0 ? idx - 1 : idx
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        next = colOf(idx) < 8 ? idx + 1 : idx
      }
      if (next != null && next >= 0 && next < CELL_COUNT) {
        setSelected(next)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClear, onEraseMode, onNext, onRedo, onSolve, onUndo])

  const canNext =
    nextMove != null || cells.some((c) => c.user.value === 0)

  return (
    <div className="game-shell">
      <header className="order-0 flex shrink-0 flex-col gap-1.5">
        <div className="flex min-h-8 w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
          <div className="flex shrink-0 items-center gap-[0.55rem]">
            <Link
              to="/"
              className="inline-flex h-[1.35rem] w-[1.35rem] items-center justify-center rounded-full bg-accent text-ink no-underline shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-accent)_35%,transparent),0_0_12px_color-mix(in_srgb,var(--color-accent)_40%,transparent)]"
              aria-label={t('hub.backHome')}
              title={t('hub.backHome')}
            >
              <Grid3x3 className="h-[0.85rem] w-[0.85rem]" strokeWidth={2.25} />
            </Link>
            <h1 className="m-0 text-[1.15rem] font-bold tracking-[-0.03em] max-[720px]:text-base [@media(max-height:700px)]:text-base">
              {t('sudokuHelper.appName')}
            </h1>
          </div>
          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-[0.45rem]">
            <ExportImportButtons
              filename="sudoku-board.json"
              family="sudoku"
              onExport={onExportBoard}
              onImport={onImportBoard}
            />
            <LangSwitch />
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center justify-start gap-2.5 max-[720px]:hidden">
          <HotkeysBar />
        </div>
      </header>

      <MobileHelpCard
        sections={[
          {
            title: t('sudokuHelper.help.title'),
            body: (
              <>
                <p className="m-0 mb-1.5">{t('sudokuHelper.help.body')}</p>
                <p className="m-0">{t('sudokuHelper.help.solve')}</p>
              </>
            )
          }
        ]}
      />

      <div className="board-frame order-3 rounded-md bg-elevated/40 p-1 max-[980px]:order-1">
        <div className="board-stage">
          <Grid
            cells={cells}
            selected={selected}
            highlightDigit={digit}
            onSelect={onSelect}
          />
        </div>
      </div>

      <div className="game-sticky-controls relative z-5 order-1 w-full shrink-0 max-[980px]:order-2">
        <ControlsBar
          digit={digit}
          eraseMode={eraseMode}
          onDigitChange={onDigitChange}
          onEraseMode={onEraseMode}
          autoSolve={autoSolve}
          onAutoSolveChange={onAutoSolveChange}
          canUndo={canUndo}
          canRedo={canRedo}
          canNext={canNext}
          onUndo={onUndo}
          onRedo={onRedo}
          onSolve={onSolve}
          onNext={onNext}
          onClear={onClear}
        />
      </div>
    </div>
  )
}
