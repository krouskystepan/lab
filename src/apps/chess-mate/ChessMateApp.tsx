import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Crown } from 'lucide-react'
import { Chess } from 'chess.js'
import { Board, type BoardMoveAnim } from './components/Board'
import { ControlsBar } from './components/ControlsBar'
import { HotkeysBar } from './components/HotkeysBar'
import { SetupBar } from './components/SetupBar'
import {
  clonePosition,
  fromFen,
  parseSquare,
  sanitizeCastling,
  toFen
} from './solver/fen'
import type { MatePreset } from './solver/presets'
import type { Castling, MateN, MatePly, MateResult, Piece, Position, Side } from './solver/types'
import { PositionHistory } from './storage/history'
import { loadBoard, saveBoard, type Brush } from './storage/prefs'
import { useI18n } from '../../i18n'
import { LangSwitch } from '../../shell/LangSwitch'
import { showToast } from '../../shared/toast'
import {
  ExportImportButtons,
  exportChessMateBoard,
  importChessMateBoard,
  type BoardFile,
  type BoardImportResult
} from '../../shared/boardTransfer'
import { MobileHelpCard, boardStage, gameShell, gameStickyControls } from '../../shared/gameUi'

function kingIndex(pos: Position, side: Side): number | null {
  const i = pos.squares.findIndex((p) => p?.kind === 'k' && p.side === side)
  return i >= 0 ? i : null
}

function inCheckSquare(pos: Position): number | null {
  try {
    const chess = new Chess(toFen(pos))
    if (!chess.inCheck()) return null
    return kingIndex(pos, pos.turn)
  } catch {
    return null
  }
}

function applyPly(pos: Position, ply: MatePly): Position | null {
  try {
    const chess = new Chess(toFen(pos))
    chess.move({
      from: ply.from,
      to: ply.to,
      ...(ply.promotion ? { promotion: ply.promotion } : {})
    })
    return fromFen(chess.fen())
  } catch {
    return null
  }
}

function placePiece(pos: Position, index: number, piece: Piece | null): Position {
  let squares = pos.squares.slice()
  if (piece?.kind === 'k') {
    squares = squares.map((p, i) =>
      i !== index && p?.kind === 'k' && p.side === piece.side ? null : p
    )
  }
  squares[index] = piece
  return sanitizeCastling({ ...pos, squares, ep: '-' })
}

function lineFrames(start: Position, line: MatePly[]): Position[] | null {
  const frames = [clonePosition(start)]
  let cur = start
  for (const ply of line) {
    const next = applyPly(cur, ply)
    if (!next) return null
    frames.push(next)
    cur = next
  }
  return frames
}

function moveAnim(
  fromStep: number,
  toStep: number,
  line: MatePly[],
  frames: Position[],
  animIdRef: { current: number }
): BoardMoveAnim | null {
  if (Math.abs(toStep - fromStep) !== 1) return null
  const plyIndex = Math.min(fromStep, toStep)
  const ply = line[plyIndex]
  const from = ply ? parseSquare(ply.from) : null
  const to = ply ? parseSquare(ply.to) : null
  if (from == null || to == null) return null
  const piece = frames[plyIndex]?.squares[from]
  if (!piece) return null
  return {
    id: ++animIdRef.current,
    piece,
    from,
    to,
    dir: toStep > fromStep ? 'fwd' : 'back'
  }
}

