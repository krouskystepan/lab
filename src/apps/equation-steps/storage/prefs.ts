import { DEFAULT_INPUT } from '../solver/presets'

const KEY = 'equation-steps.input.v1'

export type Saved = {
  version: 1
  input: string
}

function fallback(): Saved {
  return { version: 1, input: DEFAULT_INPUT }
}

export function loadInput(): string {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fallback().input
    const parsed = JSON.parse(raw) as Partial<Saved>
    if (typeof parsed.input === 'string' && parsed.input.trim()) {
      return parsed.input
    }
    return fallback().input
  } catch {
    return fallback().input
  }
}

export function saveInput(input: string): void {
  try {
    const payload: Saved = { version: 1, input }
    localStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}
