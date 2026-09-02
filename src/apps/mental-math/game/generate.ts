import { evalExpr, type Expr } from './expr'
import {
  ROUND_N,
  extrasForDiff,
  type ArithOp,
  type BoardState,
  type DiffId,
  type Extras,
  type LengthId,
  type OpId,
  type PaceId,
  type Question
} from './types'

export { opGlyph } from './expr'
export { formatExpr } from './expr'

const MAX_ANSWER = 9999

function randInt(lo: number, hi: number): number {
  return lo + Math.floor(Math.random() * (hi - lo + 1))
}

function pickOp(opId: OpId): ArithOp {
  if (opId !== 'mix') return opId
  const ops: ArithOp[] = ['add', 'sub', 'mul', 'div']
  return ops[randInt(0, ops.length - 1)]
}

function pickInnerOp(opId: OpId, addish: boolean): ArithOp {
  if (opId === 'add' || opId === 'sub') return opId === 'sub' ? 'sub' : 'add'
  if (opId === 'mul' || opId === 'div') return addish ? 'add' : opId
  return addish
    ? randInt(0, 1) === 0
      ? 'add'
      : 'sub'
    : randInt(0, 1) === 0
      ? 'mul'
      : 'div'
}

function join(l: number, r: number, op: ArithOp): number | null {
  if (op === 'add') return l + r
  if (op === 'sub') return l >= r ? l - r : null
  if (op === 'mul') return l * r
  if (r === 0 || l % r !== 0) return null
  return l / r
}

function num(n: number): Expr {
  return { k: 'n', n }
}

function combine(l: Expr, r: Expr, op: ArithOp): Expr | null {
  const ans = join(evalExpr(l), evalExpr(r), op)
  if (ans == null || !Number.isInteger(ans) || ans < 0 || ans > MAX_ANSWER) {
    return null
  }
  return { k: 'op', op, l, r }
}

function addBand(diffId: DiffId, compact: boolean): [number, number] {
  if (diffId === 'easy') return [1, compact ? 12 : 20]
  if (diffId === 'medium') return compact ? [2, 30] : [10, 99]
  return compact ? [5, 80] : [10, 999]
}

function mulBand(diffId: DiffId, compact: boolean): [number, number] {
  if (diffId === 'easy') return [2, 10]
  if (diffId === 'medium') return compact ? [2, 12] : [2, 12]
  return compact ? [2, 15] : [12, 25]
}

function leafNum(diffId: DiffId, compact: boolean, forMul: boolean): number {
  if (forMul) {
    const [lo, hi] = mulBand(diffId, compact)
    return randInt(lo, hi)
  }
  const [lo, hi] = addBand(diffId, compact)
  return randInt(lo, hi)
}

function powBase(diffId: DiffId, p: 2 | 3): number {
  if (p === 2) {
    if (diffId === 'easy') return randInt(2, 10)
    if (diffId === 'medium') return randInt(2, 12)
    return randInt(2, 15)
  }
  if (diffId === 'easy') return randInt(2, 6)
  if (diffId === 'medium') return randInt(2, 8)
  return randInt(2, 10)
}

function rootResult(diffId: DiffId, p: 2 | 3): number {
  if (p === 2) {
    if (diffId === 'easy') return randInt(2, 12)
    if (diffId === 'medium') return randInt(2, 16)
    return randInt(2, 20)
  }
  if (diffId === 'easy') return randInt(2, 5)
  if (diffId === 'medium') return randInt(2, 8)
  return randInt(2, 10)
}

function factN(diffId: DiffId): number {
  if (diffId === 'easy') return randInt(3, 6)
  if (diffId === 'medium') return randInt(4, 7)
  return randInt(4, 7)
}

type UnaryKind = 'pow2' | 'pow3' | 'sqrt' | 'cbrt' | 'fact'

function unaryKinds(diffId: DiffId, extras: Extras): UnaryKind[] {
  const kinds: UnaryKind[] = []
  if (extras.powers) {
    kinds.push('pow2')
    if (diffId !== 'easy') kinds.push('pow3')
  }
  if (extras.roots) {
    kinds.push('sqrt')
    if (diffId !== 'easy') kinds.push('cbrt')
  }
  if (extras.facts) kinds.push('fact')
  return kinds
}

function unaryLeaf(diffId: DiffId, extras: Extras): Expr | null {
  const kinds = unaryKinds(diffId, extras)
  if (kinds.length === 0) return null
  const kind = kinds[randInt(0, kinds.length - 1)]
  if (kind === 'pow2') return { k: 'pow', p: 2, x: num(powBase(diffId, 2)) }
  if (kind === 'pow3') return { k: 'pow', p: 3, x: num(powBase(diffId, 3)) }
  if (kind === 'sqrt') {
    const r = rootResult(diffId, 2)
    return { k: 'rt', p: 2, x: num(r * r) }
  }
  if (kind === 'cbrt') {
    const r = rootResult(diffId, 3)
    return { k: 'rt', p: 3, x: num(r * r * r) }
  }
  return { k: 'fact', x: num(factN(diffId)) }
}