export default function ChessMateApp() {
  const { t, locale } = useI18n()
  const initial = useRef(loadBoard()).current
  const [pos, setPos] = useState<Position>(initial.pos)
  const [mateN, setMateN] = useState<MateN>(initial.prefs.mateN)
  const [flipped, setFlipped] = useState(initial.prefs.flipped)
  const [brush, setBrush] = useState<Brush>(initial.prefs.brush)
  const [fenDraft, setFenDraft] = useState(toFen(initial.pos))
  const [result, setResult] = useState<MateResult | null>(null)
  const [frames, setFrames] = useState<Position[] | null>(null)
  const [viewStep, setViewStep] = useState(0)
  const [anim, setAnim] = useState<BoardMoveAnim | null>(null)
  const [searching, setSearching] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const historyRef = useRef(new PositionHistory())
  const posRef = useRef(pos)
  posRef.current = pos
  const resultRef = useRef(result)
  resultRef.current = result
  const framesRef = useRef(frames)
  framesRef.current = frames
  const viewStepRef = useRef(viewStep)
  viewStepRef.current = viewStep
  const brushRef = useRef(brush)
  brushRef.current = brush
  const searchingRef = useRef(searching)
  searchingRef.current = searching
  const mateNRef = useRef(mateN)
  mateNRef.current = mateN
  const jobRef = useRef(0)
  const animIdRef = useRef(0)
  const workerRef = useRef<Worker | null>(null)
  const tRef = useRef(t)
  tRef.current = t

  const syncHistory = useCallback(() => {
    setCanUndo(historyRef.current.canUndo)
    setCanRedo(historyRef.current.canRedo)
  }, [])

  const pushHistory = useCallback(() => {
    historyRef.current.push(posRef.current)
    syncHistory()
  }, [syncHistory])

  const commit = useCallback((next: Position) => {
    jobRef.current += 1
    setSearching(false)
    setPos(next)
    setFenDraft(toFen(next))
    setResult(null)
    setFrames(null)
    setViewStep(0)
    setAnim(null)
  }, [])

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveBoard(pos, { mateN, flipped, brush })
  }, [hydrated, pos, mateN, flipped, brush])

  useEffect(() => {
    document.title = `${t('chessMate.appName')} · ${t('hub.brand')}`
  }, [t, locale])

  useEffect(() => {
    const worker = new Worker(
      new URL('./solver/mateWorker.ts', import.meta.url),
      { type: 'module' }
    )
    workerRef.current = worker
    worker.onmessage = (e: MessageEvent<{ id: number; result: MateResult }>) => {
      if (e.data.id !== jobRef.current) return
      setSearching(false)
      const r = e.data.result
      setResult(r)
      setViewStep(0)
      setAnim(null)
      const tr = tRef.current
      if (r.ok) {
        const built = lineFrames(posRef.current, r.line)
        if (!built) {
          setFrames(null)
          showToast(tr('chessMate.result.invalid'), 'error')
        } else {
          setFrames(built)
          showToast(tr('chessMate.toast.solved'), 'success')
        }
      } else {
        setFrames(null)
        if (r.reason === 'none') {
          showToast(tr('chessMate.result.none', { n: mateNRef.current }), 'warn')
        } else if (r.reason === 'timeout') {
          showToast(tr('chessMate.result.timeout'), 'warn')
        } else if (r.reason === 'invalid') {
          showToast(tr('chessMate.result.invalid'), 'error')
        } else if (r.reason === 'stalemate') {
          showToast(tr('chessMate.result.stalemate'), 'warn')
        } else {
          showToast(tr('chessMate.result.already'), 'info')
        }
      }
    }
    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  const onSolve = useCallback(() => {
    if (searchingRef.current) return
    const worker = workerRef.current
    if (!worker) return
    const id = ++jobRef.current
    setSearching(true)
    setResult(null)
    setFrames(null)
    setViewStep(0)
    setAnim(null)
    worker.postMessage({
      id,
      fen: toFen(posRef.current),
      mateIn: mateNRef.current
    })
  }, [])

  const goToStep = useCallback((step: number) => {
    const r = resultRef.current
    const built = framesRef.current
    if (!r?.ok || !built) return
    const max = r.line.length
    if (step < 0 || step > max) return
    const prev = viewStepRef.current
    if (step === prev) return
    setAnim(moveAnim(prev, step, r.line, built, animIdRef))
    setViewStep(step)
  }, [])

  const onViewStep = useCallback((step: number) => {
    goToStep(step)
  }, [goToStep])

  const onStepNext = useCallback(() => {
    const r = resultRef.current
    if (!r?.ok) return
    const max = r.line.length
    const next = viewStepRef.current >= max ? 0 : viewStepRef.current + 1
    goToStep(next)
  }, [goToStep])

  const onUndo = useCallback(() => {
    const prev = historyRef.current.undo(posRef.current)
    if (!prev) return
    commit(prev)
    syncHistory()
  }, [commit, syncHistory])

  const onRedo = useCallback(() => {
    const next = historyRef.current.redo(posRef.current)
    if (!next) return
    commit(next)
    syncHistory()
  }, [commit, syncHistory])

  const onLoadFen = useCallback(() => {
    const next = fromFen(fenDraft)
    if (!next) {
      showToast(t('chessMate.fen.invalid'), 'error')
      return
    }
    pushHistory()
    commit(next)
  }, [commit, fenDraft, pushHistory, t])

  const onCastle = useCallback(
    (flag: keyof Castling, on: boolean) => {
      pushHistory()
      const next = sanitizeCastling({
        ...clonePosition(posRef.current),
        castling: { ...posRef.current.castling, [flag]: on }
      })
      commit(next)
    },
    [commit, pushHistory]
  )

  const onPreset = useCallback(
    (preset: MatePreset) => {
      const next = fromFen(preset.fen)
      if (!next) return
      pushHistory()
      setMateN(preset.mateIn)
      commit(next)
    },
    [commit, pushHistory]
  )

  const onSelect = useCallback(
    (index: number) => {
      const b = brushRef.current
      if (b === null) return
      const cur = posRef.current.squares[index]
      const piece =
        cur?.kind === b.kind && cur.side === b.side ? null : b
      pushHistory()
      commit(placePiece(posRef.current, index, piece))
    },
    [commit, pushHistory]
  )

  const onExportBoard = useCallback(
    () => exportChessMateBoard(posRef.current, mateNRef.current, flipped),
    [flipped]
  )

  const onImportBoard = useCallback(
    (file: BoardFile): BoardImportResult => {
      if (file.family !== 'chess') return { ok: false, reason: 'wrong_family' }
      try {
        const loaded = importChessMateBoard(file)
        pushHistory()
        if (loaded.mateN) setMateN(loaded.mateN)
        if (typeof loaded.flipped === 'boolean') setFlipped(loaded.flipped)
        commit(loaded.pos)
        return { ok: true }
      } catch {
        return { ok: false, reason: 'invalid' }
      }
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
        onStepNext()
        return
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        setFlipped((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onStepNext, onRedo, onSolve, onUndo])

  const line = result?.ok ? result.line : null
  const highlightPly =
    line && viewStep > 0 ? line[viewStep - 1] ?? null : null
  const lastFrom = highlightPly ? parseSquare(highlightPly.from) : null
  const lastTo = highlightPly ? parseSquare(highlightPly.to) : null
  const moveLabel = highlightPly?.san ?? null
  const boardPos = frames?.[viewStep] ?? pos

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
              <Crown className="h-[0.85rem] w-[0.85rem]" strokeWidth={2.25} />
            </Link>
            <h1 className="m-0 text-[1.15rem] font-bold tracking-[-0.03em] max-[720px]:text-base [@media(max-height:700px)]:text-base">
              {t('chessMate.appName')}
            </h1>
          </div>
          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-[0.45rem]">
            <ExportImportButtons
              filename="chess-mate.json"
              family="chess"
              onExport={onExportBoard}
              onImport={onImportBoard}
            />
            <LangSwitch />
          </div>
        </div>
        <div className="hidden w-full flex-wrap items-center justify-start gap-2.5 [@media(min-width:960px)_and_(min-height:780px)]:flex">
          <HotkeysBar />
        </div>
      </header>

      <MobileHelpCard
        sections={[
          {
            title: t('chessMate.help.title'),
            body: (
              <>
                <p className="m-0 mb-1.5">{t('chessMate.help.body')}</p>
                <p className="m-0">{t('chessMate.help.solve')}</p>
              </>
            )
          },
          {
            title: t('chessMate.n.helpTitle'),
            body: <p className="m-0">{t('chessMate.n.helpBody')}</p>
          },
          {
            title: t('chessMate.fen.helpTitle'),
            body: <p className="m-0">{t('chessMate.fen.helpBody')}</p>
          },
          {
            title: t('chessMate.castle.helpTitle'),
            body: <p className="m-0">{t('chessMate.castle.helpBody')}</p>
          }
        ]}
      />

      <div className="board-frame order-1 min-h-0 flex-1 [--board-pad:0.25rem] rounded-md border border-line bg-elevated max-[980px]:order-1">
        <div className={boardStage}>
          <Board
            pos={boardPos}
            flipped={flipped}
            lastFrom={lastFrom}
            lastTo={lastTo}
            moveLabel={moveLabel}
            checkIndex={inCheckSquare(boardPos)}
            anim={anim}
            onSelect={onSelect}
          />
        </div>
      </div>

      <div className="relative z-5 order-2 flex w-full shrink-0 flex-col gap-[0.55rem] max-[980px]:order-2 min-[981px]:grid min-[981px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] min-[981px]:items-stretch">
        <div className={`${gameStickyControls} min-[981px]:h-full`}>
          <ControlsBar
            brush={brush}
            onBrush={setBrush}
            searching={searching}
            canUndo={canUndo}
            canRedo={canRedo}
            result={result}
            mateN={mateN}
            viewStep={viewStep}
            onViewStep={onViewStep}
            onMateN={setMateN}
            onFlip={() => setFlipped((v) => !v)}
            onUndo={onUndo}
            onRedo={onRedo}
            onSolve={onSolve}
          />
        </div>
        <div className="min-[981px]:h-full">
          <SetupBar
            pos={pos}
            fenDraft={fenDraft}
            onFenDraft={setFenDraft}
            onLoadFen={onLoadFen}
            onCastle={onCastle}
            onPreset={onPreset}
          />
        </div>
      </div>
    </div>
  )
}
