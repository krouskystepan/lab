import { toast } from 'sonner'

export type AppToastTone = 'info' | 'warn' | 'error'

/** App-wide toast (sonner) - top of screen, not over the board. */
export function showToast(message: string, tone: AppToastTone = 'info'): void {
  const opts = { duration: 4500 }
  if (tone === 'error') toast.error(message, opts)
  else if (tone === 'warn') toast.warning(message, opts)
  else toast.info(message, opts)
}
