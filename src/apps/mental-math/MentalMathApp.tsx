import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState
} from 'react'
import { Link } from 'react-router-dom'
import { Brain } from 'lucide-react'
import { HotkeysBar } from './components/HotkeysBar'
import { ProgressStrip } from './components/ProgressStrip'
import { StagePlay, StageResult, StageStart } from './components/Stage'
import {
  DiffBar,
  ExtraBar,
  LengthBar,
  OpBar,
  PaceBar,
  ToolsBar
} from './components/ToolsBar'
import { reduce } from './game/engine'
import { createRound, nextUnanswered, parseAnswer } from './game/generate'
import { loadGame, saveGame } from './game/prefs'
import { drillStats } from './game/resultStats'
import type {
  BoardState,
  DiffId,
  Extras,
  LengthId,
  OpId,
  PaceId,
  TermsId
} from './game/types'
import { extrasForDiff, isOver } from './game/types'
import { useI18n } from '../../i18n'
import { LangSwitch } from '../../shell/LangSwitch'
import { showToast } from '../../shared/toast'
import {
  ExportImportButtons,
  exportMentalMathGame,
  importMentalMathToGame,
  type BoardFile,
  type BoardImportResult
} from '../../shared/boardTransfer'
import { MobileHelpCard, boardStage, gameShell } from '../../shared/gameUi'

type Setup = {
  opId: OpId
  diffId: DiffId
  termsId: TermsId
  powers: boolean
  roots: boolean
  facts: boolean
  parens: boolean
  lengthId: LengthId
  paceId: PaceId
}

function setupFrom(board: BoardState): Setup {
  return {
    opId: board.opId,
    diffId: board.diffId,
    termsId: board.termsId,
    powers: board.powers,
    roots: board.roots,
    facts: board.facts,
    parens: board.parens,
    lengthId: board.lengthId,
    paceId: board.paceId
  }
}