function hasUnaryExtras(extras: Extras): boolean {
  return extras.powers || extras.roots || extras.facts
}

function leaf(diffId: DiffId, extras: Extras, compact: boolean, forMul: boolean): Expr {
  if (hasUnaryExtras(extras) && Math.random() < 0.4) {
    const u = unaryLeaf(diffId, extras)
    if (u) return u
  }
  return num(leafNum(diffId, compact, forMul))
}

function maybeUnary(e: Expr, extras: Extras, diffId: DiffId): Expr {
  if (e.k !== 'n' || !hasUnaryExtras(extras)) return e
  if (Math.random() >= 0.45) return e
  return unaryLeaf(diffId, extras) ?? e
}

function binaryPair(op: ArithOp, diffId: DiffId): { a: number; b: number } | null {
  if (op === 'add') {
    const [lo, hi] = addBand(diffId, false)
    return { a: randInt(lo, hi), b: randInt(lo, hi) }
  }
  if (op === 'sub') {
    const [lo, hi] = addBand(diffId, false)
    const x = randInt(lo, hi)
    const y = randInt(lo, hi)
    return { a: Math.max(x, y), b: Math.min(x, y) }
  }
  if (op === 'mul') {
    if (diffId === 'easy') return { a: randInt(2, 10), b: randInt(2, 10) }
    if (diffId === 'medium') return { a: randInt(10, 99), b: randInt(2, 12) }
    return { a: randInt(12, 25), b: randInt(12, 25) }
  }
  if (diffId === 'easy') {
    const b = randInt(2, 10)
    const answer = randInt(2, 10)
    return { a: b * answer, b }
  }
  if (diffId === 'medium') {
    const b = randInt(2, 12)
    const answer = randInt(10, 99)
    return { a: b * answer, b }
  }
  const b = randInt(10, 99)
  const maxQ = Math.floor(999 / b)
  const minQ = Math.ceil(100 / b)
  if (maxQ < minQ) return null
  const answer = randInt(minQ, maxQ)
  const a = b * answer
  if (a < 100 || a > 999) return null
  return { a, b }
}

function tryBinary(op: ArithOp, diffId: DiffId, extras: Extras): Question | null {
  const pair = binaryPair(op, diffId)
  if (!pair) return null
  let l: Expr = num(pair.a)
  let r: Expr = num(pair.b)
  if (hasUnaryExtras(extras)) {
    if (Math.random() < 0.5) l = maybeUnary(l, extras, diffId)
    else r = maybeUnary(r, extras, diffId)
    if (op === 'sub' || op === 'div') {
      const joined = combine(l, r, op)
      if (!joined) {
        l = num(pair.a)
        r = num(pair.b)
      }
    }
  }
  const expr = combine(l, r, op)
  if (!expr) return null
  const answer = evalExpr(expr)
  if (!Number.isInteger(answer) || answer < 0 || answer > MAX_ANSWER) return null
  return { expr, answer }
}

function tryFold(
  terms: number,
  opId: OpId,
  diffId: DiffId,
  extras: Extras
): Question | null {
  const compact = terms > 2
  let acc: Expr = leaf(diffId, extras, compact, false)
  for (let i = 1; i < terms; i++) {
    const op = pickOp(opId)
    const next = leaf(
      diffId,
      extras,
      compact,
      op === 'mul' || op === 'div'
    )
    const expr = combine(acc, next, op)
    if (!expr) return null
    acc = expr
  }
  const answer = evalExpr(acc)
  if (!Number.isInteger(answer) || answer < 0 || answer > MAX_ANSWER) return null
  return { expr: acc, answer }
}

function tryParens3(opId: OpId, diffId: DiffId, extras: Extras): Question | null {
  const innerOp = pickInnerOp(opId, true)
  const outerOp = pickInnerOp(opId, false)
  const compact = true
  const a = leaf(diffId, extras, compact, innerOp === 'mul' || innerOp === 'div')
  const b = leaf(diffId, extras, compact, innerOp === 'mul' || innerOp === 'div')
  const inner = combine(a, b, innerOp)
  if (!inner) return null
  const c = leaf(diffId, extras, compact, outerOp === 'mul' || outerOp === 'div')
  const left = Math.random() < 0.5
  const expr = left ? combine(inner, c, outerOp) : combine(c, inner, outerOp)
  if (!expr) return null
  const answer = evalExpr(expr)
  if (!Number.isInteger(answer) || answer < 0 || answer > MAX_ANSWER) return null
  return { expr, answer }
}

