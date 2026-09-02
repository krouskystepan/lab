import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState
} from 'react'
import { Link } from 'react-router-dom'
import { Grid3x3 } from 'lucide-react'
import { DiffBar } from './components/DiffBar'
import { Grid } from './components/Grid'
import { HotkeysBar } from './components/HotkeysBar'
import { NumberPad } from './components/NumberPad'
import { ToolsBar } from './components/ToolsBar'
import { CELL_COUNT, colOf, rowOf } from './game/board'
import { boardHasNotes, reduce, remainingEmpty } from './game/engine'
import { findHint, findMistakes, filledCount } from './game/hint'
import { PlayHistory, snapshotOf } from './game/history'
import { loadGame, saveGame } from './game/prefs'
import type { DiffId, PointerMode } from './game/types'
import { useI18n } from '../../i18n'
import { LangSwitch } from '../../shell/LangSwitch'
import { showToast } from '../../shared/toast'
import {
  ExportImportButtons,
  exportSudokuGame,
  importSudokuToGame,
  type BoardFile,
  type BoardImportResult
} from '../../shared/boardTransfer'
import {
  MobileHelpCard,
  boardStage,
  gameShell,
  gameStickyControls
} from '../../shared/gameUi'

export default function SudokuApp() {
  const { t, locale } = useI18n()
  const initial = useRef(loadGame()).current
  const [board, dispatch] = useReducer(reduce, initial.board)
  const [mode, setMode] = useState<PointerMode>(initial.mode)
  const [digit, setDigit] = useState(initial.digit)
  const [eraseMode, setEraseMode] = useState(initial.eraseMode)
  const [selected, setSelected] = useState<number | null>(initial.selected)
  const [seconds, setSeconds] = useState(initial.seconds)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [mistakes, setMistakes] = useState<ReadonlySet<number>>(() => new Set())
  const [hydrated, setHydrated] = useState(false)
  const tickRef = useRef<number | null>(null)
  const historyRef = useRef(new PlayHistory())
  const boardRef = useRef(board)
  boardRef.current = board
  const selectedRef = useRef(selected)
  selectedRef.current = selected
  const modeRef = useRef(mode)
  modeRef.current = mode
  const digitRef = useRef(digit)
  digitRef.current = digit
  const eraseModeRef = useRef(eraseMode)
  eraseModeRef.current = eraseMode
  const secondsRef = useRef(seconds)
  secondsRef.current = seconds

  const syncHistoryFlags = useCallback(() => {
    setCanUndo(historyRef.current.canUndo)
    setCanRedo(historyRef.current.canRedo)
  }, [])

  const clearHistory = useCallback(() => {
    historyRef.current.clear()
    syncHistoryFlags()
  }, [syncHistoryFlags])

  const pushHistory = useCallback(() => {
    historyRef.current.push(snapshotOf(boardRef.current))
    syncHistoryFlags()
  }, [syncHistoryFlags])

  const stopTimer = useCallback(() => {
    if (tickRef.current != null) {
      window.clearInterval(tickRef.current)
    }
    tickRef.current = null
  }, [])

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveGame(board, seconds, selected, digit, eraseMode, mode)
  }, [hydrated, board, seconds, selected, digit, eraseMode, mode])

  useEffect(() => {
    if (board.status === 'playing') {
      if (tickRef.current == null) {
        tickRef.current = window.setInterval(() => {
          setSeconds((s) => s + 1)
        }, 1000)
      }
    } else if (board.status === 'ready') {
      stopTimer()
      setSeconds(0)
    } else {
      stopTimer()
    }
    return stopTimer
  }, [board.status, stopTimer])

  useEffect(() => {
    document.title = `${t('sudoku.appName')} · ${t('hub.brand')}`
  }, [t, locale])

  const remainingByDigit = useMemo(() => {
    const counts = Array.from({ length: 10 }, () => 0)
    for (const c of board.cells) {
      if (c.value >= 1 && c.value <= 9) counts[c.value]++
    }
    const left = Array.from({ length: 10 }, () => 0)
    for (let d = 1; d <= 9; d++) left[d] = 9 - counts[d]
    return left
  }, [board.cells])

  const onUndo = useCallback(() => {
    const prev = historyRef.current.undo(snapshotOf(boardRef.current))
    if (!prev) return
    dispatch({ type: 'restore', ...prev })
    syncHistoryFlags()
  }, [syncHistoryFlags])

  const onRedo = useCallback(() => {
    const next = historyRef.current.redo(snapshotOf(boardRef.current))
    if (!next) return
    dispatch({ type: 'restore', ...next })
    syncHistoryFlags()
  }, [syncHistoryFlags])

  const eraseAt = useCallback(
    (index: number) => {
      const before = boardRef.current
      if (before.status === 'won') return
      const cell = before.cells[index]
      if (!cell || cell.given) return
      if (cell.value === 0 && cell.notes === 0) return
      pushHistory()
      dispatch({ type: 'erase', index })
    },
    [pushHistory]
  )

  const onSelect = useCallback(
    (index: number) => {
      setSelected(index)
      const before = boardRef.current
      if (before.status === 'won') return
      const cell = before.cells[index]
      if (!cell || cell.given) return

      if (eraseModeRef.current) {
        eraseAt(index)
        return
      }

      const d = digitRef.current
      if (d == null) return
      const m = modeRef.current
      // Digit paint: fill / overwrite; skip if already that digit
      if (m === 'digit' && cell.value === d) return
      // Digit paint: overwrite other values; Notes: only empty cells
      if (m === 'notes' && cell.value !== 0) return
      pushHistory()
      dispatch({ type: 'applyDigit', index, digit: d, mode: m })
    },
    [eraseAt, pushHistory]
  )

  /** Pad: select digit paint tool only - never auto-fills the selected cell. */
  const onDigitChange = useCallback((d: number) => {
    setEraseMode(false)
    if (digitRef.current === d && !eraseModeRef.current) {
      setDigit(null)
      return
    }
    setDigit(d)
  }, [])

  /** Pad Erase: toggle erase paint mode - then click cells to clear many. */
  const onEraseMode = useCallback(() => {
    setEraseMode((on) => {
      const next = !on
      if (next) setDigit(null)
      return next
    })
  }, [])

  const onHint = useCallback(() => {
    const hint = findHint(boardRef.current)
    if (!hint) return
    pushHistory()
    setMistakes(new Set())
    setSelected(hint.index)
    setEraseMode(false)
    setMode('digit')
    setDigit(hint.digit)
    dispatch({
      type: 'applyDigit',
      index: hint.index,
      digit: hint.digit,
      mode: 'digit'
    })
  }, [pushHistory])

  const onCheck = useCallback(() => {
    const state = boardRef.current
    if (state.status === 'won') return
    if (filledCount(state) === 0) {
      setMistakes(new Set())
      showToast(t('sudoku.check.empty'), 'info')
      return
    }
    const wrong = findMistakes(state)
    setMistakes(new Set(wrong))
    if (wrong.length === 0) {
      showToast(t('sudoku.check.ok'), 'info')
      return
    }
    if (wrong.length === 1) {
      showToast(t('sudoku.check.mistakes1'), 'warn')
      setSelected(wrong[0])
      return
    }
    showToast(t('sudoku.check.mistakes', { n: wrong.length }), 'warn')
    setSelected(wrong[0])
  }, [t])

  const onNew = useCallback(() => {
    clearHistory()
    setSelected(null)
    setMistakes(new Set())
    setEraseMode(false)
    dispatch({ type: 'newGame' })
  }, [clearHistory])

  const onExportBoard = useCallback(
    () => exportSudokuGame(boardRef.current, secondsRef.current),
    []
  )

  const onImportBoard = useCallback(
    (file: BoardFile): BoardImportResult => {
      if (file.family !== 'sudoku') {
        return { ok: false, reason: 'wrong_family' }
      }
      try {
        const { board: next, seconds: s } = importSudokuToGame(
          file,
          boardRef.current.diffId
        )
        clearHistory()
        setSelected(null)
        setMistakes(new Set())
        setEraseMode(false)
        setSeconds(s)
        dispatch({ type: 'importBoard', board: next })
        return { ok: true }
      } catch {
        return { ok: false, reason: 'invalid' }
      }
    },
    [clearHistory]
  )

  const onDiff = useCallback(
    (id: DiffId) => {
      clearHistory()
      setSelected(null)
      setMistakes(new Set())
      setEraseMode(false)
      dispatch({ type: 'setDiff', id })
    },
    [clearHistory]
  )

  const onClearNotes = useCallback(() => {
    if (!boardHasNotes(boardRef.current)) return
    pushHistory()
    dispatch({ type: 'clearNotes' })
  }, [pushHistory])

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

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        onNew()
        return
      }
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault()
        onHint()
        return
      }
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault()
        onCheck()
        return
      }
      if (e.key === 'p' || e.key === 'P' || e.key === ' ') {
        e.preventDefault()
        setMode((m) => (m === 'notes' ? 'digit' : 'notes'))
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
  }, [onCheck, onEraseMode, onHint, onNew, onRedo, onUndo])

  // Drop check highlights when the board changes.
  useEffect(() => {
    setMistakes(new Set())
  }, [board])

  const hintAvailable = findHint(board) != null
  const checkAvailable = board.status !== 'won'

  return (
    <div className={gameShell}>
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
              {t('sudoku.appName')}
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
            title: t('sudoku.help.title'),
            body: (
              <>
                <p className="m-0 mb-1.5">{t('sudoku.help.body')}</p>
                <p className="m-0 mb-1.5">{t('sudoku.help.controls')}</p>
                <p className="m-0">{t('sudoku.help.notes')}</p>
              </>
            )
          },
          {
            title: t('sudoku.diff.helpTitle'),
            body: <p className="m-0">{t('sudoku.diff.helpBody')}</p>
          }
        ]}
      />

      <div className="board-frame order-3 [--board-pad:0.25rem] rounded-md bg-elevated/40 max-[980px]:order-1">
        <div className={boardStage}>
          <Grid
            board={board}
            selected={selected}
            highlightDigit={digit}
            mistakes={mistakes}
            onSelect={onSelect}
          />
        </div>
      </div>

      {/* Diff | Tools - same titled GamePanel grid as Mine Helper Size|Tools */}
      <div className="game-secondary relative z-5 order-1 flex w-full shrink-0 flex-col gap-[0.55rem] max-[980px]:order-3 min-[981px]:grid min-[981px]:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] min-[981px]:items-stretch">
        <div className="min-[981px]:h-full">
          <DiffBar diffId={board.diffId} onDiffChange={onDiff} />
        </div>
        <div className="min-[981px]:h-full">
          <ToolsBar
            mode={mode}
            emptyLeft={remainingEmpty(board)}
            seconds={seconds}
            status={board.status}
            canUndo={canUndo}
            canRedo={canRedo}
            canHint={hintAvailable}
            canCheck={checkAvailable}
            hasNotes={boardHasNotes(board)}
            onModeChange={setMode}
            onUndo={onUndo}
            onRedo={onRedo}
            onHint={onHint}
            onCheck={onCheck}
            onClearNotes={onClearNotes}
            onNew={onNew}
          />
        </div>
      </div>

      <div
        className={`${gameStickyControls} relative z-5 order-2 w-full shrink-0 max-[980px]:order-2`}
      >
        <NumberPad
          digit={digit}
          eraseMode={eraseMode}
          remaining={remainingByDigit}
          onDigitChange={onDigitChange}
          onEraseMode={onEraseMode}
        />
      </div>
    </div>
  )
}
