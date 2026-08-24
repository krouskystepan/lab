/** Shared board-cell typography — sized from the cell (`cqmin`), not board width. */

export const CELL_GLYPH =
  'absolute inset-0 flex items-center justify-center leading-[0] pointer-events-none text-[clamp(0.45rem,42cqmin,1.1rem)] max-[980px]:text-[clamp(0.4rem,36cqmin,0.95rem)]'

export const CELL_GLYPH_INNER = 'block leading-none -translate-y-[0.08em]'

/** Digit / letter cell base: size container so cqmin tracks the short side. */
export const CELL_SIZE_HOST =
  '[container-type:size] rounded-none text-[clamp(0.45rem,38cqmin,1.05rem)] max-[980px]:text-[clamp(0.4rem,34cqmin,0.95rem)]'

export const MARK_SURE =
  'font-bold tracking-[-0.02em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] text-[clamp(0.3rem,26cqmin,0.72rem)] max-[980px]:text-[clamp(0.28rem,24cqmin,0.62rem)]'

export const MARK_CHANCE =
  'relative flex flex-col items-center justify-center gap-[0.05em] tracking-[-0.02em] font-semibold opacity-[0.72] text-[clamp(0.3rem,26cqmin,0.72rem)] max-[980px]:text-[clamp(0.28rem,24cqmin,0.62rem)]'

export const MARK_CHANCE_TIP =
  'relative flex flex-col items-center justify-center gap-[0.05em] tracking-[-0.02em] font-semibold opacity-100 text-[clamp(0.34rem,30cqmin,0.8rem)] max-[980px]:text-[clamp(0.3rem,27cqmin,0.7rem)]'

export const SUDOKU_NOTES =
  'pointer-events-none absolute inset-[8%] grid grid-cols-3 grid-rows-3 place-items-center text-[clamp(0.28rem,2.1cqmin,0.55rem)] font-semibold leading-none text-muted'

export const SUDOKU_CELL =
  'rounded-none border-[0.5px] text-[clamp(0.7rem,5.5cqmin,1.35rem)] max-[980px]:text-[clamp(0.85rem,8.5cqw,1.5rem)]'

export const WORDLE_CELL =
  '[container-type:size] text-[clamp(0.7rem,52cqmin,1.85rem)] max-[980px]:text-[clamp(0.85rem,12cqw,2rem)]'

export const WORDLE_MARK = {
  correct: 'bg-[#4cbe6a] border-[#6ad184] text-[#f4fff6]',
  present: 'bg-[#e0b03a] border-[#f0c45a] text-[#fff8e4]',
  absent: 'bg-[#3a4450] border-[#4a5562] text-[#d5dde6]',
  tbd: 'bg-cell-hover border-[color-mix(in_srgb,var(--color-ink)_45%,transparent)] text-ink',
  hint: 'bg-[color-mix(in_srgb,var(--color-accent)_16%,var(--color-cell))] border-[color-mix(in_srgb,var(--color-accent)_55%,transparent)] text-[color-mix(in_srgb,var(--color-accent)_85%,white)]',
  empty: 'bg-cell border-line text-ink'
} as const

export const CHESS_SQ = {
  light: 'bg-[#c5cdd8]',
  dark: 'bg-[#4a5568]',
  from: 'shadow-[inset_0_0_0_3px_color-mix(in_srgb,var(--color-accent)_80%,white)]',
  to: 'shadow-[inset_0_0_0_3px_var(--color-accent)]',
  check: 'bg-[color-mix(in_srgb,var(--color-danger)_45%,#4a5568)]'
} as const

/** Tip / conflict rings (Mine Helper solver overlays). */
export const CELL_TIP_BEST =
  'z-[2] !border-2 !border-best shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-best)_70%,#000),0_0_8px_color-mix(in_srgb,var(--color-best)_35%,transparent)]'

export const CELL_TIP_SAFEST =
  'z-[2] !border-2 !border-safest shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-safest)_70%,#000),0_0_8px_color-mix(in_srgb,var(--color-safest)_35%,transparent)]'

export const CELL_TIP_UNCLUED =
  'z-[2] !border-2 !border-unclued shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-unclued)_70%,#000),0_0_8px_color-mix(in_srgb,var(--color-unclued)_35%,transparent)]'

export const CELL_CONFLICT =
  'z-[3] !border-2 !border-danger shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-danger)_55%,#000),0_0_0_3px_color-mix(in_srgb,var(--color-danger)_85%,white),0_0_14px_color-mix(in_srgb,var(--color-danger)_55%,transparent)]'

export const WHY_HL = {
  focus:
    'relative z-[5] !shadow-[inset_0_0_0_3px_#fff]',
  clue:
    'relative z-[4] !shadow-[inset_0_0_0_3px_var(--color-why-clue)]',
  step:
    'relative z-[3] brightness-[1.12] !shadow-[inset_0_0_0_3px_color-mix(in_srgb,var(--color-why-clue)_85%,white)]',
  peer:
    'relative z-[2] !shadow-[inset_0_0_0_3px_var(--color-why-peer)]',
  cursor: 'relative z-[1] !border-2 !border-white !shadow-none'
} as const
