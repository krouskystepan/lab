import { useRef } from 'react'
import { Download, Upload } from 'lucide-react'
import { useI18n } from '../../i18n'
import { cn } from '../lib/cn'
import { showToast } from '../toast'
import { downloadJson, parseBoardFile, readFileAsText } from './types'
import type { BoardFamily, BoardFile } from './types'

/** Match LangSwitch: one segmented shell, flush icon cells. */
const segBtn =
  'cursor-pointer appearance-none inline-flex h-[1.7rem] items-center justify-center gap-1 rounded-none border-0 px-[0.45rem] text-[0.68rem] font-bold tracking-[0.04em] text-muted transition-[background,color] duration-100 hover:bg-cell-hover hover:text-ink'

const iconCls = 'h-[0.85em] w-[0.85em] shrink-0'

export type BoardImportResult =
  | { ok: true }
  | { ok: false; reason: 'wrong_family' | 'invalid' | 'failed' }

type ExportImportButtonsProps = {
  /** Download basename, e.g. `minesweeper-board.json` */
  filename: string
  family: BoardFamily
  onExport: () => BoardFile
  onImport: (file: BoardFile) => BoardImportResult
  className?: string
}

/** Header Export / Import - same chrome as language switch. */
export function ExportImportButtons({
  filename,
  family,
  onExport,
  onImport,
  className
}: ExportImportButtonsProps) {
  const { t } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      const data = onExport()
      downloadJson(filename, data)
      showToast(t('transfer.exported'), 'info')
    } catch {
      showToast(t('transfer.exportFailed'), 'error')
    }
  }

  const handlePicked = async (file: File | undefined) => {
    if (!file) return
    try {
      const text = await readFileAsText(file)
      const data = parseBoardFile(text)
      if (data.family !== family) {
        showToast(t('transfer.wrongFamily'), 'error')
        return
      }
      const result = onImport(data)
      if (!result.ok) {
        showToast(
          result.reason === 'wrong_family'
            ? t('transfer.wrongFamily')
            : t('transfer.importFailed'),
          'error'
        )
        return
      }
      showToast(t('transfer.imported'), 'info')
    } catch {
      showToast(t('transfer.importFailed'), 'error')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div
      className={cn(
        'inline-flex h-[1.7rem] shrink-0 overflow-hidden rounded-sm border border-line bg-cell',
        className
      )}
      role="group"
      aria-label={`${t('transfer.export')} / ${t('transfer.import')}`}
    >
      <button
        type="button"
        className={segBtn}
        onClick={handleExport}
        title={t('transfer.exportTitle')}
        aria-label={t('transfer.export')}
      >
        <Download className={iconCls} aria-hidden />
        <span className="max-[980px]:hidden">{t('transfer.export')}</span>
      </button>
      <button
        type="button"
        className={segBtn}
        onClick={() => inputRef.current?.click()}
        title={t('transfer.importTitle')}
        aria-label={t('transfer.import')}
      >
        <Upload className={iconCls} aria-hidden />
        <span className="max-[980px]:hidden">{t('transfer.import')}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => void handlePicked(e.target.files?.[0])}
      />
    </div>
  )
}
