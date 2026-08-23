import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bomb } from 'lucide-react'
import { BoardTools } from './components/BoardTools'
import { GoalModeToggle } from './components/GoalModeToggle'
import { Grid } from './components/Grid'
import { HotkeysBar } from './components/HotkeysBar'
import { LegendMenu } from './components/LegendMenu'
import { LegendStrip } from './components/LegendStrip'
import { SizeBar, type GridEdge } from './components/SizeBar'
import { NumberPad } from './components/NumberPad'
import { Toolbar } from './components/Toolbar'
import { WhyPanel } from './components/WhyPanel'
import { PlaceBlockedDialog } from './components/PlaceBlockedDialog'
import { attachWhyHints, explainCell } from './solver/explain'
import { solve } from './solver/solve'
import { countKnownTargets, validatePlacement } from './solver/validate'
import type {
  BoardCell,
  CellAspect,
  EditMode,
  GoalMode,
  NumberRole
} from './solver/types'
import { primaryNumberRole } from './solver/types'
import { BoardHistory, type BoardSnapshot } from './storage/boardHistory'
import {
  emptyBoard,
  loadBoard,
  saveBoard,
  type SavedBoard
} from './storage/gameStore'
import { showToast } from '../../shared/toast'
import {
  ExportImportButtons,
  exportMineHelperBoard,
  importMinesweeperToHelper,
  type BoardFile,
  type BoardImportResult
} from '../../shared/boardTransfer'
import {
  MobileHelpCard,
  boardStage,
  boardStageWhy,
  gameShell,
  gameStickyControls
} from '../../shared/gameUi'
import {
  flipBoardHorizontal,
  flipBoardVertical,
  padBoard,
  resizeBoard,
  countShiftCrop,
  shiftBoard,
  trimEmptyEdges
} from './storage/resizeBoard'
import {
  loadGoalMode,
  loadWhyMode,
  saveGoalMode,
  saveWhyMode
} from './storage/prefs'
import type { Placement } from './solver/validate'
import { useI18n } from '../../i18n'
import { LangSwitch } from '../../shell/LangSwitch'

function clearSolverOnBoard(board: BoardCell[]): BoardCell[] {
  return board.map((c) => ({ user: c.user }))
}

function paintSolveMarks(
  board: BoardCell[],
  width: number,
  height: number,
  useTotal: boolean,
  totalTargets: number,
  goalMode: GoalMode
): BoardCell[] {
  const userCells = board.map((c) => c.user)
  const total = useTotal ? totalTargets : undefined
  const result = solve({
    width,
    height,
    cells: userCells,
    totalTargets: total,
    goalMode
  })

  if (!result.ok) {
    const base = clearSolverOnBoard(board)
    if (result.error === 'contradiction' && result.conflictCells) {
      for (const i of result.conflictCells) {
        if (i < 0 || i >= base.length) continue
        base[i] = { ...base[i], solver: { kind: 'conflict' } }
      }
    }
    showToast(result.message, 'error')
    return base
  }

  const base = clearSolverOnBoard(board)
  for (const [i, mark] of result.marks) {
    base[i] = { ...base[i], solver: mark }
  }
  const withWhy = attachWhyHints(base, width, height, total, goalMode)
  if (result.notice) {
    showToast(result.notice, result.noticeTone ?? 'info')
  }
  return withWhy
}

