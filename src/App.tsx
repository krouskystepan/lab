import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import MineHelperApp from './apps/mine-helper/MineHelperApp'
import MinesweeperApp from './apps/minesweeper/MinesweeperApp'
import SudokuApp from './apps/sudoku/SudokuApp'
import SudokuHelperApp from './apps/sudoku-helper/SudokuHelperApp'
import WordleApp from './apps/wordle/WordleApp'
import ChessMateApp from './apps/chess-mate/ChessMateApp'
import RushHourApp from './apps/rush-hour/RushHourApp'
import LightsOutApp from './apps/lights-out/LightsOutApp'
import UntangleApp from './apps/untangle/UntangleApp'
import GeoQuizApp from './apps/geo-quiz/GeoQuizApp'
import MentalMathApp from './apps/mental-math/MentalMathApp'
import MirrorHelperApp from './apps/mirror-helper/MirrorHelperApp'
import EquationStepsApp from './apps/equation-steps/EquationStepsApp'
import StarterApp from './apps/starter/StarterApp'
import {
  chessMateTheme,
  equationStepsTheme,
  geoQuizTheme,
  lightsOutTheme,
  untangleTheme,
  mentalMathTheme,
  mineHelperTheme,
  minesweeperTheme,
  mirrorHelperTheme,
  rushHourTheme,
  sudokuTheme,
  wordleTheme,
  starterTheme
} from './shared/theme'
import { gamePage, gamePageFit } from './shared/gameUi'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { HomePage } from './pages/HomePage'
import { AppLayout } from './shell/AppLayout'
import { ThemeScope } from './shell/ThemeScope'

function MineHelperRoute() {
  return (
    <ThemeScope theme={mineHelperTheme} className={gamePage}>
      <MineHelperApp />
    </ThemeScope>
  )
}

function MinesweeperRoute() {
  return (
    <ThemeScope theme={minesweeperTheme} className={gamePage}>
      <MinesweeperApp />
    </ThemeScope>
  )
}

function SudokuRoute() {
  return (
    <ThemeScope theme={sudokuTheme} className={`${gamePage} ${gamePageFit}`}>
      <SudokuApp />
    </ThemeScope>
  )
}

function SudokuHelperRoute() {
  return (
    <ThemeScope theme={sudokuTheme} className={`${gamePage} ${gamePageFit}`}>
      <SudokuHelperApp />
    </ThemeScope>
  )
}

function WordleRoute() {
  return (
    <ThemeScope theme={wordleTheme} className={`${gamePage} ${gamePageFit}`}>
      <WordleApp />
    </ThemeScope>
  )
}

function ChessMateRoute() {
  return (
    <ThemeScope theme={chessMateTheme} className={gamePage}>
      <ChessMateApp />
    </ThemeScope>
  )
}

function RushHourRoute() {
  return (
    <ThemeScope theme={rushHourTheme} className={gamePage}>
      <RushHourApp />
    </ThemeScope>
  )
}

function LightsOutRoute() {
  return (
    <ThemeScope theme={lightsOutTheme} className={gamePage}>
      <LightsOutApp />
    </ThemeScope>
  )
}

function UntangleRoute() {
  return (
    <ThemeScope theme={untangleTheme} className={gamePage}>
      <UntangleApp />
    </ThemeScope>
  )
}

function GeoQuizRoute() {
  return (
    <ThemeScope theme={geoQuizTheme} className={gamePage}>
      <GeoQuizApp />
    </ThemeScope>
  )
}

function MentalMathRoute() {
  return (
    <ThemeScope theme={mentalMathTheme} className={gamePage}>
      <MentalMathApp />
    </ThemeScope>
  )
}

function MirrorHelperRoute() {
  return (
    <ThemeScope theme={mirrorHelperTheme} className={gamePage}>
      <MirrorHelperApp />
    </ThemeScope>
  )
}

function EquationStepsRoute() {
  return (
    <ThemeScope theme={equationStepsTheme} className={gamePage}>
      <EquationStepsApp />
    </ThemeScope>
  )
}

function StarterRoute() {
  return (
    <ThemeScope theme={starterTheme} className={`${gamePage} ${gamePageFit}`}>
      <StarterApp />
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
          <Route path="/games/lights-out" element={<LightsOutRoute />} />
          <Route path="/games/untangle" element={<UntangleRoute />} />
          <Route path="/games/geo-quiz" element={<GeoQuizRoute />} />
          <Route path="/games/mental-math" element={<MentalMathRoute />} />
          <Route path="/games/starter" element={<StarterRoute />} />
          <Route path="/solvers/mine-helper" element={<MineHelperRoute />} />
          <Route path="/solvers/mirror-helper" element={<MirrorHelperRoute />} />
          <Route path="/solvers/sudoku-helper" element={<SudokuHelperRoute />} />
          <Route path="/solvers/chess-mate" element={<ChessMateRoute />} />
          <Route path="/solvers/equation-steps" element={<EquationStepsRoute />} />
          <Route path="/games/:slug" element={<ComingSoonPage />} />
          <Route path="/solvers/:slug" element={<ComingSoonPage />} />
          <Route path="*" element={<ComingSoonPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
