import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState
} from 'react'
import { Link } from 'react-router-dom'
import { Globe2 } from 'lucide-react'
import { HotkeysBar } from './components/HotkeysBar'
import { ProgressStrip } from './components/ProgressStrip'
import { StageGuess, StagePrompt, StageStart } from './components/Stage'
import { AnswerBar, GroupBar, ModeBar, PaceBar, ToolsBar } from './components/ToolsBar'
import { byCode, loadCatalog } from './game/catalog'
import { reduce } from './game/engine'
import { createRound, nextUnanswered } from './game/generate'
import { typedIsCorrect } from './game/match'
import { loadAutoNext, loadGame, saveAutoNext, saveGame } from './game/prefs'
import type { AnswerId, BoardState, Country, GroupId, ModeId, PaceId } from './game/types'
import { isOver } from './game/types'
import { useI18n } from '../../i18n'
import { LangSwitch } from '../../shell/LangSwitch'
import { showToast } from '../../shared/toast'
import {
  ExportImportButtons,
  exportGeoQuizGame,
  importGeoQuizToGame,
  type BoardFile,
  type BoardImportResult
} from '../../shared/boardTransfer'
import { MobileHelpCard, boardStage, gameShell } from '../../shared/gameUi'

const CHOICE_ADVANCE_MS = 220

type Setup = {
  modeId: ModeId
  groupId: GroupId
  answerId: AnswerId
  paceId: PaceId
}

function setupFrom(board: BoardState): Setup {
  return {
    modeId: board.modeId,
    groupId: board.groupId,
    answerId: board.answerId,
    paceId: board.paceId
  }
}

const GROUP_NAME: Record<
  GroupId,
  | 'geoQuiz.group.world'
  | 'geoQuiz.group.europe'
  | 'geoQuiz.group.americas'
  | 'geoQuiz.group.asia'
  | 'geoQuiz.group.africa'
  | 'geoQuiz.group.oceania'
> = {
  world: 'geoQuiz.group.world',
  europe: 'geoQuiz.group.europe',
  americas: 'geoQuiz.group.americas',
  asia: 'geoQuiz.group.asia',
  africa: 'geoQuiz.group.africa',
  oceania: 'geoQuiz.group.oceania'
}

