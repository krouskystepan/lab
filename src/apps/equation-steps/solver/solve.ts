import {
  formatEq,
  formatExpr,
  formatPmSqrt,
  formatPoly,
  formatProblemEq,
  formatQuadraticPair,
  formatRat,
  joinAnswers
} from './format'
import { collectVars, parseProblem } from './parse'
import {
  AlgebraError,
  clearDenoms,
  coeff,
  degree,
  denLcm,
  isZeroPoly,
  monomial,
  padd,
  pneg,
  polyEq,
  pscale,
  psub,
  toPoly,
  type Poly
} from './poly'
import {
  isNegOne,
  isOne,
  isZero,
  lcm,
  rat,
  rdiv,
  req,
  rmul,
  rneg,
  rsub,
  ZERO
} from './rat'
import { needsRadical, solveRadical } from './radical'
import { tryCosSub, tryTrigEq } from './trig'
import type {
  EqPlot,
  Expr,
  Outcome,
  Rat,
  SolveResult,
  SolveStep,
  Why
} from './types'

function push(steps: SolveStep[], text: string, why: Why): void {
  const last = steps[steps.length - 1]
  if (last?.text === text && last.why.k === why.k) return
  steps.push({ text, why })
}

function done(
  v: string,
  steps: SolveStep[],
  outcome: Outcome,
  answers: string[],
  plot: EqPlot | null = null
): SolveResult {
  return { ok: true, variable: v, steps, outcome, answers, plot }
}

function withPlot(
  res: SolveResult,
  l: Expr,
  r: Expr,
  v: string,
  roots: number[]
): SolveResult {
  if (!res.ok) return res
  return {
    ...res,
    plot: {
      variable: v,
      left: l,
      right: r,
      roots,
      labels: res.answers
    }
  }
}

function ratFloat(r: Rat): number {
  return Number(r.n) / Number(r.d)
}

function fail(e: unknown): SolveResult {
  if (e instanceof AlgebraError) return { ok: false, reason: e.code }
  return { ok: false, reason: 'parse' }
}

function cmpRat(a: Rat, b: Rat): number {
  const d = a.n * b.d - b.n * a.d
  if (d < 0n) return -1
  if (d > 0n) return 1
  return 0
}

function sortRoots(roots: Rat[]): Rat[] {
  return roots.slice().sort(cmpRat)
}

function answerBodies(roots: Rat[]): string[] {
  const s = sortRoots(roots)
  if (s.length === 2 && req(s[0]!, rneg(s[1]!))) {
    const pos = s[0]!.n < 0n ? s[1]! : s[0]!
    return [`±${formatRat(pos)}`]
  }
  return s.map(formatRat)
}

export function solve(input: string): SolveResult {
  const trimmed = input.trim()
  if (!trimmed) return { ok: false, reason: 'empty' }
  const problem = parseProblem(trimmed)
  if (!problem) return { ok: false, reason: 'parse' }

  const vars = new Set<string>()
  if (problem.k === 'eq') {
    collectVars(problem.l, vars)
    collectVars(problem.r, vars)
  } else {
    collectVars(problem.x, vars)
  }
  if (vars.size > 1) return { ok: false, reason: 'multiVar' }
  const v = vars.size === 1 ? [...vars][0]! : 'x'

  try {
    if (problem.k === 'expr') return solveExpr(problem.x, v)
    return solveEq(problem.l, problem.r, v)
  } catch (e) {
    return fail(e)
  }
}

function solveExpr(x: Expr, v: string): SolveResult {
  const steps: SolveStep[] = []
  push(steps, formatExpr(x), { k: 'start' })
  const p = toPoly(x, v)
  if (degree(p) > 6) throw new AlgebraError('highDegree')
  const text = formatPoly(p, v)
  if (text !== steps[0]?.text) {
    push(steps, text, { k: degree(p) === 0 ? 'simplify' : 'expand' })
  }
  return done(v, steps, 'solved', [text])
}