export default function MineHelperApp() {
  const { t, locale } = useI18n()
  const [saved] = useState<SavedBoard>(() => loadBoard())

  const [width, setWidth] = useState(saved.width)
  const [height, setHeight] = useState(saved.height)
  const [cellAspect, setCellAspect] = useState<CellAspect>(
    saved.cellAspect ?? 'card'
  )
  const [cells, setCells] = useState<BoardCell[]>(saved.cells)
  const [mode, setMode] = useState<EditMode>(() => {
    const m = saved.mode
    const goal = loadGoalMode()
    if (goal === 'safe' && m === 'info') return 'number'
    if (goal === 'hunt' && m === 'flag') return 'number'
    return m
  })
  const [numberValue, setNumberValue] = useState<number | null>(() => {
    if (loadGoalMode() === 'safe' && saved.numberValue == null) return 1
    return saved.numberValue
  })
  const [useTotal, setUseTotal] = useState(saved.useTotal)
  const [totalTargets, setTotalTargets] = useState(saved.totalTargets)
  const [autoSolve, setAutoSolve] = useState(false)
  const [placeBlocked, setPlaceBlocked] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [explainIndex, setExplainIndex] = useState<number | null>(null)
  const [whyStep, setWhyStep] = useState(0)
  const [cursorIndex, setCursorIndex] = useState<number | null>(null)
  /** Sticky white outline only while navigating with arrow keys (not after mouse click). */
  const [keyboardCursor, setKeyboardCursor] = useState(false)
  const [whyMode, setWhyMode] = useState(loadWhyMode)
  const [goalMode, setGoalMode] = useState<GoalMode>(loadGoalMode)
  const historyRef = useRef(new BoardHistory())
  const cellsRef = useRef(cells)
  cellsRef.current = cells
  const cursorRef = useRef(cursorIndex)
  cursorRef.current = cursorIndex
  const modeRef = useRef(mode)
  modeRef.current = mode
  const goalModeRef = useRef(goalMode)
  goalModeRef.current = goalMode
  const numberValueRef = useRef(numberValue)
  numberValueRef.current = numberValue
  const widthRef = useRef(width)
  widthRef.current = width
  const heightRef = useRef(height)
  heightRef.current = height
  const useTotalRef = useRef(useTotal)
  useTotalRef.current = useTotal
  const totalTargetsRef = useRef(totalTargets)
  totalTargetsRef.current = totalTargets
  const explainRef = useRef(explainIndex)
  explainRef.current = explainIndex
  const whyModeRef = useRef(whyMode)
  whyModeRef.current = whyMode
  const onWhyModeRef = useRef<() => void>(() => {})
  const onSolveRef = useRef<() => void>(() => {})

  const syncHistoryFlags = useCallback(() => {
    setCanUndo(historyRef.current.canUndo)
    setCanRedo(historyRef.current.canRedo)
  }, [])

  const currentSnapshot = useCallback((): BoardSnapshot => {
    return { width, height, cellAspect, cells }
  }, [width, height, cellAspect, cells])

  const applySnapshot = useCallback((snap: BoardSnapshot) => {
    setWidth(snap.width)
    setHeight(snap.height)
    setCellAspect(snap.cellAspect)
    setCells(snap.cells)
  }, [])

  // Mark ready after first paint so we don't overwrite storage with defaults
  useEffect(() => {
    setHydrated(true)
  }, [])

  // Persist Why mode across refresh
  useEffect(() => {
    if (!hydrated) return
    saveWhyMode(whyMode)
  }, [whyMode, hydrated])

  useEffect(() => {
    if (!hydrated) return
    saveGoalMode(goalMode)
  }, [goalMode, hydrated])

  // If Why was on last session, ensure solve marks exist for the panel
  useEffect(() => {
    if (!hydrated || !whyMode) return
    if (cellsRef.current.some((c) => c.solver != null)) return
    const painted = paintSolveMarks(
      cellsRef.current,
      widthRef.current,
      heightRef.current,
      useTotalRef.current,
      totalTargetsRef.current,
      goalModeRef.current
    )
    setCells(painted)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once after hydrate
  }, [hydrated])

  const pushHistory = useCallback(() => {
    historyRef.current.push(currentSnapshot())
    syncHistoryFlags()
  }, [currentSnapshot, syncHistoryFlags])

  const onUndo = useCallback(() => {
    const prev = historyRef.current.undo(currentSnapshot())
    if (!prev) return
    applySnapshot(prev)
    syncHistoryFlags()
  }, [currentSnapshot, applySnapshot, syncHistoryFlags])

  const onRedo = useCallback(() => {
    const next = historyRef.current.redo(currentSnapshot())
    if (!next) return
    applySnapshot(next)
    syncHistoryFlags()
  }, [currentSnapshot, applySnapshot, syncHistoryFlags])

  // Keep cursor on the board when size changes
  useEffect(() => {
    setCursorIndex((prev) => {
      if (prev == null) return prev
      if (prev >= width * height) return 0
      return prev
    })
  }, [width, height])

  // Persist the single board whenever it changes
  useEffect(() => {
    if (!hydrated) return
    saveBoard({
      width,
      height,
      cellAspect,
      cells,
      mode,
      numberValue,
      useTotal,
      totalTargets
    })
  }, [
    hydrated,
    width,
    height,
    cellAspect,
    cells,
    mode,
    numberValue,
    useTotal,
    totalTargets
  ])

  const commitBoard = useCallback(
    (
      nextCells: BoardCell[],
      dims?: { width: number; height: number },
      opts?: { skipAuto?: boolean }
    ) => {
      const w = dims?.width ?? width
      const h = dims?.height ?? height
      if (dims) {
        setWidth(dims.width)
        setHeight(dims.height)
      }
      if (autoSolve && !opts?.skipAuto) {
        const painted = paintSolveMarks(
          nextCells,
          w,
          h,
          useTotal,
          totalTargets,
          goalMode
        )
        setCells(painted)
      } else {
        setCells(nextCells)
      }
    },
    [width, height, autoSolve, useTotal, totalTargets, goalMode]
  )

  const applyUserEdit = useCallback(
    (
      index: number,
      placement: Placement,
      opts?: { toggleOff?: boolean }
    ): boolean => {
      if (whyModeRef.current) {
        return false
      }
      const board = cellsRef.current
      const w = widthRef.current
      const h = heightRef.current
      if (index < 0 || index >= board.length) return false

      const userCells = board.map((c) => c.user)
      const current = userCells[index]

      if (placement.type === 'empty') {
        pushHistory()
        const next = clearSolverOnBoard(board)
        next[index] = { user: { type: 'empty' } }
        commitBoard(next)
        return true
      }

      if (opts?.toggleOff) {
        if (placement.type === 'flagged' && current.type === 'flagged') {
          pushHistory()
          const next = clearSolverOnBoard(board)
          next[index] = { user: { type: 'empty' } }
          commitBoard(next)
          return true
        }
        if (placement.type === 'blank' && current.type === 'blank') {
          pushHistory()
          const next = clearSolverOnBoard(board)
          next[index] = { user: { type: 'empty' } }
          commitBoard(next)
          return true
        }
        if (
          placement.type === 'number' &&
          current.type === 'number' &&
          current.value === placement.value &&
          current.role === placement.role
        ) {
          pushHistory()
          const next = clearSolverOnBoard(board)
          next[index] = { user: { type: 'empty' } }
          commitBoard(next)
          return true
        }
      }

      const reason = validatePlacement(w, h, userCells, index, placement, {
        totalTargets: useTotalRef.current ? totalTargetsRef.current : undefined
      })
      if (reason) {
        setPlaceBlocked(reason)
        try {
          navigator.vibrate?.(18)
        } catch {
          /* ignore */
        }
        return false
      }

      pushHistory()
      const next = clearSolverOnBoard(board)
      if (placement.type === 'number') {
        next[index] = {
          user: {
            type: 'number',
            value: placement.value,
            role: placement.role
          }
        }
      } else if (placement.type === 'flagged') {
        next[index] = { user: { type: 'flagged' } }
      } else if (placement.type === 'blank') {
        next[index] = { user: { type: 'blank' } }
      }
      commitBoard(next)
      return true
    },
    [pushHistory, commitBoard]
  )

  const applyCurrentToolAt = useCallback(
    (index: number) => {
      const m = modeRef.current
      const n = numberValueRef.current
      const goal = goalModeRef.current
      if (m === 'erase') {
        applyUserEdit(index, { type: 'empty' })
        return
      }
      if (m === 'flag') {
        applyUserEdit(index, { type: 'flagged' }, { toggleOff: true })
        return
      }
      if (m === 'blank') {
        applyUserEdit(index, { type: 'blank' }, { toggleOff: true })
        return
      }
      // Avoid: Safe # = classic revealed safe (info). Hunt: Moje # / Info #.
      const role: NumberRole =
        goal === 'safe'
          ? primaryNumberRole('safe')
          : m === 'info'
            ? 'info'
            : 'mine'
      // Classic MS numbers always need a digit (no ?)
      if (goal === 'safe' && n == null) return
      applyUserEdit(
        index,
        { type: 'number', value: n, role },
        { toggleOff: true }
      )
    },
    [applyUserEdit]
  )

  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null) => {
      const tag = (el as HTMLElement | null)?.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return

      const targetTag = (e.target as HTMLElement | null)?.tagName
      const onButton = targetTag === 'BUTTON' || targetTag === 'A'

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) onRedo()
        else onUndo()
        return
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return

      const key = e.key.toLowerCase()

      if (key === 'w') {
        e.preventDefault()
        onWhyModeRef.current()
        return
      }

      if (key === 's') {
        e.preventDefault()
        onSolveRef.current()
        return
      }

      const w = widthRef.current
      const h = heightRef.current
      const size = w * h
      let cursor = cursorRef.current

      const ensureCursor = () => {
        if (cursor == null || cursor < 0 || cursor >= size) {
          cursor = 0
          setCursorIndex(0)
        }
        return cursor
      }

      if (
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown'
      ) {
        e.preventDefault()
        const i = ensureCursor()
        const x = i % w
        const y = Math.floor(i / w)
        let nx = x
        let ny = y
        if (e.key === 'ArrowLeft') nx = Math.max(0, x - 1)
        if (e.key === 'ArrowRight') nx = Math.min(w - 1, x + 1)
        if (e.key === 'ArrowUp') ny = Math.max(0, y - 1)
        if (e.key === 'ArrowDown') ny = Math.min(h - 1, y + 1)
        setKeyboardCursor(true)
        setCursorIndex(ny * w + nx)
        return
      }

      if (onButton) return

      // Why mode: explain any cell
      if (whyModeRef.current) {
        if (key === 'enter' || key === ' ') {
          e.preventDefault()
          const i = ensureCursor()
          setExplainIndex((prev) => (prev === i ? null : i))
        }
        return
      }

      if (key === 'f') {
        e.preventDefault()
        // Avoid: Vlajka = mine. Hunt: Označené is solver-only.
        if (goalModeRef.current === 'hunt') return
        const i = ensureCursor()
        setMode('flag')
        applyUserEdit(i, { type: 'flagged' }, { toggleOff: true })
        return
      }

      if (key === 'b') {
        e.preventDefault()
        const i = ensureCursor()
        setMode('blank')
        applyUserEdit(i, { type: 'blank' }, { toggleOff: true })
        return
      }

      if (key === 'i') {
        // Avoid: no Info tool (Safe # is the only number).
        if (goalModeRef.current === 'safe') return
        e.preventDefault()
        setMode((m) => (m === 'info' ? 'number' : 'info'))
        return
      }

      if (
        key === 'backspace' ||
        key === 'delete' ||
        key === 'x' ||
        key === 'e'
      ) {
        e.preventDefault()
        const i = ensureCursor()
        setMode('erase')
        applyUserEdit(i, { type: 'empty' })
        return
      }

      if (key === 'enter' || key === ' ') {
        e.preventDefault()
        const i = ensureCursor()
        const mark = cellsRef.current[i]?.solver
        if (mark?.kind === 'chance' || mark?.kind === 'target') {
          if (explainRef.current !== i) {
            setExplainIndex(i)
            return
          }
          setExplainIndex(null)
        }
        applyCurrentToolAt(i)
        return
      }

      if (/^[0-8]$/.test(e.key)) {
        e.preventDefault()
        const value = Number(e.key)
        const i = ensureCursor()
        const goal = goalModeRef.current
        const role: NumberRole =
          goal === 'safe'
            ? primaryNumberRole('safe')
            : modeRef.current === 'info' || e.shiftKey
              ? 'info'
              : 'mine'
        setNumberValue(value)
        setMode(role === 'info' && goal === 'hunt' ? 'info' : 'number')
        applyUserEdit(i, { type: 'number', value, role }, { toggleOff: true })
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onUndo, onRedo, applyUserEdit, applyCurrentToolAt])

  // Re-solve when Auto turns on or Total settings change
  useEffect(() => {
    if (!hydrated || !autoSolve) return
    const painted = paintSolveMarks(
      cells,
      width,
      height,
      useTotal,
      totalTargets,
      goalMode
    )
    setCells(painted)
    // intentionally omit cells - board edits call commitBoard
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSolve, useTotal, totalTargets, goalMode, hydrated])

  const explanation = useMemo(() => {
    if (explainIndex == null) return null
    return explainCell(
      {
        width,
        height,
        cells: cells.map((c) => c.user),
        totalTargets: useTotal ? totalTargets : undefined,
        goalMode
      },
      explainIndex,
      cells
    )
  }, [
    explainIndex,
    cells,
    width,
    height,
    useTotal,
    totalTargets,
    goalMode,
    locale
  ])

  // Re-localize why hints when language changes
  useEffect(() => {
    if (!hydrated) return
    setCells((prev) => {
      if (!prev.some((c) => c.solver)) return prev
      return attachWhyHints(
        prev,
        width,
        height,
        useTotal ? totalTargets : undefined,
        goalMode
      )
    })
    // intentionally omit board size / totals - only re-translate existing marks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, hydrated, goalMode])

  useEffect(() => {
    document.title = t('appName')
  }, [t, locale])

  const whyClues = useMemo(() => {
    if (!explanation) return undefined
    const clueSet = new Set(explanation.clueCells)
    const focus = explanation.cellIndex

    if (whyStep < 0) {
      // Mark all: every related clue
      const active = new Set<number>()
      for (const i of clueSet) {
        if (i !== focus) active.add(i)
      }
      return active.size > 0 ? active : undefined
    }

    const step = explanation.steps[whyStep]
    if (!step?.cells?.length) return undefined
    const active = new Set<number>()
    for (const i of step.cells) {
      if (clueSet.has(i) && i !== focus) active.add(i)
    }
    return active.size > 0 ? active : undefined
  }, [explanation, whyStep])

  const whyPeers = useMemo(() => {
    if (!explanation) return undefined
    const clueSet = new Set(explanation.clueCells)
    const focus = explanation.cellIndex

    if (whyStep < 0) {
      // Mark all: every linked peer
      const active = new Set<number>()
      for (const i of explanation.peerCells) {
        if (i !== focus && !clueSet.has(i)) active.add(i)
      }
      return active.size > 0 ? active : undefined
    }

    const step = explanation.steps[whyStep]
    if (!step?.cells?.length) return undefined
    const active = new Set<number>()
    for (const i of step.cells) {
      if (i === focus) continue
      if (clueSet.has(i)) continue
      active.add(i)
    }
    return active.size > 0 ? active : undefined
  }, [explanation, whyStep])

  // Drop explanation if the focused index is off the board
  useEffect(() => {
    if (explainIndex == null) return
    if (explainIndex < 0 || explainIndex >= cells.length) {
      setExplainIndex(null)
    }
  }, [cells, explainIndex])

  useEffect(() => {
    setWhyStep(0)
  }, [explainIndex])

  useEffect(() => {
    if (explainIndex == null) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExplainIndex(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [explainIndex])

  const onSizeChange = useCallback(
    (w: number, h: number) => {
      if (whyModeRef.current) {
        return
      }
      pushHistory()
      const next = resizeBoard(cells, width, height, w, h)
      commitBoard(next.cells, { width: next.width, height: next.height })
    },
    [cells, width, height, pushHistory, commitBoard]
  )

  const onCellAspectChange = useCallback(
    (aspect: CellAspect) => {
      if (aspect === cellAspect) return
      if (whyModeRef.current) {
        return
      }
      pushHistory()
      setCellAspect(aspect)
    },
    [cellAspect, pushHistory]
  )

  const onGoalModeChange = useCallback((next: GoalMode) => {
    setGoalMode(next)
    const m = modeRef.current
    // Avoid tools: Safe # + Flag + Safe. Hunt: Moje # + Info + Vyřazené.
    if (next === 'safe' && m === 'info') {
      setMode('number')
    }
    if (next === 'hunt' && m === 'flag') {
      setMode('number')
    }
    // Avoid has no ? number
    if (next === 'safe' && numberValueRef.current == null) {
      setNumberValue(1)
    }
  }, [])

  const onPadEdge = useCallback(
    (edge: GridEdge, delta: 1 | -1) => {
      if (whyModeRef.current) {
        return
      }
      pushHistory()
      const next = padBoard(cells, width, height, { [edge]: delta })
      commitBoard(next.cells, { width: next.width, height: next.height })
    },
    [cells, width, height, pushHistory, commitBoard]
  )

  const onShift = useCallback(
    (dx: number, dy: number) => {
      if (whyModeRef.current) {
        return
      }
      const cropped = countShiftCrop(cells, width, height, dx, dy)
      if (
        cropped > 0 &&
        !window.confirm(t('board.shiftCropConfirm', { n: cropped }))
      ) {
        return
      }
      pushHistory()
      commitBoard(shiftBoard(cells, width, height, dx, dy))
    },
    [cells, width, height, pushHistory, commitBoard, t]
  )

  const onFlipHorizontal = useCallback(() => {
    if (whyModeRef.current) {
      return
    }
    pushHistory()
    commitBoard(flipBoardHorizontal(cells, width, height))
  }, [cells, width, height, pushHistory, commitBoard])

  const onFlipVertical = useCallback(() => {
    if (whyModeRef.current) {
      return
    }
    pushHistory()
    commitBoard(flipBoardVertical(cells, width, height))
  }, [cells, width, height, pushHistory, commitBoard])

  const onTrimEmpty = useCallback(() => {
    if (whyModeRef.current) {
      return
    }
    pushHistory()
    const next = trimEmptyEdges(cells, width, height)
    commitBoard(next.cells, { width: next.width, height: next.height })
  }, [cells, width, height, pushHistory, commitBoard])

  const onCellClear = useCallback(
    (index: number) => {
      if (whyModeRef.current) {
        return
      }
      setKeyboardCursor(false)
      setCursorIndex(index)
      applyUserEdit(index, { type: 'empty' })
    },
    [applyUserEdit]
  )

  const onCellClick = useCallback(
    (index: number) => {
      setKeyboardCursor(false)
      setCursorIndex(index)

      if (whyMode) {
        setExplainIndex((prev) => (prev === index ? null : index))
        return
      }

      if (explainIndex != null) setExplainIndex(null)
      applyCurrentToolAt(index)
    },
    [explainIndex, whyMode, applyCurrentToolAt]
  )

  const onSolve = useCallback(() => {
    pushHistory()
    const painted = paintSolveMarks(
      cells,
      width,
      height,
      useTotal,
      totalTargets,
      goalMode
    )
    setCells(painted)
    setExplainIndex(null)
  }, [cells, width, height, useTotal, totalTargets, goalMode, pushHistory])

  const onWhyMode = useCallback(() => {
    if (whyMode) {
      setWhyMode(false)
      setExplainIndex(null)
      return
    }

    const hasMarks = cells.some((c) => c.solver != null)
    if (!hasMarks) {
      pushHistory()
      const painted = paintSolveMarks(
        cells,
        width,
        height,
        useTotal,
        totalTargets,
        goalMode
      )
      setCells(painted)
    }
    setExplainIndex(null)
    setWhyMode(true)
  }, [
    whyMode,
    cells,
    width,
    height,
    useTotal,
    totalTargets,
    goalMode,
    pushHistory
  ])

  onWhyModeRef.current = onWhyMode
  onSolveRef.current = onSolve

  const knownFound = useMemo(
    () =>
      countKnownTargets(
        cells.map((c) => c.user),
        goalMode
      ),
    [cells, goalMode]
  )

  const onClearBoard = useCallback(() => {
    pushHistory()
    setWhyMode(false)
    setExplainIndex(null)
    commitBoard(emptyBoard(width, height))
  }, [width, height, pushHistory, commitBoard])

  const onExportBoard = useCallback(
    () =>
      exportMineHelperBoard({
        width: widthRef.current,
        height: heightRef.current,
        cells: cellsRef.current.map((c) => c.user),
        totalTargets: useTotalRef.current ? totalTargetsRef.current : undefined
      }),
    []
  )

  const onImportBoard = useCallback(
    (file: BoardFile): BoardImportResult => {
      if (file.family !== 'minesweeper') {
        return { ok: false, reason: 'wrong_family' }
      }
      try {
        const parsed = importMinesweeperToHelper(file)
        pushHistory()
        setWhyMode(false)
        setExplainIndex(null)
        if (parsed.totalTargets != null) {
          setUseTotal(true)
          setTotalTargets(parsed.totalTargets)
        }
        commitBoard(
          parsed.users.map((user) => ({ user })),
          { width: parsed.width, height: parsed.height },
          { skipAuto: !autoSolve }
        )
        return { ok: true }
      } catch {
        return { ok: false, reason: 'invalid' }
      }
    },
    [pushHistory, commitBoard, autoSolve]
  )

  return (
    <div className={gameShell}>
      <header className="order-0 flex shrink-0 flex-col gap-1.5">
        <div className="flex w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
          <div className="flex min-w-0 items-center gap-[0.55rem]">
            <Link
              to="/"
              className="inline-flex h-[1.35rem] w-[1.35rem] shrink-0 items-center justify-center rounded-full bg-accent text-ink no-underline shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-accent)_35%,transparent),0_0_12px_color-mix(in_srgb,var(--color-accent)_40%,transparent)]"
              aria-label={t('hub.backHome')}
              title={t('hub.backHome')}
            >
              <Bomb className="h-[0.85rem] w-[0.85rem]" strokeWidth={2.25} />
            </Link>
            <h1 className="m-0 truncate text-[1.15rem] font-bold tracking-[-0.03em] max-[720px]:text-base [@media(max-height:700px)]:text-base">
              {t('appName')}
            </h1>
          </div>
          <div className="ml-auto flex min-w-0 max-w-full flex-wrap items-center justify-end gap-[0.45rem]">
            <ExportImportButtons
              filename="minesweeper-board.json"
              family="minesweeper"
              onExport={onExportBoard}
              onImport={onImportBoard}
            />
            <LangSwitch />
            <div className="flex min-[981px]:hidden items-center gap-[0.45rem]">
              <MobileHelpCard
                variant="inline"
                sections={[
                  {
                    title: t(
                      goalMode === 'hunt'
                        ? 'tools.totalTipTitleHunt'
                        : 'tools.totalTipTitle'
                    ),
                    body: (
                      <p className="m-0">
                        {t(
                          goalMode === 'hunt'
                            ? 'tools.totalTipBodyHunt'
                            : 'tools.totalTipBody'
                        )}
                      </p>
                    )
                  },
                  {
                    title: t('tools.autoTipTitle'),
                    body: <p className="m-0">{t('tools.autoTipBody')}</p>
                  }
                ]}
              />
              <LegendMenu goalMode={goalMode} />
            </div>
            <div className="hidden min-[981px]:block">
              <GoalModeToggle value={goalMode} onChange={onGoalModeChange} />
            </div>
          </div>
        </div>
        <div className="game-secondary w-full min-[981px]:hidden">
          <GoalModeToggle value={goalMode} onChange={onGoalModeChange} />
        </div>
        <div className="hidden w-full flex-wrap items-center justify-start gap-2.5 min-[981px]:flex">
          <LegendStrip goalMode={goalMode} />
          <HotkeysBar goalMode={goalMode} />
        </div>
      </header>

      <div
        className={`board-frame order-1 rounded-md border border-line bg-elevated shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)] ${whyMode ? 'why-mode border-best/40' : ''}`}
      >
        <div className={whyMode ? boardStageWhy : boardStage}>
          <div className={whyMode ? 'board-with-why' : 'contents'}>
            <Grid
              width={width}
              height={height}
              cellAspect={cellAspect}
              cells={cells}
              goalMode={goalMode}
              onCellClick={onCellClick}
              onCellClear={onCellClear}
              cursorIndex={cursorIndex}
              keyboardCursor={keyboardCursor}
              showCoords
              whyFocus={explainIndex}
              whyClues={whyClues}
              whyPeers={whyPeers}
            />
            {whyMode ? (
              <div className="why-slot">
                <WhyPanel
                  explanation={explanation}
                  hasSelection={explainIndex != null}
                  width={width}
                  activeStep={whyStep}
                  onStepChange={setWhyStep}
                  goalMode={goalMode}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Size | Tools — under the board so the grid stays visible */}
      <div className="game-secondary relative z-5 order-3 flex w-full shrink-0 flex-col gap-[0.55rem] min-[981px]:order-2 min-[981px]:grid min-[981px]:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] min-[981px]:items-stretch">
        <div className="min-[981px]:order-2 min-[981px]:h-full">
          <Toolbar
            mode={mode}
            onModeChange={setMode}
            useTotal={useTotal}
            onUseTotalChange={setUseTotal}
            totalTargets={totalTargets}
            onTotalTargetsChange={setTotalTargets}
            knownFound={knownFound}
            autoSolve={autoSolve}
            onAutoSolveChange={setAutoSolve}
            onSolve={onSolve}
            onClearBoard={onClearBoard}
            onUndo={onUndo}
            onRedo={onRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            whyMode={whyMode}
            onWhyMode={onWhyMode}
            goalMode={goalMode}
          />
        </div>
        <div className="min-[981px]:order-1 min-[981px]:h-full">
          <SizeBar
            width={width}
            height={height}
            cellAspect={cellAspect}
            onSizeChange={onSizeChange}
            onCellAspectChange={onCellAspectChange}
          />
        </div>
      </div>

      {/* Number pad sticky on phone; board tools last */}
      <div className="relative z-5 order-2 flex w-full shrink-0 flex-wrap items-start gap-[0.55rem] max-[980px]:contents min-[981px]:order-3">
        <div className="game-secondary max-[980px]:order-5 max-[980px]:w-full min-[981px]:w-fit">
          <BoardTools
            width={width}
            height={height}
            onPadEdge={onPadEdge}
            onShift={onShift}
            onFlipHorizontal={onFlipHorizontal}
            onFlipVertical={onFlipVertical}
            onTrimEmpty={onTrimEmpty}
          />
        </div>
        <div
          className={`${gameStickyControls} min-w-0 flex-1 max-[980px]:order-2`}
        >
          <NumberPad
            mode={mode}
            numberValue={numberValue}
            onNumberValueChange={setNumberValue}
            onModeChange={setMode}
            goalMode={goalMode}
          />
        </div>
      </div>

      {placeBlocked ? (
        <PlaceBlockedDialog
          message={placeBlocked}
          onClose={() => setPlaceBlocked(null)}
        />
      ) : null}
    </div>
  )
}