function tryParens4(opId: OpId, diffId: DiffId, extras: Extras): Question | null {
  const left = tryParens3(opId, diffId, { ...extras, termsId: '3' })
  if (!left) return null
  const op = pickOp(opId)
  const extra = leaf(diffId, extras, true, op === 'mul' || op === 'div')
  const expr =
    Math.random() < 0.5
      ? combine(left.expr, extra, op)
      : combine(extra, left.expr, op)
  if (!expr) return null
  const answer = evalExpr(expr)
  if (!Number.isInteger(answer) || answer < 0 || answer > MAX_ANSWER) return null
  return { expr, answer }
}

export function extrasOf(
  board: Pick<BoardState, 'termsId' | 'powers' | 'roots' | 'facts' | 'parens'>
): Extras {
  return {
    termsId: board.termsId,
    powers: board.powers,
    roots: board.roots,
    facts: board.facts,
    parens: board.parens
  }
}

export function createQuestion(
  opId: OpId,
  diffId: DiffId,
  extras: Extras = extrasForDiff(diffId)
): Question {
  const terms = Number(extras.termsId)
  for (let i = 0; i < 120; i++) {
    let q: Question | null = null
    if (extras.parens && terms >= 3) {
      q = terms >= 4 ? tryParens4(opId, diffId, extras) : tryParens3(opId, diffId, extras)
    } else if (terms <= 2) {
      q = tryBinary(pickOp(opId), diffId, extras)
    } else {
      q = tryFold(terms, opId, diffId, extras)
    }
    if (q) return q
  }
  return {
    expr: { k: 'op', op: 'add', l: num(2), r: num(2) },
    answer: 4
  }
}

export const TIMED_SECONDS: Record<LengthId, Record<DiffId, number>> = {
  n20: { easy: 90, medium: 150, hard: 210 },
  endless: { easy: 60, medium: 90, hard: 120 }
}

export function timedSecondsFor(
  lengthId: LengthId,
  diffId: DiffId,
  extras: Extras = extrasForDiff(diffId)
): number {
  let s = TIMED_SECONDS[lengthId][diffId]
  if (extras.termsId === '3') s += 30
  if (extras.termsId === '4') s += 60
  if (extras.powers) s += 20
  if (extras.roots) s += 20
  if (extras.facts) s += 20
  if (extras.parens && extras.termsId !== '2') s += 20
  return s
}

function roundId(): string {
  return `mm-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`
}

export function createRound(
  opId: OpId,
  diffId: DiffId,
  lengthId: LengthId,
  paceId: PaceId = 'train',
  extras: Extras = extrasForDiff(diffId)
): BoardState {
  const n = lengthId === 'endless' ? 1 : ROUND_N
  const questions = Array.from({ length: n }, () =>
    createQuestion(opId, diffId, extras)
  )
  const timed = paceId === 'timed'
  return {
    opId,
    diffId,
    termsId: extras.termsId,
    powers: extras.powers,
    roots: extras.roots,
    facts: extras.facts,
    parens: extras.parens,
    lengthId,
    paceId: timed ? 'timed' : 'train',
    timeLimit: timed ? timedSecondsFor(lengthId, diffId, extras) : 0,
    roundId: roundId(),
    total: n,
    index: 0,
    score: 0,
    questions,
    picked: Array.from({ length: n }, () => null),
    misses: Array.from({ length: n }, () => []),
    status: 'playing'
  }
}

export function emptyBoard(
  opId: OpId = 'mix',
  diffId: DiffId = 'easy',
  lengthId: LengthId = 'n20',
  paceId: PaceId = 'train',
  extras: Extras = extrasForDiff(diffId)
): BoardState {
  const timed = paceId === 'timed'
  return {
    opId,
    diffId,
    termsId: extras.termsId,
    powers: extras.powers,
    roots: extras.roots,
    facts: extras.facts,
    parens: extras.parens,
    lengthId,
    paceId: timed ? 'timed' : 'train',
    timeLimit: timed ? timedSecondsFor(lengthId, diffId, extras) : 0,
    roundId: 'pending',
    total: 0,
    index: 0,
    score: 0,
    questions: [],
    picked: [],
    misses: [],
    status: 'ready'
  }
}

/** Next open item after `from` (wraps). Null if every item is answered. */
export function nextUnanswered(
  picked: readonly (string | null)[],
  from: number
): number | null {
  const n = picked.length
  if (n === 0) return null
  const start = ((from % n) + n) % n
  for (let s = 1; s <= n; s++) {
    const i = (start + s) % n
    if (picked[i] == null) return i
  }
  return null
}

export function parseAnswer(text: string): number | null {
  const trimmed = text.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const n = Number(trimmed)
  if (!Number.isInteger(n)) return null
  return n
}