function solveEq(l: Expr, r: Expr, v: string): SolveResult {
  const steps: SolveStep[] = []
  const start = formatProblemEq(l, r)
  push(steps, start, { k: 'start' })

  if (needsRadical(l) || needsRadical(r)) {
    const trig = tryCosSub(l, r, v, steps) ?? tryTrigEq(l, r, v, steps)
    if (trig) {
      const bodies = trig.map((c) => c.text)
      const last = steps[steps.length - 1]?.text
      const joined = joinAnswers(v, bodies)
      if (last !== joined) push(steps, joined, { k: 'check' })
      return withPlot(
        done(v, steps, 'solved', bodies),
        l,
        r,
        v,
        trig.map((c) => c.x)
      )
    }
    const { cands } = solveRadical(l, r, v, steps)
    if (cands.length === 0) {
      push(steps, formatProblemEq(l, r), { k: 'none' })
      return withPlot(done(v, steps, 'none', []), l, r, v, [])
    }
    const bodies = cands.map((c) => c.text)
    const last = steps[steps.length - 1]?.text
    const joined = joinAnswers(v, bodies)
    if (last !== joined) push(steps, joined, { k: 'check' })
    return withPlot(
      done(v, steps, 'solved', bodies),
      l,
      r,
      v,
      cands.map((c) => c.x)
    )
  }

  let L = toPoly(l, v)
  let R = toPoly(r, v)
  if (degree(L) > 2 || degree(R) > 2) throw new AlgebraError('highDegree')

  const expanded = formatEq(L, R, v)
  if (expanded !== start) push(steps, expanded, { k: 'expand' })

  if (degree(L) === 0 && degree(R) > 0) {
    const tmp = L
    L = R
    R = tmp
    push(steps, formatEq(L, R, v), { k: 'swap' })
  }

  if (degree(L) <= 1 && degree(R) <= 1) {
    return withPlot(linear(steps, L, R, v), l, r, v, linearRoots(L, R))
  }
  return withPlot(quadratic(steps, L, R, v), l, r, v, quadraticRoots(L, R))
}

function linearRoots(L: Poly, R: Poly): number[] {
  const a = ratFloat(rsub(coeff(L, 1), coeff(R, 1)))
  const b = ratFloat(rsub(coeff(L, 0), coeff(R, 0)))
  if (Math.abs(a) < 1e-15) return []
  return [-b / a]
}

function quadraticRoots(L0: Poly, R0: Poly): number[] {
  const d = psub(L0, R0)
  const a = ratFloat(coeff(d, 2))
  const b = ratFloat(coeff(d, 1))
  const c = ratFloat(coeff(d, 0))
  if (Math.abs(a) < 1e-15) {
    if (Math.abs(b) < 1e-15) return []
    return [-c / b]
  }
  const disc = b * b - 4 * a * c
  if (disc < -1e-12) return []
  if (Math.abs(disc) <= 1e-12) return [-b / (2 * a)]
  const s = Math.sqrt(Math.max(0, disc))
  return [(-b + s) / (2 * a), (-b - s) / (2 * a)]
}

function linear(steps: SolveStep[], L0: Poly, R0: Poly, v: string): SolveResult {
  let L = L0
  let R = R0
  const n = lcm(denLcm(L), denLcm(R))
  if (n > 1n) {
    const s = rat(n)
    L = pscale(L, s)
    R = pscale(R, s)
    push(steps, formatEq(L, R, v), { k: 'clearDenom', n: n.toString() })
  }

  const a2 = coeff(R, 1)
  if (!isZero(a2)) {
    const mag = a2.n < 0n ? rneg(a2) : a2
    const term = formatPoly(monomial(1, mag), v)
    if (a2.n < 0n) {
      L = padd(L, monomial(1, mag))
      R = padd(R, monomial(1, mag))
      push(steps, formatEq(L, R, v), { k: 'addBoth', term })
    } else {
      L = psub(L, monomial(1, mag))
      R = psub(R, monomial(1, mag))
      push(steps, formatEq(L, R, v), { k: 'subBoth', term })
    }
  }

  const c = coeff(L, 0)
  if (!isZero(c)) {
    const mag = c.n < 0n ? rneg(c) : c
    const term = formatRat(mag)
    if (c.n < 0n) {
      L = padd(L, monomial(0, mag))
      R = padd(R, monomial(0, mag))
      push(steps, formatEq(L, R, v), { k: 'addBoth', term })
    } else {
      L = psub(L, monomial(0, mag))
      R = psub(R, monomial(0, mag))
      push(steps, formatEq(L, R, v), { k: 'subBoth', term })
    }
  }

  const a = coeff(L, 1)
  const rhs = coeff(R, 0)

  if (isZero(a)) {
    if (polyEq(L, R)) {
      push(steps, '0 = 0', { k: 'identity' })
      return done(v, steps, 'identity', [])
    }
    push(steps, formatEq(L, R, v), { k: 'none' })
    return done(v, steps, 'none', [])
  }

  if (isOne(a)) {
    return done(v, steps, 'solved', [formatRat(rhs)])
  }

  if (isNegOne(a)) {
    L = pneg(L)
    R = pneg(R)
    push(steps, formatEq(L, R, v), { k: 'mulBoth', n: MINUS_ONE })
    return done(v, steps, 'solved', [formatRat(coeff(R, 0))])
  }

  const body = formatRat(rdiv(rhs, a))
  push(steps, `${v} = ${body}`, { k: 'divBoth', n: formatRat(a) })
  return done(v, steps, 'solved', [body])
}