export default function MentalMathApp() {
  const { t, locale } = useI18n()
  const initial = useRef(loadGame()).current
  const [board, dispatch] = useReducer(reduce, initial.board)
  const [seconds, setSeconds] = useState(initial.seconds)
  const [hydrated, setHydrated] = useState(false)
  const [setup, setSetup] = useState<Setup | null>(null)
  const tickRef = useRef<number | null>(null)
  const boardRef = useRef(board)
  boardRef.current = board
  const secondsRef = useRef(seconds)
  secondsRef.current = seconds
  const setupRef = useRef(setup)
  setupRef.current = setup
  const prevStatus = useRef(board.status)

  const startRound = useCallback(
    (
      opId: OpId,
      diffId: DiffId,
      lengthId: LengthId,
      paceId: PaceId | undefined,
      extras: Extras
    ) => {
      setSetup(null)
      setSeconds(0)
      dispatch({
        type: 'newGame',
        board: createRound(
          opId,
          diffId,
          lengthId,
          paceId,
          extras
        )
      })
    },
    []
  )

  const stopTimer = useCallback(() => {
    if (tickRef.current != null) window.clearInterval(tickRef.current)
    tickRef.current = null
  }, [])

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveGame(board, seconds)
  }, [hydrated, board, seconds])

  useEffect(() => {
    if (setup != null) {
      stopTimer()
      return stopTimer
    }
    if (board.status === 'playing' || board.status === 'revealed') {
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
  }, [board.status, setup, stopTimer])

  useEffect(() => {
    if (setup != null) return
    if (board.paceId !== 'timed' || board.timeLimit <= 0) return
    if (board.status !== 'playing' && board.status !== 'revealed') return
    if (seconds < board.timeLimit) return
    setSeconds(board.timeLimit)
    dispatch({ type: 'timeUp' })
  }, [seconds, board.paceId, board.timeLimit, board.status, setup])

  useEffect(() => {
    document.title = `${t('mentalMath.appName')} · ${t('hub.brand')}`
  }, [t, locale])

  useEffect(() => {
    const stats = drillStats(board)
    if (prevStatus.current !== board.status && board.status === 'won') {
      showToast(
        t('mentalMath.toast.done', {
          score: stats.solved,
          n: stats.total,
          pct: stats.pct
        }),
        'success'
      )
    }
    if (prevStatus.current !== board.status && board.status === 'lost') {
      showToast(
        t('mentalMath.toast.timesUp', {
          score: stats.solved,
          n: stats.total,
          pct: stats.pct
        }),
        'warn'
      )
    }
    prevStatus.current = board.status
  }, [board, t])

  const onSubmit = useCallback((text: string) => {
    const state = boardRef.current
    if (isOver(state.status) || state.status === 'revealed') return
    const q = state.questions[state.index]
    if (!q) return
    const value = parseAnswer(text)
    if (value == null || value !== q.answer) return
    dispatch({ type: 'submit', value, typed: text })
    if (state.lengthId === 'endless') return
    const picked = state.picked.slice()
    picked[state.index] = String(q.answer)
    const next = nextUnanswered(picked, state.index)
    if (next == null || next === state.index) return
    dispatch({ type: 'goto', index: next })
  }, [])

  const goTo = useCallback((index: number) => {
    const state = boardRef.current
    if (index < 0 || index >= state.total) return
    if (index === state.index) return
    dispatch({ type: 'goto', index })
  }, [])

  const onSkip = useCallback(() => {
    const state = boardRef.current
    const next = nextUnanswered(state.picked, state.index)
    if (next == null || next === state.index) return
    goTo(next)
  }, [goTo])

  const armStart = useCallback((patch: Partial<Setup>) => {
    const base = setupRef.current ?? setupFrom(boardRef.current)
    setSetup({ ...base, ...patch })
  }, [])

  const onNew = useCallback(() => {
    const d = setupRef.current ?? setupFrom(boardRef.current)
    startRound(d.opId, d.diffId, d.lengthId, d.paceId, {
      termsId: d.termsId,
      powers: d.powers,
      roots: d.roots,
      facts: d.facts,
      parens: d.parens
    })
  }, [startRound])

  const onStartDrill = onNew

  const onExportBoard = useCallback(
    () => exportMentalMathGame(boardRef.current, secondsRef.current),
    []
  )

  const onImportBoard = useCallback((file: BoardFile): BoardImportResult => {
    if (file.family !== 'mentalmath') return { ok: false, reason: 'wrong_family' }
    try {
      const { board: next, seconds: s } = importMentalMathToGame(file)
      setSeconds(s)
      setSetup(null)
      dispatch({ type: 'importBoard', board: next })
      return { ok: true }
    } catch {
      return { ok: false, reason: 'invalid' }
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }
      const mod = e.metaKey || e.ctrlKey
      if (mod) return
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        onNew()
        return
      }
      if (setupRef.current != null) {
        if (e.key === 'Enter') {
          e.preventDefault()
          onStartDrill()
        }
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (boardRef.current.status === 'revealed') onSkip()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onNew, onSkip, onStartDrill])

  const q = board.questions[board.index] ?? null
  const waiting = setup != null || board.status === 'ready'
  const view = setup ?? setupFrom(board)
  const setupSummary = [
    t(
      view.opId === 'mix'
        ? 'mentalMath.op.mix'
        : view.opId === 'add'
          ? 'mentalMath.op.add'
          : view.opId === 'sub'
            ? 'mentalMath.op.sub'
            : view.opId === 'mul'
              ? 'mentalMath.op.mul'
              : 'mentalMath.op.div'
    ),
    t(
      view.diffId === 'easy'
        ? 'mentalMath.diff.easy'
        : view.diffId === 'medium'
          ? 'mentalMath.diff.medium'
          : 'mentalMath.diff.hard'
    ),
    t(
      view.lengthId === 'n20'
        ? 'mentalMath.length.n20'
        : 'mentalMath.length.endless'
    )
  ].join(' · ')

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
              <Brain className="h-[0.85rem] w-[0.85rem]" strokeWidth={2.25} />
            </Link>
            <h1 className="m-0 text-[1.15rem] font-bold tracking-[-0.03em] max-[720px]:text-base [@media(max-height:700px)]:text-base">
              {t('mentalMath.appName')}
            </h1>
          </div>
          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-[0.45rem]">
            <ExportImportButtons
              filename="mental-math.json"
              family="mentalmath"
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
            title: t('mentalMath.help.title'),
            body: (
              <>
                <p className="m-0 mb-1.5">{t('mentalMath.help.body')}</p>
                <p className="m-0">{t('mentalMath.help.controls')}</p>
              </>
            )
          },
          {
            title: t('mentalMath.op.helpTitle'),
            body: <p className="m-0">{t('mentalMath.op.helpBody')}</p>
          },
          {
            title: t('mentalMath.diff.helpTitle'),
            body: <p className="m-0">{t('mentalMath.diff.helpBody')}</p>
          },
          {
            title: t('mentalMath.extra.helpTitle'),
            body: <p className="m-0">{t('mentalMath.extra.helpBody')}</p>
          },
          {
            title: t('mentalMath.length.helpTitle'),
            body: <p className="m-0">{t('mentalMath.length.helpBody')}</p>
          },
          {
            title: t('mentalMath.timer.helpTitle'),
            body: <p className="m-0">{t('mentalMath.timer.helpBody')}</p>
          }
        ]}
      />

      <div className="relative z-5 order-1 flex w-full shrink-0 flex-col gap-[0.55rem]">
        <ToolsBar
          seconds={seconds}
          index={board.index}
          total={board.total}
          score={board.score}
          lengthId={board.lengthId}
          paceId={board.paceId}
          timeLimit={board.timeLimit}
          status={board.status}
          onNew={onNew}
        />
        <OpBar opId={view.opId} onOpChange={(id) => armStart({ opId: id })} />
        <div className="grid w-full grid-cols-1 items-stretch gap-[0.55rem] min-[720px]:grid-cols-2">
          <DiffBar
            diffId={view.diffId}
            onDiffChange={(id) => armStart({ diffId: id, ...extrasForDiff(id) })}
          />
          <LengthBar
            lengthId={view.lengthId}
            onLengthChange={(id) => armStart({ lengthId: id })}
          />
        </div>
        <div className="grid w-full grid-cols-1 items-stretch gap-[0.55rem] min-[720px]:grid-cols-2">
          <ExtraBar
            powers={view.powers}
            roots={view.roots}
            facts={view.facts}
            parens={view.parens}
            onPowers={(on) => armStart({ powers: on })}
            onRoots={(on) => armStart({ roots: on })}
            onFacts={(on) => armStart({ facts: on })}
            onParens={(on) => armStart({ parens: on })}
          />
          <PaceBar
            paceId={view.paceId}
            lengthId={view.lengthId}
            diffId={view.diffId}
            extras={{
              termsId: view.termsId,
              powers: view.powers,
              roots: view.roots,
              facts: view.facts,
              parens: view.parens
            }}
            onPaceChange={(paceId) => armStart({ paceId })}
          />
        </div>
      </div>

      <div className="board-frame order-2 flex! min-h-0 w-full flex-1 flex-col! items-stretch! justify-start! gap-2 overflow-hidden [--board-pad:0.25rem] rounded-md bg-elevated/40">
        <div
          className={`${boardStage} min-h-0 flex-1 flex-col justify-center gap-3 overflow-auto`}
        >
          {waiting ? (
            <StageStart summary={setupSummary} onStart={onStartDrill} />
          ) : isOver(board.status) ? (
            <StageResult board={board} />
          ) : q ? (
            <StagePlay
              key={`${board.roundId}-${board.index}`}
              question={q}
              status={board.status}
              onSubmit={onSubmit}
            />
          ) : null}
        </div>
        {waiting || board.lengthId === 'endless' ? null : (
          <ProgressStrip
            questions={board.questions}
            index={board.index}
            picked={board.picked}
            misses={board.misses}
            roundId={board.roundId}
            onGoto={goTo}
          />
        )}
      </div>
    </div>
  )
}
