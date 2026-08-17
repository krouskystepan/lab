export type DiffId = 'easy' | 'medium' | 'hard' | 'expert' | 'random'

export type GameStatus = 'ready' | 'playing' | 'won' | 'lost'

export type TileMark = 'correct' | 'present' | 'absent'

export type Guess = {
  word: string
  marks: TileMark[]
}

export type BoardState = {
  diffId: DiffId
  wordLen: number
  answer: string
  guesses: Guess[]
  current: string
  status: GameStatus
  maxGuesses: number
  hardMode: boolean
  /** Positions whose correct letter was revealed by Hint. */
  hinted: boolean[]
}

export type SetDiff = { type: 'setDiff'; id: DiffId }
export type SetWordLen = { type: 'setWordLen'; wordLen: number }
export type NewGame = { type: 'newGame' }
export type TypeLetter = { type: 'typeLetter'; letter: string }
export type Backspace = { type: 'backspace' }
export type Submit = { type: 'submit' }
export type Hint = { type: 'hint'; index: number }
export type Restore = {
  type: 'restore'
  guesses: Guess[]
  current: string
  status: GameStatus
  hinted: boolean[]
}
export type ImportBoard = { type: 'importBoard'; board: BoardState }

export type Action =
  | SetDiff
  | SetWordLen
  | NewGame
  | TypeLetter
  | Backspace
  | Submit
  | Hint
  | Restore
  | ImportBoard

export type HardViolation =
  | { kind: 'green'; letter: string; n: number }
  | { kind: 'yellow'; letter: string }
