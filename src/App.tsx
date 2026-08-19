import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import MineHelperApp from './apps/mine-helper/MineHelperApp'
import MinesweeperApp from './apps/minesweeper/MinesweeperApp'
import SudokuApp from './apps/sudoku/SudokuApp'
import SudokuHelperApp from './apps/sudoku-helper/SudokuHelperApp'
import WordleApp from './apps/wordle/WordleApp'
import ChessMateApp from './apps/chess-mate/ChessMateApp'
import RushHourApp from './apps/rush-hour/RushHourApp'
import {
  chessMateTheme,
  mineHelperTheme,
  minesweeperTheme,
  rushHourTheme,
  sudokuTheme,
  wordleTheme
} from './shared/theme'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { HomePage } from './pages/HomePage'
import { AppLayout } from './shell/AppLayout'
import { ThemeScope } from './shell/ThemeScope'

function MineHelperRoute() {
  return (
    <ThemeScope theme={mineHelperTheme} className="flex h-full min-h-0 flex-col">
      <MineHelperApp />
    </ThemeScope>
  )
}

function MinesweeperRoute() {
  return (
    <ThemeScope theme={minesweeperTheme} className="flex h-full min-h-0 flex-col">
      <MinesweeperApp />
    </ThemeScope>
  )
}

function SudokuRoute() {
  return (
    <ThemeScope theme={sudokuTheme} className="flex h-full min-h-0 flex-col">
      <SudokuApp />
    </ThemeScope>
  )
}

function SudokuHelperRoute() {
  return (
    <ThemeScope theme={sudokuTheme} className="flex h-full min-h-0 flex-col">
      <SudokuHelperApp />
    </ThemeScope>
  )
}

function WordleRoute() {
  return (
    <ThemeScope theme={wordleTheme} className="flex h-full min-h-0 flex-col">
      <WordleApp />
    </ThemeScope>
  )
}

function ChessMateRoute() {
  return (
    <ThemeScope theme={chessMateTheme} className="flex h-full min-h-0 flex-col">
      <ChessMateApp />
    </ThemeScope>
  )
}

function RushHourRoute() {
  return (
    <ThemeScope theme={rushHourTheme} className="flex h-full min-h-0 flex-col">
      <RushHourApp />
    </ThemeScope>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        theme="dark"
        position="top-center"
        richColors
        closeButton
        gap={8}
        offset={16}
        toastOptions={{
          classNames: {
            toast: 'border border-line shadow-lg'
          }
        }}
      />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/games/minesweeper" element={<MinesweeperRoute />} />
          <Route path="/games/sudoku" element={<SudokuRoute />} />
          <Route path="/games/wordle" element={<WordleRoute />} />
          <Route path="/games/rush-hour" element={<RushHourRoute />} />
          <Route path="/solvers/mine-helper" element={<MineHelperRoute />} />
          <Route path="/solvers/sudoku-helper" element={<SudokuHelperRoute />} />
          <Route path="/solvers/chess-mate" element={<ChessMateRoute />} />
          <Route path="/games/:slug" element={<ComingSoonPage />} />
          <Route path="/solvers/:slug" element={<ComingSoonPage />} />
          <Route path="*" element={<ComingSoonPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
