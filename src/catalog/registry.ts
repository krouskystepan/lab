import type { LucideIcon } from 'lucide-react'
import {
  Bomb,
  Brain,
  Calculator,
  Car,
  Crown,
  Flag,
  FlipHorizontal2,
  Globe2,
  Grid3x3,
  Keyboard,
  Lightbulb
} from 'lucide-react'
import type { MessageKey } from '../i18n'
import {
  type AppTheme,
  hubTheme,
  mineHelperTheme,
  minesweeperTheme,
  mirrorHelperTheme,
  sudokuTheme,
  wordleTheme,
  chessMateTheme,
  rushHourTheme,
  lightsOutTheme,
  geoQuizTheme,
  mentalMathTheme,
  equationStepsTheme
} from '../shared/theme'

export type CatalogKind = 'game' | 'solver'

export type CatalogEntry = {
  id: string
  kind: CatalogKind
  /** URL path, e.g. `/solvers/mine-helper` */
  path: string
  titleKey: MessageKey
  blurbKey: MessageKey
  icon: LucideIcon
  theme: AppTheme
  status: 'live' | 'soon'
}

/** Central list of games & solvers. Add new apps here + a route. */
export const catalog: CatalogEntry[] = [
  {
    id: 'minesweeper',
    kind: 'game',
    path: '/games/minesweeper',
    titleKey: 'catalog.minesweeper.title',
    blurbKey: 'catalog.minesweeper.blurb',
    icon: Flag,
    theme: minesweeperTheme,
    status: 'live'
  },
  {
    id: 'sudoku',
    kind: 'game',
    path: '/games/sudoku',
    titleKey: 'catalog.sudoku.title',
    blurbKey: 'catalog.sudoku.blurb',
    icon: Grid3x3,
    theme: sudokuTheme,
    status: 'live'
  },
  {
    id: 'wordle',
    kind: 'game',
    path: '/games/wordle',
    titleKey: 'catalog.wordle.title',
    blurbKey: 'catalog.wordle.blurb',
    icon: Keyboard,
    theme: wordleTheme,
    status: 'live'
  },
  {
    id: 'rush-hour',
    kind: 'game',
    path: '/games/rush-hour',
    titleKey: 'catalog.rushHour.title',
    blurbKey: 'catalog.rushHour.blurb',
    icon: Car,
    theme: rushHourTheme,
    status: 'live'
  },
  {
    id: 'lights-out',
    kind: 'game',
    path: '/games/lights-out',
    titleKey: 'catalog.lightsOut.title',
    blurbKey: 'catalog.lightsOut.blurb',
    icon: Lightbulb,
    theme: lightsOutTheme,
    status: 'live'
  },
  {
    id: 'geo-quiz',
    kind: 'game',
    path: '/games/geo-quiz',
    titleKey: 'catalog.geoQuiz.title',
    blurbKey: 'catalog.geoQuiz.blurb',
    icon: Globe2,
    theme: geoQuizTheme,
    status: 'live'
  },
  {
    id: 'mental-math',
    kind: 'game',
    path: '/games/mental-math',
    titleKey: 'catalog.mentalMath.title',
    blurbKey: 'catalog.mentalMath.blurb',
    icon: Brain,
    theme: mentalMathTheme,
    status: 'live'
  },

  {
    id: 'mine-helper',
    kind: 'solver',
    path: '/solvers/mine-helper',
    titleKey: 'catalog.mineHelper.title',
    blurbKey: 'catalog.mineHelper.blurb',
    icon: Bomb,
    theme: mineHelperTheme,
    status: 'live'
  },
  {
    id: 'mirror-helper',
    kind: 'solver',
    path: '/solvers/mirror-helper',
    titleKey: 'catalog.mirrorHelper.title',
    blurbKey: 'catalog.mirrorHelper.blurb',
    icon: FlipHorizontal2,
    theme: mirrorHelperTheme,
    status: 'live'
  },
  {
    id: 'sudoku-helper',
    kind: 'solver',
    path: '/solvers/sudoku-helper',
    titleKey: 'catalog.sudokuHelper.title',
    blurbKey: 'catalog.sudokuHelper.blurb',
    icon: Grid3x3,
    theme: sudokuTheme,
    status: 'live'
  },
  {
    id: 'chess-mate',
    kind: 'solver',
    path: '/solvers/chess-mate',
    titleKey: 'catalog.chessMate.title',
    blurbKey: 'catalog.chessMate.blurb',
    icon: Crown,
    theme: chessMateTheme,
    status: 'live'
  },
  {
    id: 'equation-steps',
    kind: 'solver',
    path: '/solvers/equation-steps',
    titleKey: 'catalog.equationSteps.title',
    blurbKey: 'catalog.equationSteps.blurb',
    icon: Calculator,
    theme: equationStepsTheme,
    status: 'live'
  }
]

export { hubTheme }

export function entriesByKind(kind: CatalogKind): CatalogEntry[] {
  return catalog.filter((e) => e.kind === kind)
}

export function entryByPath(pathname: string): CatalogEntry | undefined {
  return catalog.find((e) => e.path === pathname)
}

export function themeForPath(pathname: string): AppTheme {
  return entryByPath(pathname)?.theme ?? hubTheme
}
