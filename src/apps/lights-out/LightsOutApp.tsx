import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lightbulb } from 'lucide-react'
import { DiffBar } from './components/DiffBar'
import { Grid } from './components/Grid'
import { HotkeysBar } from './components/HotkeysBar'
import { ToolsBar } from './components/ToolsBar'
import { reduce } from './game/engine'
import { generate } from './game/generate'
import { PlayHistory, snapshotOf } from './game/history'
import { loadGame, saveGame } from './game/prefs'
import { hintIndex } from './game/solve'
import type { DiffId } from './game/types'
import { useI18n } from '../../i18n'
import { LangSwitch } from '../../shell/LangSwitch'
import { showToast } from '../../shared/toast'
import {
  ExportImportButtons,
  exportLightsOutGame,
  importLightsOutToGame,
  type BoardFile,
  type BoardImportResult
} from '../../shared/boardTransfer'
import { MobileHelpCard, boardStage, gameShell, gameStickyControls } from '../../shared/gameUi'

export default function LightsOutApp() {
  const { t, locale } = useI18n()
  const initial = useRef(loadGame()).current
  const [board, dispatch] = useReducer(reduce, initial.board)
  const [seconds, setSeconds] = useState(initial.seconds)
  const [selected, setSelected] = useState<number | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [hintAt, setHintAt] = useState<number | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const tickRef = useRef<number | null>(null)
  const hintTimer = useRef<number | null>(null)
  const historyRef = useRef(new PlayHistory())
  const boardRef = useRef(board)
  boardRef.current = board
  const secondsRef = useRef(seconds)
  secondsRef.current = seconds
  const selectedRef = useRef(selected)
  selectedRef.current = selected
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

  const flashHint = useCallback((index: number) => {
    setHintAt(index)
    if (hintTimer.current != null) window.clearTimeout(hintTimer.current)
    hintTimer.current = window.setTimeout(() => setHintAt(null), 900)
  }, [])

  useEffect(() => {
    setHydrated(true)
  }, [])

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
    document.title = `${t('lightsOut.appName')} · ${t('hub.brand')}`
  }, [t, locale])

  useEffect(() => {
    if (prevStatus.current !== board.status && board.status === 'won') {
      showToast(t('lightsOut.toast.won', { n: board.moves }), 'success')
    }
    prevStatus.current = board.status
  }, [board.status, board.moves, t])

  useEffect(() => {
    const max = board.size * board.size
    if (selected != null && selected >= max) setSelected(null)
  }, [board.size, selected])

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

  const onPress = useCallback(
    (index: number) => {
      if (boardRef.current.status === 'won') return
      pushHistory()
      setSelected(null)
      dispatch({ type: 'press', index })
    },
    [pushHistory]
  )

  const onHint = useCallback(() => {
    const state = boardRef.current
    if (state.status === 'won') return
    const index = hintIndex(state.lights, state.size)
    if (index == null) {
      showToast(t('lightsOut.hint.none'), 'warn')
      return
    }
    pushHistory()
    setSelected(null)
    flashHint(index)
    dispatch({ type: 'press', index })
  }, [flashHint, pushHistory, t])

  const onReset = useCallback(() => {
    clearHistory()
    dispatch({ type: 'reset' })
  }, [clearHistory])

  const onNew = useCallback(() => {
    const state = boardRef.current
    clearHistory()
    setSelected(null)
    dispatch({ type: 'newGame', puzzle: generate(state.diffId, state.puzzleId) })
  }, [clearHistory])

  const onDiff = useCallback(
    (id: DiffId) => {
      clearHistory()
      setSelected(null)
      dispatch({ type: 'newGame', puzzle: generate(id, boardRef.current.puzzleId) })
    },
    [clearHistory]
  )

  const onExportBoard = useCallback(
    () => exportLightsOutGame(boardRef.current, secondsRef.current),
    []
  )

  const onImportBoard = useCallback(
    (file: BoardFile): BoardImportResult => {
      if (file.family !== 'lightsout') return { ok: false, reason: 'wrong_family' }
      try {
        const { board: next, seconds: s } = importLightsOutToGame(file)
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
      const size = boardRef.current.size
      const max = size * size
      let next = selectedRef.current
      if (e.key === 'ArrowLeft') next = (next ?? 0) - 1
      else if (e.key === 'ArrowRight') next = (next ?? -1) + 1
      else if (e.key === 'ArrowUp') next = (next ?? 0) - size
      else if (e.key === 'ArrowDown') next = (next ?? -size) + size
      else if (e.key === 'Enter' || e.key === ' ') {
        if (
          e.target instanceof HTMLButtonElement &&
          !e.target.id.startsWith('lo-cell-')
        ) {
          return
        }
        if (selectedRef.current == null) return
        e.preventDefault()
        onPress(selectedRef.current)
        return
      } else return
      e.preventDefault()
      if (next < 0) next += max
      if (next >= max) next -= max
      setSelected(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onHint, onNew, onPress, onRedo, onReset, onUndo])

  const ended = board.status === 'won'
  const canHint = !ended

  return (
    <div className={gameShell}>
      <header className="order-0 flex shrink-0 flex-col gap-1.5">
        <div className="flex min-h-8 w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
          <div className="flex shrink-0 items-center gap-[0.55rem]">
            <Link
              to="/"
              className="inline-flex h-[1.35rem] w-[1.35rem] items-center justify-center rounded-full bg-accent text-[#1a1808] no-underline shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-accent)_35%,transparent),0_0_12px_color-mix(in_srgb,var(--color-accent)_40%,transparent)]"
              aria-label={t('hub.backHome')}
              title={t('hub.backHome')}
            >
              <Lightbulb className="h-[0.85rem] w-[0.85rem]" strokeWidth={2.25} />
            </Link>
            <h1 className="m-0 text-[1.15rem] font-bold tracking-[-0.03em] max-[720px]:text-base [@media(max-height:700px)]:text-base">
              {t('lightsOut.appName')}
            </h1>
          </div>
          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-[0.45rem]">
            <ExportImportButtons
              filename="lights-out.json"
              family="lightsout"
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
            title: t('lightsOut.help.title'),
            body: (
              <>
                <p className="m-0 mb-1.5">{t('lightsOut.help.body')}</p>
                <p className="m-0">{t('lightsOut.help.controls')}</p>
              </>
            )
          },
          {
            title: t('lightsOut.tools.hintTipTitle'),
            body: <p className="m-0">{t('lightsOut.tools.hintTipBody')}</p>
          },
          {
            title: t('lightsOut.diff.helpTitle'),
            body: <p className="m-0">{t('lightsOut.diff.helpBody')}</p>
          }
        ]}
      />

      <div className="board-frame order-1 min-h-0 flex-1 [--board-pad:0.25rem] rounded-md border border-line bg-elevated max-[980px]:order-1">
        <div className={boardStage}>
          <Grid
            size={board.size}
            lights={board.lights}
            status={board.status}
            selected={selected}
            hintIndex={hintAt}
            onPress={onPress}
          />
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
          <DiffBar diffId={board.diffId} onDiffChange={onDiff} />
        </div>
      </div>
    </div>
  )
}
