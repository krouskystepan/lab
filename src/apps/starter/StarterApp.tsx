import { useCallback, useEffect, useReducer, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { Dashboard } from './components/Dashboard'
import { HotkeysBar } from './components/HotkeysBar'
import { KitStatus } from './components/KitStatus'
import { Multimeter } from './components/Multimeter'
import { StatusBanner } from './components/StatusBanner'
import { ToolBelt } from './components/ToolBelt'
import { WireLoom } from './components/WireLoom'
import { createInitial, meterReading, reduce } from './game/engine'
import { useI18n } from '../../i18n'
import { LangSwitch } from '../../shell/LangSwitch'
import { showToast } from '../../shared/toast'
import { MobileHelpCard, gameShell } from '../../shared/gameUi'

export default function StarterApp() {
  const { t, locale } = useI18n()
  const [board, dispatch] = useReducer(reduce, undefined, createInitial)
  const boardRef = useRef(board)
  boardRef.current = board
  const prevStatus = useRef(board.status)
  const holdRaf = useRef<number | null>(null)
  const holdLast = useRef(0)

  useEffect(() => {
    document.title = `${t('starter.appName')} · ${t('hub.brand')}`
  }, [t, locale])

  useEffect(() => {
    if (prevStatus.current === board.status) return
    if (board.status === 'won') showToast(t('starter.toast.won'), 'success')
    if (board.status === 'lost') showToast(t('starter.toast.lost'), 'error')
    prevStatus.current = board.status
  }, [board.status, t])

  const stopHoldLoop = useCallback(() => {
    if (holdRaf.current != null) cancelAnimationFrame(holdRaf.current)
    holdRaf.current = null
  }, [])

  useEffect(() => {
    if (!board.holdingStarter) {
      stopHoldLoop()
      return
    }
    holdLast.current = performance.now()
    const tick = (now: number) => {
      const dt = now - holdLast.current
      holdLast.current = now
      dispatch({ type: 'holdTick', dt })
      holdRaf.current = requestAnimationFrame(tick)
    }
    holdRaf.current = requestAnimationFrame(tick)
    return stopHoldLoop
  }, [board.holdingStarter, stopHoldLoop])

  const onNew = useCallback(() => {
    dispatch({ type: 'newGame' })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }
      if (e.metaKey || e.ctrlKey) return
      const k = e.key.toLowerCase()
      if (k === '1') {
        e.preventDefault()
        dispatch({ type: 'setTool', tool: 'probe' })
      } else if (k === '2') {
        e.preventDefault()
        dispatch({ type: 'setTool', tool: 'jumper' })
      } else if (k === 'v') {
        e.preventDefault()
        dispatch({ type: 'setMeter', mode: 'V' })
      } else if (k === 'o') {
        e.preventDefault()
        dispatch({ type: 'setMeter', mode: 'OHM' })
      } else if (k === 'n') {
        e.preventDefault()
        onNew()
      } else if (k === 'escape') {
        e.preventDefault()
        dispatch({ type: 'clearJumper' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onNew])

  const ended = board.status !== 'playing'
  const reading = meterReading(board)

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
              <Zap className="h-[0.85rem] w-[0.85rem]" strokeWidth={2.25} />
            </Link>
            <h1 className="m-0 text-[1.15rem] font-bold tracking-[-0.03em] max-[720px]:text-base">
              {t('starter.appName')}
            </h1>
          </div>
          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-[0.45rem]">
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
            title: t('starter.help.title'),
            body: (
              <>
                <p className="m-0 mb-1.5">{t('starter.help.body')}</p>
                <p className="m-0">{t('starter.help.controls')}</p>
              </>
            )
          },
          {
            title: t('starter.help.findTitle'),
            body: <p className="m-0">{t('starter.help.findBody')}</p>
          },
          {
            title: t('starter.help.connectTitle'),
            body: <p className="m-0">{t('starter.help.connectBody')}</p>
          }
        ]}
      />

      {/* Own stage — avoid .board-frame (flex-none + centered kids crush the loom) */}
      <div className="order-1 flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-md border border-line bg-[#0a0a0c] min-[900px]:flex-row">
        <div className="relative flex min-h-0 min-w-0 flex-1 items-stretch justify-stretch">
          <Dashboard
            dashOn={board.dashOn}
            rpm={board.rpm}
            won={board.status === 'won'}
          />
          <div className="absolute inset-0 flex items-center justify-center p-2 min-[900px]:p-3">
            <WireLoom
              board={board}
              onProbe={(id) => dispatch({ type: 'probe', wireId: id })}
              onJumperClick={(id) => dispatch({ type: 'jumperClick', wireId: id })}
              onHoldStart={(id) => dispatch({ type: 'holdStart', wireId: id })}
              onHoldEnd={() => dispatch({ type: 'holdEnd' })}
            />
          </div>
          <StatusBanner board={board} />
        </div>

        <aside className="relative z-20 flex w-full shrink-0 flex-col justify-between gap-3 border-t border-line bg-[#141418] px-3 py-3 max-[899px]:max-h-[46%] max-[899px]:overflow-y-auto min-[900px]:w-[19rem] min-[900px]:border-t-0 min-[900px]:border-l min-[900px]:py-4">
          <KitStatus durability={board.durability} />
          <Multimeter
            reading={reading}
            mode={board.meterMode}
            onMode={(mode) => dispatch({ type: 'setMeter', mode })}
            disabled={ended}
          />
          <div className="mt-auto flex flex-col gap-3">
            <ToolBelt
              tool={board.tool}
              onTool={(tool) => dispatch({ type: 'setTool', tool })}
              onNew={onNew}
              disabled={ended}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
