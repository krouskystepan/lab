import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Keyboard as KeyboardIcon } from 'lucide-react'
import { DiffBar } from './components/DiffBar'
import { Grid } from './components/Grid'
import { HotkeysBar } from './components/HotkeysBar'
import { Keyboard } from './components/Keyboard'
import { LenBar } from './components/LenBar'
import { ToolsBar } from './components/ToolsBar'
import { reduce } from './game/engine'
import { findHint } from './game/hint'
import { PlayHistory, snapshotOf } from './game/history'
import { loadGame, saveGame } from './game/prefs'
import { hardModeViolation } from './game/score'
import type { DiffId } from './game/types'
import { isAllowedWord, type WordLen } from './game/words'
import { useI18n } from '../../i18n'
import { LangSwitch } from '../../shell/LangSwitch'
import { showToast } from '../../shared/toast'
import {
  ExportImportButtons,
  exportWordleGame,
  importWordleToGame,
  type BoardFile,
  type BoardImportResult
} from '../../shared/boardTransfer'
import { MobileHelpCard, boardStage, gameShell, gameStickyControls } from '../../shared/gameUi'

export default function WordleApp() {
  const { t, locale } = useI18n()
  const initial = useRef(loadGame()).current
  const [board, dispatch] = useReducer(reduce, initial.board)
  const [seconds, setSeconds] = useState(initial.seconds)
  const [, setCanUndo] = useState(false)
  const [, setCanRedo] = useState(false)
  const [shake, setShake] = useState(false)
  const [flashKey, setFlashKey] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const tickRef = useRef<number | null>(null)
  const historyRef = useRef(new PlayHistory())
  const boardRef = useRef(board)
  boardRef.current = board
  const secondsRef = useRef(seconds)
  secondsRef.current = seconds
  const shakeTimer = useRef<number | null>(null)
  const flashTimer = useRef<number | null>(null)
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
    if (tickRef.current != null) {
      window.clearInterval(tickRef.current)
    }
    tickRef.current = null
  }, [])

  const bumpShake = useCallback(() => {
    setShake(false)
    window.requestAnimationFrame(() => {
      setShake(true)
      if (shakeTimer.current != null) window.clearTimeout(shakeTimer.current)
      shakeTimer.current = window.setTimeout(() => setShake(false), 420)
    })
  }, [])

  const bumpKey = useCallback((key: string) => {
    const k = key.length === 1 ? key.toLowerCase() : key
    setFlashKey(null)
    window.requestAnimationFrame(() => {
      setFlashKey(k)
      if (flashTimer.current != null) window.clearTimeout(flashTimer.current)
      flashTimer.current = window.setTimeout(() => setFlashKey(null), 170)
    })
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
    document.title = `${t('wordle.appName')} · ${t('hub.brand')}`
  }, [t, locale])

  useEffect(() => {
    if (prevStatus.current !== board.status) {
      if (board.status === 'won') {
        showToast(t('wordle.toast.won', { n: board.guesses.length }), 'info')
      } else if (board.status === 'lost') {
        showToast(
          t('wordle.toast.lost', { word: board.answer.toUpperCase() }),
          'warn'
        )
      }
    }
    prevStatus.current = board.status
  }, [board.status, board.guesses.length, board.answer, t])

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

  const onLetter = useCallback(
    (letter: string) => {
      const state = boardRef.current
      if (state.status === 'won' || state.status === 'lost') return
      bumpKey(letter)
      dispatch({ type: 'typeLetter', letter })
    },
    [bumpKey]
  )

  const onBackspace = useCallback(() => {
    bumpKey('Backspace')
    dispatch({ type: 'backspace' })
  }, [bumpKey])

  const onSubmit = useCallback(() => {
    const state = boardRef.current
    if (state.status === 'won' || state.status === 'lost') return
    bumpKey('Enter')
    if (state.current.length < state.wordLen) {
      bumpShake()
      showToast(t('wordle.short', { n: state.wordLen }), 'warn')
      return
    }
    if (!isAllowedWord(state.current, state.answer)) {
      bumpShake()
      showToast(t('wordle.invalid'), 'warn')
      return
    }
    if (state.hardMode) {
      const v = hardModeViolation(state.current, state.guesses)
      if (v) {
        bumpShake()
        if (v.kind === 'green') {
          showToast(
            t('wordle.hard.green', {
              letter: v.letter.toUpperCase(),
              n: v.n
            }),
            'warn'
          )
        } else {
          showToast(
            t('wordle.hard.yellow', { letter: v.letter.toUpperCase() }),
            'warn'
          )
        }
        return
      }
    }
    pushHistory()
    dispatch({ type: 'submit' })
  }, [bumpKey, bumpShake, pushHistory, t])

  const onHint = useCallback(() => {
    const hint = findHint(boardRef.current)
    if (!hint) return
    pushHistory()
    dispatch({ type: 'hint', index: hint.index })
    showToast(
      t('wordle.hint.letter', {
        letter: hint.letter.toUpperCase(),
        n: hint.index + 1
      }),
      'info'
    )
  }, [pushHistory, t])

  const onNew = useCallback(() => {
    clearHistory()
    dispatch({ type: 'newGame' })
  }, [clearHistory])

  const onExportBoard = useCallback(
    () => exportWordleGame(boardRef.current, secondsRef.current),
    []
  )

  const onImportBoard = useCallback(
    (file: BoardFile): BoardImportResult => {
      if (file.family !== 'wordle') {
        return { ok: false, reason: 'wrong_family' }
      }
      try {
        const { board: next, seconds: s } = importWordleToGame(
          file,
          boardRef.current.diffId
        )
        clearHistory()
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
      dispatch({ type: 'setDiff', id })
    },
    [clearHistory]
  )

  const onWordLen = useCallback(
    (wordLen: WordLen) => {
      clearHistory()
      dispatch({ type: 'setWordLen', wordLen })
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

      if (e.key === 'Enter') {
        e.preventDefault()
        onSubmit()
        return
      }
      if (e.key === 'Backspace') {
        e.preventDefault()
        onBackspace()
        return
      }
      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        e.preventDefault()
        onLetter(e.key)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBackspace, onLetter, onRedo, onSubmit, onUndo])

  const ended = board.status === 'won' || board.status === 'lost'
  const hintAvailable = findHint(board) != null

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
              <KeyboardIcon className="h-[0.85rem] w-[0.85rem]" strokeWidth={2.25} />
            </Link>
            <h1 className="m-0 text-[1.15rem] font-bold tracking-[-0.03em] max-[720px]:text-base [@media(max-height:700px)]:text-base">
              {t('wordle.appName')}
            </h1>
            <span className="text-[0.68rem] font-semibold tracking-[0.04em] text-muted">
              {t('wordle.langNote')}
            </span>
          </div>
          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-[0.45rem]">
            <ExportImportButtons
              filename="wordle-board.json"
              family="wordle"
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
            title: t('wordle.help.title'),
            body: (
              <>
                <p className="m-0 mb-1.5">{t('wordle.help.body')}</p>
                <p className="m-0 mb-1.5">{t('wordle.help.lang')}</p>
                <p className="m-0 mb-1.5">{t('wordle.help.controls')}</p>
                <p className="m-0">{t('wordle.help.hard')}</p>
              </>
            )
          },
          {
            title: t('wordle.tools.hintTipTitle'),
            body: <p className="m-0">{t('wordle.tools.hintTipBody')}</p>
          },
          {
            title: t('wordle.diff.helpTitle'),
            body: <p className="m-0">{t('wordle.diff.helpBody')}</p>
          }
        ]}
      />

      <div className="board-frame order-1 [--board-pad:0.25rem] rounded-md bg-elevated/40">
        <div className={boardStage}>
          <Grid board={board} shake={shake} />
        </div>
      </div>

      <div className={`${gameStickyControls} order-2 max-[980px]:order-2 min-[981px]:hidden`}>
        <Keyboard
          guesses={board.guesses}
          disabled={ended}
          flashKey={flashKey}
          onLetter={onLetter}
          onEnter={onSubmit}
          onBackspace={onBackspace}
        />
      </div>

      {/* Tools | Letters side by side; Difficulty below */}
      <div className="game-secondary relative z-5 order-3 flex w-full shrink-0 flex-col gap-[0.55rem] max-[980px]:order-3">
        <div className="grid w-full grid-cols-1 items-stretch gap-[0.55rem] min-[720px]:grid-cols-2">
          <ToolsBar
            seconds={seconds}
            status={board.status}
            answer={board.answer}
            canHint={hintAvailable}
            onHint={onHint}
            onNew={onNew}
          />
          <LenBar wordLen={board.wordLen} onWordLenChange={onWordLen} />
        </div>
        <DiffBar diffId={board.diffId} onDiffChange={onDiff} />
      </div>
    </div>
  )
}
