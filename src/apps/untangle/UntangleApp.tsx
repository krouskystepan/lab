import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Waypoints } from 'lucide-react'
import { Board } from './components/Board'
import { DiffBar } from './components/DiffBar'
import { HotkeysBar } from './components/HotkeysBar'
import { ToolsBar } from './components/ToolsBar'
import { landingOk, reduce } from './game/engine'
import { clampDots, generate, generateCount } from './game/generate'
import { problemCount, type Vec } from './game/geometry'
import { PlayHistory, snapshotOf } from './game/history'
import { findHint, type Hint } from './game/hint'
import { loadGame, saveGame } from './game/prefs'
import type { DiffId } from './game/types'
import { useI18n } from '../../i18n'
import { LangSwitch } from '../../shell/LangSwitch'
import { showToast } from '../../shared/toast'
import {
  ExportImportButtons,
  exportUntangleGame,
  importUntangleToGame,
  type BoardFile,
  type BoardImportResult
} from '../../shared/boardTransfer'
import { MobileHelpCard, boardStage, gameShell, gameStickyControls } from '../../shared/gameUi'

export default function UntangleApp() {
  const { t, locale } = useI18n()
  const initial = useRef(loadGame()).current
  const [board, dispatch] = useReducer(reduce, initial)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [hint, setHint] = useState<Hint | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const historyRef = useRef(new PlayHistory())
  const boardRef = useRef(board)
  boardRef.current = board
  const hintRef = useRef(hint)
  hintRef.current = hint
  const selectedRef = useRef(selected)
  selectedRef.current = selected
  const select = useCallback((index: number | null) => {
    selectedRef.current = index
    setSelected(index)
  }, [])
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

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveGame(board)
  }, [hydrated, board])

  useEffect(() => {
    document.title = `${t('untangle.appName')} · ${t('hub.brand')}`
  }, [t, locale])

  useEffect(() => {
    if (prevStatus.current !== board.status && board.status === 'won') {
      showToast(t('untangle.toast.won', { n: board.moves }), 'success')
      setHint(null)
    }
    prevStatus.current = board.status
  }, [board.status, board.moves, t])

  const onUndo = useCallback(() => {
    const prev = historyRef.current.undo(snapshotOf(boardRef.current))
    if (!prev) return
    setHint(null)
    dispatch({ type: 'restore', ...prev })
    syncHistoryFlags()
  }, [syncHistoryFlags])

  const onRedo = useCallback(() => {
    const next = historyRef.current.redo(snapshotOf(boardRef.current))
    if (!next) return
    setHint(null)
    dispatch({ type: 'restore', ...next })
    syncHistoryFlags()
  }, [syncHistoryFlags])

  const onMove = useCallback(
    (index: number, pos: Vec) => {
      const state = boardRef.current
      if (state.status === 'won') return
      if (!landingOk(state.pos, index, pos)) return
      pushHistory()
      setHint(null)
      dispatch({ type: 'move', index, pos })
    },
    [pushHistory]
  )

  const onHint = useCallback(() => {
    const state = boardRef.current
    if (state.status === 'won') return
    const next = findHint(state.edges, state.pos)
    if (!next) {
      setHint(null)
      showToast(t('untangle.hint.none'), 'warn')
      return
    }
    setHint(next)
    select(next.index)
  }, [select, t])

  const onReset = useCallback(() => {
    clearHistory()
    setHint(null)
    dispatch({ type: 'reset' })
  }, [clearHistory])

  const onNew = useCallback(() => {
    const state = boardRef.current
    clearHistory()
    setHint(null)
    select(null)
    dispatch({ type: 'newGame', puzzle: generateCount(state.n, state.puzzleId) })
  }, [clearHistory, select])

  const onDiff = useCallback(
    (id: DiffId) => {
      clearHistory()
      setHint(null)
      select(null)
      dispatch({ type: 'newGame', puzzle: generate(id, boardRef.current.puzzleId) })
    },
    [clearHistory, select]
  )

  const onCount = useCallback(
    (n: number) => {
      clearHistory()
      setHint(null)
      select(null)
      dispatch({ type: 'newGame', puzzle: generateCount(n, boardRef.current.puzzleId) })
    },
    [clearHistory, select]
  )

  const onExportBoard = useCallback(() => exportUntangleGame(boardRef.current), [])

  const onImportBoard = useCallback(
    (file: BoardFile): BoardImportResult => {
      if (file.family !== 'untangle') return { ok: false, reason: 'wrong_family' }
      try {
        const next = importUntangleToGame(file)
        clearHistory()
        setHint(null)
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
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
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
      const dir =
        e.key === 'ArrowUp' || e.key === 'ArrowRight'
          ? 1
          : e.key === 'ArrowDown' || e.key === 'ArrowLeft'
            ? -1
            : 0
      if (!dir) return
      e.preventDefault()
      const next = clampDots(boardRef.current.n + dir)
      if (next !== boardRef.current.n) onCount(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCount, onHint, onNew, onRedo, onReset, onUndo])

  const why = hint
    ? t(
        hint.kind === 'nudge'
          ? 'untangle.hint.nudge'
          : hint.kind === 'jump'
            ? 'untangle.hint.jump'
            : 'untangle.hint.escape',
        { label: String(hint.index + 1), k: String(hint.clearedCount) }
      )
    : null
  const crossings = problemCount(board.edges, board.pos)
  const ended = board.status === 'won'

  return (
    <div className={gameShell}>
      <header className="order-0 flex shrink-0 flex-col gap-1.5">
        <div className="flex min-h-8 w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
          <div className="flex shrink-0 items-center gap-[0.55rem]">
            <Link
              to="/"
              className="inline-flex h-[1.35rem] w-[1.35rem] items-center justify-center rounded-full bg-accent text-on-accent no-underline shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-accent)_35%,transparent),0_0_12px_color-mix(in_srgb,var(--color-accent)_40%,transparent)]"
              aria-label={t('hub.backHome')}
              title={t('hub.backHome')}
            >
              <Waypoints className="h-[0.85rem] w-[0.85rem]" strokeWidth={2.25} />
            </Link>
            <h1 className="m-0 text-[1.15rem] font-bold tracking-[-0.03em] max-[720px]:text-base [@media(max-height:700px)]:text-base">
              {t('untangle.appName')}
            </h1>
          </div>
          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-[0.45rem]">
            <ExportImportButtons
              filename="untangle.json"
              family="untangle"
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
            title: t('untangle.help.title'),
            body: (
              <>
                <p className="m-0 mb-1.5">{t('untangle.help.body')}</p>
                <p className="m-0">{t('untangle.help.controls')}</p>
              </>
            )
          },
          {
            title: t('untangle.tools.hintTipTitle'),
            body: <p className="m-0">{t('untangle.tools.hintTipBody')}</p>
          },
          {
            title: t('untangle.diff.helpTitle'),
            body: <p className="m-0">{t('untangle.diff.helpBody')}</p>
          }
        ]}
      />

      <div className="board-frame order-1 mx-auto min-h-0 w-[min(100%,var(--fit-h))]! flex-none [--board-pad:0.25rem] rounded-md border border-line bg-elevated max-[980px]:order-1 min-[981px]:w-[min(100%,calc(100dvh-11rem))]!">
        <div className={boardStage}>
          <Board
            edges={board.edges}
            pos={board.pos}
            hint={hint}
            selected={selected}
            ended={ended}
            onSelect={select}
            onMove={onMove}
          />
        </div>
      </div>

      <div className="relative z-5 order-2 flex w-full shrink-0 flex-col gap-[0.55rem] max-[980px]:order-2 min-[981px]:grid min-[981px]:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] min-[981px]:items-stretch">
        <div className={`${gameStickyControls} min-[981px]:h-full`}>
          <ToolsBar
            moves={board.moves}
            crossings={crossings}
            why={why}
            canUndo={canUndo}
            canRedo={canRedo}
            canHint={!ended}
            onUndo={onUndo}
            onRedo={onRedo}
            onHint={onHint}
            onReset={onReset}
            onNew={onNew}
          />
        </div>
        <div className="min-[981px]:h-full">
          <DiffBar count={board.n} onDiffChange={onDiff} onCount={onCount} />
        </div>
      </div>
    </div>
  )
}
