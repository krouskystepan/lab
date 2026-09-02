import { cn } from '../lib/cn'

/** Outer game layout chrome - height budget vars stay in index.css on `.game-shell`. */
export const gameShell = cn(
  'game-shell',
  'mx-auto flex min-h-0 w-full max-w-275 flex-1 flex-col gap-[0.55rem] overflow-x-clip px-[0.85rem] pt-[0.65rem] pb-3',
  'max-[980px]:mx-0 max-[980px]:max-w-none max-[980px]:w-full max-[980px]:flex-[1_0_auto] max-[980px]:h-auto max-[980px]:min-h-0 max-[980px]:gap-[0.35rem] max-[980px]:pt-1.5 max-[980px]:pb-[0.45rem]',
  'max-[980px]:px-[max(0.35rem,env(safe-area-inset-left,0px))] max-[980px]:pr-[max(0.35rem,env(safe-area-inset-right,0px))]',
  'max-[980px]:landscape:gap-1 max-[980px]:landscape:pt-1 max-[980px]:landscape:pb-[max(0.2rem,env(safe-area-inset-bottom,0px))]'
)

export const gamePage =
  'game-page flex min-h-0 w-full flex-1 flex-col overflow-x-clip'

export const gamePageFit = 'game-page--fit overflow-hidden'

/** Board wrapper flex - keep `.board-stage` / `.with-why` hooks for CQ fit math in CSS. */
export const boardStage = cn(
  'board-stage',
  'flex h-auto min-h-0 min-w-0 w-full items-center justify-center gap-2.5 self-stretch',
  'max-[980px]:h-auto max-[980px]:min-h-0 max-[980px]:w-full max-[980px]:justify-center'
)

export const boardStageWhy = cn(
  boardStage,
  'with-why items-start justify-center'
)

/** Sticky / phone control strip under the board. */
export const gameStickyControls = cn(
  'game-sticky-controls',
  'relative z-20 w-full min-w-0',
  'max-[980px]:z-30 max-[980px]:w-full max-[980px]:min-w-0 max-[980px]:border-t max-[980px]:border-line max-[980px]:bg-bg/95 max-[980px]:pt-1.5 max-[980px]:pb-[max(0.45rem,env(safe-area-inset-bottom))]',
  'max-[980px]:landscape:border-t-0 max-[980px]:landscape:pt-[0.2rem] max-[980px]:landscape:pb-[max(0.15rem,env(safe-area-inset-bottom))]',
  'max-[980px]:[&>*]:w-full max-[980px]:[&>*]:max-w-none max-[980px]:[&>*]:min-w-0'
)
