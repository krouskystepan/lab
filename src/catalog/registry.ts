import type { LucideIcon } from 'lucide-react'
import {
  Bomb,
  BookOpen,
  Box,
  Brain,
  Calculator,
  Car,
  Crown,
  Flag,
  FlaskConical,
  Globe2,
  Grid3x3,
  Keyboard,
  Languages,
  Layers,
  Lightbulb,
  Puzzle
} from 'lucide-react'
import type { MessageKey } from '../i18n'
import {
  type AppTheme,
  hubTheme,
  mineHelperTheme,
  minesweeperTheme,
  sudokuTheme,
  wordleTheme,
  chessMateTheme,
  rushHourTheme,
  lightsOutTheme,
  geoQuizTheme
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
    id: 'queens',
    kind: 'game',
    path: '/games/queens',
    titleKey: 'catalog.queens.title',
    blurbKey: 'catalog.queens.blurb',
    icon: Crown,
    theme: {
      accent: '#b8860b',
      accentHover: '#cfa012',
      onAccent: '#fff8e0'
    },
    status: 'soon'
  },
  {
    id: 'set',
    kind: 'game',
    path: '/games/set',
    titleKey: 'catalog.set.title',
    blurbKey: 'catalog.set.blurb',
    icon: Layers,
    theme: {
      accent: '#9b59b6',
      accentHover: '#ad6fc7',
      onAccent: '#f5e8fb'
    },
    status: 'soon'
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
    id: 'sokoban',
    kind: 'game',
    path: '/games/sokoban',
    titleKey: 'catalog.sokoban.title',
    blurbKey: 'catalog.sokoban.blurb',
    icon: Box,
    theme: {
      accent: '#8b6914',
      accentHover: '#a07a1c',
      onAccent: '#fff6dc'
    },
    status: 'soon'
  },
  {
    id: 'logic-grid',
    kind: 'game',
    path: '/games/logic-grid',
    titleKey: 'catalog.logicGrid.title',
    blurbKey: 'catalog.logicGrid.blurb',
    icon: Puzzle,
    theme: {
      accent: '#2ec8c0',
      accentHover: '#45d4cd',
      onAccent: '#e0faf8'
    },
    status: 'soon'
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
    theme: {
      accent: '#3d7a9a',
      accentHover: '#4e8bab',
      onAccent: '#e5f2f8'
    },
    status: 'soon'
  },
  {
    id: 'periodic-quiz',
    kind: 'game',
    path: '/games/periodic-quiz',
    titleKey: 'catalog.periodicQuiz.title',
    blurbKey: 'catalog.periodicQuiz.blurb',
    icon: FlaskConical,
    theme: {
      accent: '#6b4fa0',
      accentHover: '#7d61b2',
      onAccent: '#f0e8fa'
    },
    status: 'soon'
  },
  {
    id: 'flashcards',
    kind: 'game',
    path: '/games/flashcards',
    titleKey: 'catalog.flashcards.title',
    blurbKey: 'catalog.flashcards.blurb',
    icon: BookOpen,
    theme: {
      accent: '#8a5a3a',
      accentHover: '#9b6b4b',
      onAccent: '#f8eee5'
    },
    status: 'soon'
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
    theme: {
      accent: '#3d7a9a',
      accentHover: '#4e8bab',
      onAccent: '#e5f2f8'
    },
    status: 'soon'
  },
  {
    id: 'conjugation',
    kind: 'solver',
    path: '/solvers/conjugation',
    titleKey: 'catalog.conjugation.title',
    blurbKey: 'catalog.conjugation.blurb',
    icon: Languages,
    theme: {
      accent: '#8a4a5a',
      accentHover: '#9b5b6b',
      onAccent: '#f8e8ec'
    },
    status: 'soon'
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
