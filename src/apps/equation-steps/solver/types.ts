export type Rat = { n: bigint; d: bigint }

export type Expr =
  | { k: 'n'; v: Rat }
  | { k: 'v'; name: string }
  | { k: 'neg'; x: Expr }
  | { k: 'add'; l: Expr; r: Expr }
  | { k: 'sub'; l: Expr; r: Expr }
  | { k: 'mul'; l: Expr; r: Expr }
  | { k: 'div'; l: Expr; r: Expr }
  | { k: 'pow'; b: Expr; e: Expr }
  | { k: 'abs'; x: Expr }
  | { k: 'sqrt'; x: Expr }
  | { k: 'pi' }
  | { k: 'fn'; fn: 'sin' | 'cos' | 'tan'; x: Expr }

export type Problem =
  | { k: 'eq'; l: Expr; r: Expr }
  | { k: 'expr'; x: Expr }

export type FailReason =
  | 'empty'
  | 'parse'
  | 'multiVar'
  | 'varInDenom'
  | 'highDegree'
  | 'badPower'
  | 'radical'

export type Why =
  | { k: 'start' }
  | { k: 'expand' }
  | { k: 'simplify' }
  | { k: 'swap' }
  | { k: 'clearDenom'; n: string }
  | { k: 'subBoth'; term: string }
  | { k: 'addBoth'; term: string }
  | { k: 'divBoth'; n: string }
  | { k: 'mulBoth'; n: string }
  | { k: 'factor' }
  | { k: 'zeroProduct' }
  | { k: 'sqrt'; n: string }
  | { k: 'quadratic'; disc: string }
  | { k: 'identity' }
  | { k: 'none' }
  | { k: 'absSplit' }
  | { k: 'isolate' }
  | { k: 'square' }
  | { k: 'check' }
  | { k: 'subst' }
  | { k: 'trigId' }
  | { k: 'backSub' }

export type SolveStep = {
  text: string
  why: Why
}

export type Outcome = 'solved' | 'identity' | 'none'

export type EqPlot = {
  variable: string
  left: Expr
  right: Expr
  roots: number[]
  /** Exact answer strings aligned with roots when available. */
  labels?: string[]
}

export type SolveOk = {
  ok: true
  variable: string
  steps: SolveStep[]
  outcome: Outcome
  answers: string[]
  plot: EqPlot | null
}

export type SolveErr = {
  ok: false
  reason: FailReason
}

export type SolveResult = SolveOk | SolveErr
