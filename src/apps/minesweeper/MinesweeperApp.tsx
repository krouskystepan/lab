import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bomb } from 'lucide-react'
import { DiffBar } from './components/DiffBar'
import { Grid } from './components/Grid'
import { HotkeysBar } from './components/HotkeysBar'
import { SizeBar } from './components/SizeBar'
import { ToolsBar } from './components/ToolsBar'
import { minesRemaining, reduce } from './game/engine'
import { findHint } from './game/hint'
import { PlayHistory, snapshotOf } from './game/history'
import { loadGame, saveGame } from './game/prefs'
import type { DiffId, PointerMode } from './game/types'
import { useI18n } from '../../i18n'

export default function MinesweeperApp() {
  const { t, locale, setLocale } = useI18n()
  const initial = useRef(loadGame()).current
  const [board, dispatch] = useReducer(reduce, initial.board)
  const [mode, setMode] = useState<PointerMode>('dig')
  const [seconds, setSeconds] = useState(initial.seconds)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const tickRef = useRef<number | null>(null)
  const historyRef = useRef(new PlayHistory())
  const boardRef = useRef(board)
  boardRef.current = board
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

  // Persist the single in-progress game
  useEffect(() => {
    if (!hydrated) return
    saveGame(board, seconds)
  }, [hydrated, board, seconds])

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
    document.title = `${t('minesweeper.appName')} · ${t('hub.brand')}`
  }, [t, locale])

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
        clearHistory()
        dispatch({ type: 'newGame' })
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        setMode('dig')
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        setMode('flag')
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault()
        const hint = findHint(boardRef.current)
        if (!hint) return
        pushHistory()
        if (hint.kind === 'flag')
          dispatch({ type: 'toggleFlag', index: hint.index })
        else dispatch({ type: 'reveal', index: hint.index })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clearHistory, onRedo, onUndo, pushHistory])

  const onDiff = useCallback(
    (id: DiffId) => {
      clearHistory()
      dispatch({ type: 'setDiff', id })
    },
    [clearHistory]
  )

  const onClassic = useCallback(
    (id: DiffId) => {
      clearHistory()
      dispatch({ type: 'applyClassic', id })
    },
    [clearHistory]
  )

  const onSize = useCallback(
    (width: number, height: number) => {
      clearHistory()
      dispatch({ type: 'setSize', width, height })
    },
    [clearHistory]
  )

  const onMines = useCallback(
    (mines: number) => {
      clearHistory()
      dispatch({ type: 'setMines', mines })
    },
    [clearHistory]
  )

  const onNew = useCallback(() => {
    clearHistory()
    dispatch({ type: 'newGame' })
  }, [clearHistory])

  const onReveal = useCallback(
    (index: number) => {
      const before = boardRef.current
      const cell = before.cells[index]
      if (
        before.status === 'won' ||
        before.status === 'lost' ||
        !cell ||
        cell.view === 'flagged' ||
        cell.view === 'revealed'
      ) {
        return
      }
      pushHistory()
      dispatch({ type: 'reveal', index })
    },
    [pushHistory]
  )

  const onFlag = useCallback(
    (index: number) => {
      const before = boardRef.current
      const cell = before.cells[index]
      if (
        before.status === 'won' ||
        before.status === 'lost' ||
        !cell ||
        cell.view === 'revealed'
      ) {
        return
      }
      pushHistory()
      dispatch({ type: 'toggleFlag', index })
    },
    [pushHistory]
  )

  const onChord = useCallback(
    (index: number) => {
      const before = boardRef.current
      if (before.status === 'won' || before.status === 'lost') return
      const next = reduce(before, { type: 'chord', index })
      if (next === before) return
      pushHistory()
      dispatch({ type: 'chord', index })
    },
    [pushHistory]
  )

  const onHint = useCallback(() => {
    const hint = findHint(boardRef.current)
    if (!hint) return
    pushHistory()
    if (hint.kind === 'flag') dispatch({ type: 'toggleFlag', index: hint.index })
    else dispatch({ type: 'reveal', index: hint.index })
  }, [pushHistory])

  const onClearFlags = useCallback(() => {
    if (boardRef.current.flagCount === 0) return
    pushHistory()
    dispatch({ type: 'clearFlags' })
  }, [pushHistory])

  const hintAvailable = findHint(board) != null

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-275 flex-col gap-[0.55rem] overflow-hidden px-[0.85rem] pt-[0.65rem] pb-3 max-[720px]:gap-[0.35rem] max-[720px]:px-[0.45rem] max-[720px]:pt-1.5 max-[720px]:pb-[0.45rem]">
      <header className="order-0 flex shrink-0 flex-col gap-1.5">
        <div className="flex min-h-8 w-full flex-wrap items-center justify-between gap-2.5 max-[720px]:gap-[0.35rem]">
          <div className="flex shrink-0 items-center gap-[0.55rem]">
            <Link
              to="/"
              className="inline-flex h-[1.35rem] w-[1.35rem] items-center justify-center rounded-full bg-accent text-ink no-underline shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-accent)_35%,transparent),0_0_12px_color-mix(in_srgb,var(--color-accent)_40%,transparent)]"
              aria-label={t('hub.backHome')}
              title={t('hub.backHome')}
            >
              <Bomb className="h-[0.85rem] w-[0.85rem]" strokeWidth={2.25} />
            </Link>
            <h1 className="m-0 text-[1.15rem] font-bold tracking-[-0.03em] max-[720px]:text-base [@media(max-height:700px)]:text-base">
              {t('minesweeper.appName')}
            </h1>
          </div>
          <div
            className="inline-flex shrink-0 overflow-hidden rounded-sm border border-line bg-cell"
            role="group"
            aria-label={t('lang.switch')}
          >
            <button
              type="button"
              className={`cursor-pointer appearance-none rounded-none border-0 px-[0.45rem] py-[0.28rem] text-[0.68rem] font-bold tracking-[0.04em] ${
                locale === 'en'
                  ? 'bg-accent/30 text-on-accent'
                  : 'bg-transparent text-muted hover:bg-cell-hover hover:text-ink'
              }`}
              aria-pressed={locale === 'en'}
              onClick={() => setLocale('en')}
            >
              {t('lang.en')}
            </button>
            <button
              type="button"
              className={`cursor-pointer appearance-none rounded-none border-0 px-[0.45rem] py-[0.28rem] text-[0.68rem] font-bold tracking-[0.04em] ${
                locale === 'cs'
                  ? 'bg-accent/30 text-on-accent'
                  : 'bg-transparent text-muted hover:bg-cell-hover hover:text-ink'
              }`}
              aria-pressed={locale === 'cs'}
              onClick={() => setLocale('cs')}
            >
              {t('lang.cs')}
            </button>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center justify-start gap-2.5 max-[720px]:hidden">
          <HotkeysBar />
        </div>
      </header>

      <div className="board-frame order-3 rounded-md border border-line bg-elevated p-[0.15rem] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)] max-[720px]:order-1 max-[720px]:min-h-[42dvh] max-[720px]:flex-[1_1_auto]">
        <div className="board-stage">
          <Grid
            width={board.width}
            height={board.height}
            cells={board.cells}
            status={board.status}
            hitIndex={board.hitIndex}
            mode={mode}
            onReveal={onReveal}
            onFlag={onFlag}
            onChord={onChord}
          />
        </div>
      </div>

      <div className="relative z-5 order-1 grid shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] gap-[0.55rem] max-[720px]:order-2 max-[720px]:grid-cols-1">
        <SizeBar
          width={board.width}
          height={board.height}
          mines={board.mines}
          onSizeChange={onSize}
          onMinesChange={onMines}
          onClassic={onClassic}
        />
        <ToolsBar
          mode={mode}
          minesLeft={minesRemaining(board)}
          seconds={seconds}
          status={board.status}
          canUndo={canUndo}
          canRedo={canRedo}
          canHint={hintAvailable}
          hasFlags={board.flagCount > 0}
          onModeChange={setMode}
          onUndo={onUndo}
          onRedo={onRedo}
          onHint={onHint}
          onClearFlags={onClearFlags}
          onNew={onNew}
        />
      </div>

      <div className="relative z-5 order-2 flex w-full shrink-0 flex-wrap items-stretch gap-[0.55rem] max-[720px]:order-3">
        <DiffBar
          width={board.width}
          height={board.height}
          mines={board.mines}
          diffId={board.diffId}
          onDiffChange={onDiff}
        />
      </div>
    </div>
  )
}