export default function GeoQuizApp() {
  const { t, locale } = useI18n()
  const initial = useRef(loadGame()).current
  const [board, dispatch] = useReducer(reduce, initial.board)
  const [seconds, setSeconds] = useState(initial.seconds)
  const [countries, setCountries] = useState<Country[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [autoNext, setAutoNext] = useState(() => loadAutoNext())
  const [setup, setSetup] = useState<Setup | null>(null)
  const tickRef = useRef<number | null>(null)
  const boardRef = useRef(board)
  boardRef.current = board
  const secondsRef = useRef(seconds)
  secondsRef.current = seconds
  const countriesRef = useRef(countries)
  countriesRef.current = countries
  const selectedRef = useRef(selected)
  selectedRef.current = selected
  const setupRef = useRef(setup)
  setupRef.current = setup
  const prevStatus = useRef(board.status)
  const autoDelayRef = useRef(CHOICE_ADVANCE_MS)
  const pendingAdvanceRef = useRef(false)

  const lookup = useMemo(
    () => (countries ? byCode(countries) : new Map()),
    [countries]
  )

  const startRound = useCallback(
    (
      modeId: ModeId,
      groupId: GroupId,
      answerId: AnswerId,
      list: Country[],
      paceId?: PaceId
    ) => {
      setSelected(null)
      setSetup(null)
      setSeconds(0)
      const cur = boardRef.current
      dispatch({
        type: 'newGame',
        board: createRound(
          list,
          modeId,
          groupId,
          answerId,
          paceId ?? cur.paceId
        )
      })
    },
    []
  )

  const stopTimer = useCallback(() => {
    if (tickRef.current != null) window.clearInterval(tickRef.current)
    tickRef.current = null
  }, [])

  const fetchCatalog = useCallback(() => {
    setLoadError(false)
    loadCatalog()
      .then((list) => {
        setCountries(list)
        const cur = boardRef.current
        const map = byCode(list)
        const ok =
          cur.questions.length > 0 &&
          cur.questions.every(
            (q) => map.has(q.subject) && q.choices.every((c) => map.has(c))
          )
        if (!ok) {
          startRound(cur.modeId, cur.groupId, cur.answerId, list)
        }
      })
      .catch(() => setLoadError(true))
  }, [startRound])

  useEffect(() => {
    fetchCatalog()
  }, [fetchCatalog])

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveGame(board, seconds)
  }, [hydrated, board, seconds])

  useEffect(() => {
    saveAutoNext(autoNext)
  }, [autoNext])

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
    document.title = `${t('geoQuiz.appName')} · ${t('hub.brand')}`
  }, [t, locale])

  useEffect(() => {
    if (prevStatus.current !== board.status && board.status === 'won') {
      showToast(
        t('geoQuiz.toast.done', { score: board.score, n: board.total }),
        'success'
      )
    }
    if (prevStatus.current !== board.status && board.status === 'lost') {
      showToast(
        t('geoQuiz.toast.timesUp', { score: board.score, n: board.total }),
        'warn'
      )
    }
    prevStatus.current = board.status
  }, [board.status, board.score, board.total, t])

  useEffect(() => {
    setSelected(null)
  }, [board.index, board.roundId])

  useEffect(() => {
    if (selected == null) return
    const q = board.questions[board.index]
    if (!q) return
    const missed = new Set(board.misses[board.index] ?? [])
    if (!missed.has(q.choices[selected] ?? '')) {
      return
    }
    const next = q.choices.findIndex((c) => !missed.has(c))
    if (next >= 0) setSelected(next)
    else setSelected(null)
  }, [board.index, board.misses, board.questions, selected])
  const onType = useCallback(
    (text: string) => {
      const state = boardRef.current
      if (isOver(state.status) || state.status === 'revealed') return
      const q = state.questions[state.index]
      if (!q) return
      if (!text.trim()) {
        showToast(t('geoQuiz.type.blank'), 'warn')
        return
      }
      const country = countriesRef.current
        ? byCode(countriesRef.current).get(q.subject)
        : undefined
      const ok = typedIsCorrect(q, text, locale, country)
      dispatch({
        type: 'pick',
        code: ok ? q.subject : '',
        fromType: true,
        typed: text
      })
      if (!ok || !autoNext) return
      const picked = state.picked.slice()
      picked[state.index] = q.subject
      const next = nextUnanswered(picked, state.index)
      if (next == null || next === state.index) return
      pendingAdvanceRef.current = false
      setSelected(null)
      dispatch({ type: 'goto', index: next })
    },
    [autoNext, locale, t]
  )

  const onPick = useCallback((code: string) => {
    const state = boardRef.current
    if (isOver(state.status) || state.status === 'revealed') return
    const q = state.questions[state.index]
    if (!q) return
    if ((state.misses[state.index] ?? []).includes(code)) return
    if (code === q.subject) {
      autoDelayRef.current = CHOICE_ADVANCE_MS
      pendingAdvanceRef.current = true
    }
    dispatch({ type: 'pick', code })
  }, [])

  const goTo = useCallback((index: number) => {
    const state = boardRef.current
    if (index < 0 || index >= state.total) return
    if (index === state.index) return
    pendingAdvanceRef.current = false
    setSelected(null)
    dispatch({ type: 'goto', index })
  }, [])

  const onSkip = useCallback(() => {
    const state = boardRef.current
    const next = nextUnanswered(state.picked, state.index)
    if (next == null || next === state.index) return
    goTo(next)
  }, [goTo])

  useEffect(() => {
    if (!autoNext) return
    if (board.status !== 'revealed') return
    if (!pendingAdvanceRef.current) return
    pendingAdvanceRef.current = false
    const ms = autoDelayRef.current
    if (ms <= 0) {
      onSkip()
      return
    }
    const id = window.setTimeout(() => {
      if (boardRef.current.status !== 'revealed') return
      onSkip()
    }, ms)
    return () => window.clearTimeout(id)
  }, [autoNext, board.status, board.index, onSkip])

  const armStart = useCallback((patch: Partial<Setup>) => {
    const base = setupRef.current ?? setupFrom(boardRef.current)
    setSetup({ ...base, ...patch })
  }, [])

  const onNew = useCallback(() => {
    const list = countriesRef.current
    if (!list) return
    const d = setupRef.current ?? setupFrom(boardRef.current)
    startRound(d.modeId, d.groupId, d.answerId, list, d.paceId)
  }, [startRound])

  const onMode = useCallback((id: ModeId) => {
    armStart({ modeId: id })
  }, [armStart])

  const onGroup = useCallback((id: GroupId) => {
    armStart({ groupId: id })
  }, [armStart])

  const onStartQuiz = useCallback(() => {
    const list = countriesRef.current
    if (!list) return
    const d = setupRef.current ?? setupFrom(boardRef.current)
    startRound(d.modeId, d.groupId, d.answerId, list, d.paceId)
  }, [startRound])

  const onAnswer = useCallback((id: AnswerId) => {
    armStart({ answerId: id })
  }, [armStart])

  const onPace = useCallback((paceId: PaceId) => {
    armStart({ paceId })
  }, [armStart])

  const onExportBoard = useCallback(
    () => exportGeoQuizGame(boardRef.current, secondsRef.current),
    []
  )

  const onImportBoard = useCallback((file: BoardFile): BoardImportResult => {
    if (file.family !== 'geoquiz') return { ok: false, reason: 'wrong_family' }
    try {
      const { board: next, seconds: s } = importGeoQuizToGame(file)
      const list = countriesRef.current
      if (list) {
        const map = byCode(list)
        const ok = next.questions.every(
          (q) => map.has(q.subject) && q.choices.every((c) => map.has(c))
        )
        if (!ok) return { ok: false, reason: 'invalid' }
      }
      setSeconds(s)
      setSelected(null)
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
      const typing = boardRef.current.answerId === 'type'
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        onNew()
        return
      }
      if (setupRef.current != null) {
        if (e.key === 'Enter') {
          e.preventDefault()
          onStartQuiz()
        }
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (boardRef.current.status === 'revealed') onSkip()
        else if (!typing) {
          const q = boardRef.current.questions[boardRef.current.index]
          const i = selectedRef.current
          if (i == null) return
          const code = q?.choices[i]
          if (code) onPick(code)
        }
        return
      }
      if (typing) return
      const locked =
        isOver(boardRef.current.status) ||
        boardRef.current.status === 'revealed'
      if (locked) return
      if (
        e.key === 'ArrowRight' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowUp'
      ) {
        e.preventDefault()
        const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1
        setSelected((from) => {
          const state = boardRef.current
          const cur = state.questions[state.index]
          if (!cur) return from
          const missed = new Set(state.misses[state.index] ?? [])
          const start = from ?? (dir > 0 ? -1 : 0)
          for (let s = 1; s <= 4; s++) {
            const i = (((start + dir * s) % 4) + 4) % 4
            if (!missed.has(cur.choices[i])) {
              return i
            }
          }
          return from
        })
        return
      }
      const digit = e.key === ' ' ? -1 : Number(e.key)
      if (digit >= 1 && digit <= 4) {
        e.preventDefault()
        const q = boardRef.current.questions[boardRef.current.index]
        const code = q?.choices[digit - 1]
        if (code) {
          setSelected(digit - 1)
          onPick(code)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onNew, onPick, onSkip, onStartQuiz])

  const q = board.questions[board.index] ?? null
  const waiting = setup != null
  const view = setup ?? setupFrom(board)
  const stageError =
    !waiting && (loadError || (countries != null && !q))

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
              <Globe2 className="h-[0.85rem] w-[0.85rem]" strokeWidth={2.25} />
            </Link>
            <h1 className="m-0 text-[1.15rem] font-bold tracking-[-0.03em] max-[720px]:text-base [@media(max-height:700px)]:text-base">
              {t('geoQuiz.appName')}
            </h1>
          </div>
          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-[0.45rem]">
            <ExportImportButtons
              filename="geo-quiz.json"
              family="geoquiz"
              onExport={onExportBoard}
              onImport={onImportBoard}
            />
            <LangSwitch />
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center justify-start gap-2.5 max-[720px]:hidden">
          <HotkeysBar answerId={board.answerId} />
        </div>
      </header>

      <MobileHelpCard
        sections={[
          {
            title: t('geoQuiz.help.title'),
            body: (
              <>
                <p className="m-0 mb-1.5">{t('geoQuiz.help.body')}</p>
                <p className="m-0 mb-1.5">{t('geoQuiz.help.data')}</p>
                <p className="m-0">{t('geoQuiz.help.controls')}</p>
              </>
            )
          },
          {
            title: t('geoQuiz.mode.helpTitle'),
            body: <p className="m-0">{t('geoQuiz.mode.helpBody')}</p>
          },
          {
            title: t('geoQuiz.answer.helpTitle'),
            body: <p className="m-0">{t('geoQuiz.answer.helpBody')}</p>
          },
          {
            title: t('geoQuiz.timer.helpTitle'),
            body: <p className="m-0">{t('geoQuiz.timer.helpBody')}</p>
          },
          {
            title: t('geoQuiz.group.helpTitle'),
            body: <p className="m-0">{t('geoQuiz.group.helpBody')}</p>
          }
        ]}
      />

      <div className="relative z-5 order-1 flex w-full shrink-0 flex-col gap-[0.55rem]">
        <ToolsBar
          seconds={seconds}
          index={board.index}
          total={board.total}
          score={board.score}
          paceId={board.paceId}
          timeLimit={board.timeLimit}
          status={board.status}
          onNew={onNew}
          autoNext={autoNext}
          onToggleAutoNext={() => setAutoNext((v) => !v)}
        />
        <div className="grid w-full grid-cols-1 items-stretch gap-[0.55rem] min-[720px]:grid-cols-3">
          <ModeBar modeId={view.modeId} onModeChange={onMode} />
          <AnswerBar answerId={view.answerId} onAnswerChange={onAnswer} />
          <PaceBar
            paceId={view.paceId}
            groupId={view.groupId}
            answerId={view.answerId}
            onPaceChange={onPace}
          />
        </div>
        <GroupBar groupId={view.groupId} onGroupChange={onGroup} />
      </div>

      <div className="board-frame order-2 flex! min-h-0 w-full flex-1 flex-col! items-stretch! justify-start! gap-2 overflow-hidden [--board-pad:0.25rem] rounded-md bg-elevated/40">
        <div
          className={`${boardStage} min-h-0 flex-1 flex-col justify-center gap-3 overflow-auto`}
        >
          {waiting ? (
            <StageStart
              groupLabel={t(GROUP_NAME[view.groupId])}
              onStart={onStartQuiz}
            />
          ) : (
            <>
          <StagePrompt
            loading={countries == null && !loadError}
            error={stageError}
            onRetry={fetchCatalog}
            question={q}
            lookup={lookup}
          />
          {board.status === 'lost' ? (
            <p className="m-0 text-center text-[0.95rem] font-semibold text-danger">
              {t('geoQuiz.status.timesUp')}
            </p>
          ) : null}
          {board.status === 'won' ? (
            <p className="m-0 text-center text-[0.95rem] font-semibold text-[#4cbe6a]">
              {t('geoQuiz.status.done')}
            </p>
          ) : null}
          <StageGuess
            question={q}
            lookup={lookup}
            picked={q ? board.picked[board.index] : null}
            misses={q ? (board.misses[board.index] ?? []) : []}
            selected={selected}
            status={board.status}
            answerId={board.answerId}
            onPick={onPick}
            onType={onType}
            onClearSelect={() => setSelected(null)}
          />
            </>
          )}
        </div>
        {waiting ? null : (
        <ProgressStrip
          questions={board.questions}
          lookup={lookup}
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
