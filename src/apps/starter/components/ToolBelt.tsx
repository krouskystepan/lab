import type { ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { gameBtn } from '../../../shared/gameUi'
import type { ToolId } from '../game/types'

type Props = {
  tool: ToolId
  onTool: (tool: ToolId) => void
  onNew: () => void
  disabled?: boolean
}

export function ToolBelt({ tool, onTool, onNew, disabled }: Props) {
  const { t } = useI18n()

  return (
    <div className="flex w-full shrink-0 flex-col gap-2">
      <div className="grid w-full grid-cols-2 gap-2">
        <ToolSlot
          n={1}
          active={tool === 'probe'}
          disabled={disabled}
          label={t('starter.tool.probe')}
          title={t('starter.tool.probeTitle')}
          onClick={() => onTool('probe')}
        >
          <ProbeIcon />
        </ToolSlot>
        <ToolSlot
          n={2}
          active={tool === 'jumper'}
          disabled={disabled}
          label={t('starter.tool.jumper')}
          title={t('starter.tool.jumperTitle')}
          onClick={() => onTool('jumper')}
        >
          <JumperIcon />
        </ToolSlot>
      </div>
      <button
        type="button"
        className={cn(
          gameBtn,
          'inline-flex w-full items-center justify-center gap-1.5 border-danger/45 bg-danger/10 px-2 py-2 text-sm text-[#ffb0b0] hover:border-danger/75 hover:bg-danger/30'
        )}
        onClick={onNew}
        title={t('starter.newTitle')}
      >
        <RotateCcw className="h-[0.95em] w-[0.95em] shrink-0" aria-hidden />
        {t('starter.new')}
      </button>
    </div>
  )
}

function ToolSlot({
  n,
  active,
  disabled,
  label,
  title,
  onClick,
  children
}: {
  n: number
  active: boolean
  disabled?: boolean
  label: string
  title: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'relative flex h-[4.25rem] w-full flex-col items-center justify-center rounded-lg border-2 bg-[#1a1a1e] transition-colors',
        active
          ? 'border-[#3a7ae2] shadow-[0_0_0_1px_#3a7ae2,0_0_12px_rgba(58,122,226,0.35)]'
          : 'border-[#333] hover:border-[#555]',
        disabled && 'cursor-default opacity-50'
      )}
    >
      <span className="absolute top-1 left-1.5 font-mono text-[0.65rem] font-bold text-muted">
        {n}
      </span>
      {children}
      <span className="mt-0.5 font-mono text-[0.55rem] text-muted">{label}</span>
    </button>
  )
}

function ProbeIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden>
      <circle cx="20" cy="20" r="11" fill="none" stroke="#e24a4a" strokeWidth="3.5" />
      <circle cx="20" cy="20" r="4" fill="#e24a4a" />
    </svg>
  )
}

function JumperIcon() {
  return (
    <svg viewBox="0 0 48 40" className="h-8 w-10" aria-hidden>
      <path
        d="M10 20 Q24 6 38 20"
        fill="none"
        stroke="#e24a4a"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="10" cy="22" rx="7" ry="5" fill="#c42828" stroke="#5a0c0c" />
      <ellipse cx="38" cy="22" rx="7" ry="5" fill="#c42828" stroke="#5a0c0c" />
    </svg>
  )
}