const MINUS_ONE = '−1'

function quadratic(
  steps: SolveStep[],
  L0: Poly,
  R0: Poly,
  v: string
): SolveResult {
  let L = L0
  let R = R0
  if (!isZeroPoly(R)) {
    const term = formatPoly(R, v)
    L = psub(L, R)
    R = [ZERO]
    push(steps, formatEq(L, R, v), { k: 'subBoth', term })
  }

  const cleared = clearDenoms(L)
  if (cleared.n > 1n) {
    L = cleared.poly
    push(steps, formatEq(L, R, v), {
      k: 'clearDenom',
      n: cleared.n.toString()
    })
  }

  if (degree(L) > 2) throw new AlgebraError('highDegree')
  if (degree(L) <= 1) return linear(steps, L, R, v)

  if (coeff(L, 2).n < 0n) {
    L = pneg(L)
    push(steps, formatEq(L, R, v), { k: 'mulBoth', n: MINUS_ONE })
  }

  const a = coeff(L, 2)
  const b = coeff(L, 1)
  const c = coeff(L, 0)

  const factored = factorQuadratic(a, b, c, v)
  if (factored) {
    push(steps, `${factored.product} = 0`, { k: 'factor' })
    const bodies = answerBodies(factored.roots)
    push(steps, joinAnswers(v, bodies), { k: 'zeroProduct' })
    return done(v, steps, 'solved', bodies)
  }

  if (isZero(b)) {
    const rhs = rdiv(rneg(c), a)
    if (rhs.n < 0n) {
      push(steps, formatEq(L, R, v), { k: 'none' })
      return done(v, steps, 'none', [])
    }
    if (isZero(rhs)) {
      push(steps, `${v} = 0`, { k: 'sqrt', n: '0' })
      return done(v, steps, 'solved', ['0'])
    }
    const body = formatPmSqrt(rhs)
    push(steps, `${v} = ${body}`, { k: 'sqrt', n: formatRat(rhs) })
    return done(v, steps, 'solved', [body])
  }

  const disc = rsub(rmul(b, b), rmul(rat(4), rmul(a, c)))
  if (disc.n < 0n) {
    push(steps, formatEq(L, R, v), { k: 'none' })
    return done(v, steps, 'none', [])
  }
  if (isZero(disc)) {
    const root = formatRat(rdiv(rneg(b), rmul(rat(2), a)))
    push(steps, `${v} = ${root}`, { k: 'quadratic', disc: '0' })
    return done(v, steps, 'solved', [root])
  }
  const pair = formatQuadraticPair(a, b, disc)
  push(steps, `${v} = ${pair}`, { k: 'quadratic', disc: formatRat(disc) })
  return done(v, steps, 'solved', [pair])
}

function formatLinearFactor(p: bigint, q: bigint, v: string): string {
  if (p === 1n && q === 0n) return v
  return `(${formatPoly([rat(q), rat(p)], v)})`
}

function factorQuadratic(
  a: Rat,
  b: Rat,
  c: Rat,
  v: string
): { product: string; roots: Rat[] } | null {
  if (a.d !== 1n || b.d !== 1n || c.d !== 1n) return null
  const A = a.n
  const B = b.n
  const C = c.n

  if (C === 0n) {
    const roots = sortRoots([ZERO, rdiv(rneg(b), a)])
    const other = formatPoly([b, a], v)
    const product = `${v}(${other})`
    return { product, roots }
  }

  const pCandidates = factorPairs(A)
  const qCandidates = factorPairs(C)
  for (const p of pCandidates) {
    const r = A / p
    for (const q of qCandidates) {
      if (q === 0n) continue
      if (C % q !== 0n) continue
      const s = C / q
      if (p * s + q * r !== B) continue
      const r1 = rdiv(rat(-q), rat(p))
      const r2 = rdiv(rat(-s), rat(r))
      const f1 = formatLinearFactor(p, q, v)
      const f2 = formatLinearFactor(r, s, v)
      const product = f1 === f2 ? `${f1}²` : `${f1}${f2}`
      const roots = req(r1, r2) ? [r1] : sortRoots([r1, r2])
      return { product, roots }
    }
  }
  return null
}

function factorPairs(n: bigint): bigint[] {
  const mag = n < 0n ? -n : n
  const pos: bigint[] = []
  for (let i = 1n; i * i <= mag; i++) {
    if (mag % i === 0n) {
      pos.push(i)
      const o = mag / i
      if (o !== i) pos.push(o)
    }
  }
  const out: bigint[] = []
  for (const p of pos) out.push(p, -p)
  return out
}
