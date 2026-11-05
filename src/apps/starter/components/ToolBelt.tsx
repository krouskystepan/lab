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
    <div className="flex w-full shrink-0 flex-col gap-1.5 min-[900px]:gap-2">
      <div className="grid w-full grid-cols-[1fr_1fr_auto] gap-1.5 min-[900px]:grid-cols-2 min-[900px]:gap-2">
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
        <button
          type="button"
          className={cn(
            gameBtn,
            'inline-flex h-[3.25rem] items-center justify-center gap-1 border-danger/45 bg-danger/10 px-2.5 text-sm text-[#ffb0b0] hover:border-danger/75 hover:bg-danger/30 min-[900px]:col-span-2 min-[900px]:h-auto min-[900px]:py-2'
          )}
          onClick={onNew}
          title={t('starter.newTitle')}
        >
          <RotateCcw className="h-[0.95em] w-[0.95em] shrink-0" aria-hidden />
          <span className="truncate">{t('starter.new')}</span>
        </button>
      </div>
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
        'relative flex h-[3.25rem] w-full flex-col items-center justify-center rounded-lg border-2 bg-[#1a1a1e] transition-colors min-[900px]:h-[4.25rem]',
        active
          ? 'border-[#3a7ae2] shadow-[0_0_0_1px_#3a7ae2,0_0_12px_rgba(58,122,226,0.35)]'
          : 'border-[#333] hover:border-[#555]',
        disabled && 'cursor-default opacity-50'
      )}
    >
      <span className="absolute top-0.5 left-1 font-mono text-[0.6rem] font-bold text-muted min-[900px]:top-1 min-[900px]:left-1.5 min-[900px]:text-[0.65rem]">
        {n}
      </span>
      <span className="scale-90 min-[900px]:scale-100">{children}</span>
      <span className="mt-0 font-mono text-[0.5rem] text-muted min-[900px]:mt-0.5 min-[900px]:text-[0.55rem]">
        {label}
      </span>
    </button>
  )
}

function ProbeIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-6 w-6 min-[900px]:h-8 min-[900px]:w-8" aria-hidden>
      <circle cx="20" cy="20" r="11" fill="none" stroke="#e24a4a" strokeWidth="3.5" />
      <circle cx="20" cy="20" r="4" fill="#e24a4a" />
    </svg>
  )
}

function JumperIcon() {
  return (
    <svg viewBox="0 0 48 40" className="h-6 w-8 min-[900px]:h-8 min-[900px]:w-10" aria-hidden>
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
