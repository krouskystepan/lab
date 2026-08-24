import { useCallback, useEffect, useRef, useReducer, useState } from 'react'
import { Link } from 'react-router-dom'
import { Car } from 'lucide-react'
import { Board, BuildingLot } from './components/Board'
import { DiffBar } from './components/DiffBar'
import { HotkeysBar } from './components/HotkeysBar'
import { ToolsBar } from './components/ToolsBar'
import { reduce } from './game/engine'
import { PlayHistory, snapshotOf } from './game/history'
import { loadGame, saveGame } from './game/prefs'
import { pickPuzzle } from './game/puzzles'
import { shortestSlide } from './game/solver'
import { isBoardSize, type DiffId, type Puzzle } from './game/types'
import { useI18n } from '../../i18n'
import { LangSwitch } from '../../shell/LangSwitch'
import { showToast } from '../../shared/toast'
import {
  ExportImportButtons,
  exportRushHourGame,
  importRushHourToGame,
  type BoardFile,
  type BoardImportResult
} from '../../shared/boardTransfer'
import { MobileHelpCard, boardStage, gameShell, gameStickyControls } from '../../shared/gameUi'

export default function RushHourApp() {
  const { t, locale } = useI18n()
  const initial = useRef(loadGame()).current
  const [board, dispatch] = useReducer(reduce, initial.board)
  const [selected, setSelected] = useState<string | null>(initial.selected)
  const [seconds, setSeconds] = useState(initial.seconds)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [hintId, setHintId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [building, setBuilding] = useState(false)
  const [pendingDiff, setPendingDiff] = useState<DiffId | null>(null)
  const [buildKey, setBuildKey] = useState(0)
  const pendingPuzzle = useRef<Puzzle | null>(null)
  const tickRef = useRef<number | null>(null)
  const hintTimer = useRef<number | null>(null)
  const historyRef = useRef(new PlayHistory())
  const boardRef = useRef(board)
  boardRef.current = board
  const selectedRef = useRef(selected)
  selectedRef.current = selected
  const secondsRef = useRef(seconds)
  secondsRef.current = seconds
  const prevStatus = useRef(board.status)

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
    if (tickRef.current != null) window.clearInterval(tickRef.current)
    tickRef.current = null
  }, [])

  const flashHint = useCallback((id: string) => {
    setHintId(id)
    if (hintTimer.current != null) window.clearTimeout(hintTimer.current)
    hintTimer.current = window.setTimeout(() => setHintId(null), 900)
  }, [])

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveGame(board, seconds, selected)
  }, [hydrated, board, seconds, selected])

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
    document.title = `${t('rushHour.appName')} · ${t('hub.brand')}`
  }, [t, locale])

  useEffect(() => {
    if (prevStatus.current !== board.status && board.status === 'won') {
      showToast(t('rushHour.toast.won', { n: board.moves }), 'success')
    }
    prevStatus.current = board.status
  }, [board.status, board.moves, t])

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

  const onSlide = useCallback(
    (id: string, row: number, col: number) => {
      const state = boardRef.current
      if (state.status === 'won') return
      const v = state.vehicles.find((x) => x.id === id)
      if (!v || (v.row === row && v.col === col)) return
      pushHistory()
      dispatch({ type: 'slide', id, row, col })
    },
    [pushHistory]
  )

  const onHint = useCallback(() => {
    const state = boardRef.current
    if (state.status === 'won') return
    const slide = shortestSlide(state.vehicles, {
      size: state.size,
      walls: state.walls
    })
    if (!slide) {
      showToast(t('rushHour.hint.none'), 'warn')
      return
    }
    pushHistory()
    setSelected(slide.id)
    flashHint(slide.id)
    dispatch({ type: 'slide', ...slide })
  }, [flashHint, pushHistory, t])

  const onReset = useCallback(() => {
    if (pendingPuzzle.current) return
    clearHistory()
    setSelected(null)
    dispatch({ type: 'reset' })
  }, [clearHistory])

  const queuePuzzle = useCallback((puzzle: Puzzle) => {
    pendingPuzzle.current = puzzle
    setPendingDiff(puzzle.diffId)
    setBuilding(true)
    setBuildKey((k) => k + 1)
  }, [])

  const onNew = useCallback(() => {
    const state = boardRef.current
    queuePuzzle(pickPuzzle(state.diffId, state.puzzleId))
  }, [queuePuzzle])

  const onDiff = useCallback(
    (id: DiffId) => {
      queuePuzzle(pickPuzzle(id, boardRef.current.puzzleId))
    },
    [queuePuzzle]
  )

  useEffect(() => {
    if (!building) return
    const puzzle = pendingPuzzle.current
    if (!puzzle) {
      setBuilding(false)
      return
    }
    const t = window.setTimeout(() => {
      clearHistory()
      setSelected(null)
      dispatch({ type: 'newGame', puzzle })
      pendingPuzzle.current = null
      setPendingDiff(null)
      setBuilding(false)
    }, 70)
    return () => window.clearTimeout(t)
  }, [building, buildKey, clearHistory])

  const onExportBoard = useCallback(
    () => exportRushHourGame(boardRef.current, secondsRef.current),
    []
  )

  const onImportBoard = useCallback(
    (file: BoardFile): BoardImportResult => {
      if (file.family !== 'rushhour') return { ok: false, reason: 'wrong_family' }
      try {
        const { board: next, seconds: s } = importRushHourToGame(file)
        clearHistory()
        setSeconds(s)
        setSelected(null)
        dispatch({ type: 'importBoard', board: next })
        return { ok: true }
      } catch {
        return { ok: false, reason: 'invalid' }
      }
    },
    [clearHistory]
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
      if (mod) return
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault()
        onHint()
        return
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        onNew()
        return
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        onReset()
        return
      }
      const id = selectedRef.current
      if (!id) return
      let dr = 0
      let dc = 0
      if (e.key === 'ArrowLeft') dc = -1
      else if (e.key === 'ArrowRight') dc = 1
      else if (e.key === 'ArrowUp') dr = -1
      else if (e.key === 'ArrowDown') dr = 1
      else return
      e.preventDefault()
      const v = boardRef.current.vehicles.find((x) => x.id === id)
      if (!v) return
      onSlide(id, v.row + dr, v.col + dc)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onHint, onNew, onRedo, onReset, onSlide, onUndo])

  const ended = board.status === 'won'
  const canHint = !ended && !building

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
              <Car className="h-[0.85rem] w-[0.85rem]" strokeWidth={2.25} />
            </Link>
            <h1 className="m-0 text-[1.15rem] font-bold tracking-[-0.03em] max-[720px]:text-base [@media(max-height:700px)]:text-base">
              {t('rushHour.appName')}
            </h1>
          </div>
          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-[0.45rem]">
            <ExportImportButtons
              filename="rush-hour.json"
              family="rushhour"
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
            title: t('rushHour.help.title'),
            body: (
              <>
                <p className="m-0 mb-1.5">{t('rushHour.help.body')}</p>
                <p className="m-0">{t('rushHour.help.controls')}</p>
              </>
            )
          },
          {
            title: t('rushHour.tools.hintTipTitle'),
            body: <p className="m-0">{t('rushHour.tools.hintTipBody')}</p>
          },
          {
            title: t('rushHour.diff.helpTitle'),
            body: <p className="m-0">{t('rushHour.diff.helpBody')}</p>
          }
        ]}
      />

      <div
        className="board-frame order-1 min-h-0 flex-1 [--board-pad:0.25rem] rounded-md bg-elevated/40 max-[980px]:order-1"
        aria-busy={building}
      >
        <div className={boardStage}>
          {building ? (
            <BuildingLot size={buildingSize(pendingPuzzle.current, board.size)} />
          ) : (
            <Board
              vehicles={board.vehicles}
              size={board.size}
              walls={board.walls}
              selected={selected}
              hintId={hintId}
              ended={ended}
              onSelect={setSelected}
              onSlide={onSlide}
            />
          )}
        </div>
      </div>

      <div className="relative z-5 order-2 flex w-full shrink-0 flex-col gap-[0.55rem] max-[980px]:order-2 min-[981px]:grid min-[981px]:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] min-[981px]:items-stretch">
        <div className={`${gameStickyControls} min-[981px]:h-full`}>
          <ToolsBar
            seconds={seconds}
            moves={board.moves}
            minMoves={board.minMoves}
            canUndo={canUndo}
            canRedo={canRedo}
            canHint={canHint}
            onUndo={onUndo}
            onRedo={onRedo}
            onHint={onHint}
            onReset={onReset}
            onNew={onNew}
          />
        </div>
        <div className="min-[981px]:h-full">
          <DiffBar
            diffId={pendingDiff ?? board.diffId}
            busy={building}
            onDiffChange={onDiff}
          />
        </div>
      </div>
    </div>
  )
}

function buildingSize(puzzle: Puzzle | null, fallback: number): number {
  if (!puzzle) return fallback
  const n = Math.sqrt(puzzle.grid.replace(/\s+/g, '').length)
  return isBoardSize(n) ? n : fallback
}
