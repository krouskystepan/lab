import { formatProblemEq, joinAnswers } from './format'
import { collectVars } from './parse'
import { AlgebraError } from './poly'
import {
  formatQuad,
  formatQuadFormula,
  qasRat,
  qdiv,
  qfloat,
  qisZero,
  qmul,
  qneg,
  qrat,
  qsub,
  type Quad
} from './quad'
import {
  divideRoot,
  fieldOfPoly,
  formatQPoly,
  qcoeff,
  qdegree,
  qpneg,
  rootGuesses,
  toQPoly,
  type QPoly
} from './qpoly'
import { rat, rneg } from './rat'
import type { Expr, SolveStep, Why } from './types'

export type Cand = { text: string; x: number }

export function pushStep(steps: SolveStep[], text: string, why: Why): void {
  const last = steps[steps.length - 1]
  if (last?.text === text && last.why.k === why.k) return
  steps.push({ text, why })
}

export function needsRadical(e: Expr): boolean {
  switch (e.k) {
    case 'abs':
    case 'sqrt':
    case 'fn':
      return true
    case 'n':
    case 'v':
    case 'pi':
      return false
    case 'neg':
      return needsRadical(e.x)
    case 'pow':
      return needsRadical(e.b) || needsRadical(e.e)
    default:
      return needsRadical(e.l) || needsRadical(e.r)
  }
}

function negExpr(e: Expr): Expr {
  if (e.k === 'neg') return e.x
  if (e.k === 'n') return { k: 'n', v: rneg(e.v) }
  return { k: 'neg', x: e }
}

function pow2(e: Expr): Expr {
  return { k: 'pow', b: e, e: { k: 'n', v: rat(2) } }
}

function containsAbs(e: Expr): boolean {
  switch (e.k) {
    case 'abs':
      return true
    case 'n':
    case 'v':
    case 'pi':
      return false
    case 'neg':
    case 'sqrt':
    case 'fn':
      return containsAbs(e.x)
    case 'pow':
      return containsAbs(e.b) || containsAbs(e.e)
    default:
      return containsAbs(e.l) || containsAbs(e.r)
  }
}

function flatten(
  e: Expr,
  sign: 1 | -1,
  acc: { sign: 1 | -1; e: Expr }[]
): void {
  if (e.k === 'add') {
    flatten(e.l, sign, acc)
    flatten(e.r, sign, acc)
    return
  }
  if (e.k === 'sub') {
    flatten(e.l, sign, acc)
    flatten(e.r, (sign === 1 ? -1 : 1), acc)
    return
  }
  if (e.k === 'neg') {
    flatten(e.x, (sign === 1 ? -1 : 1), acc)
    return
  }
  acc.push({ sign, e })
}

function sumTerms(terms: { sign: 1 | -1; e: Expr }[]): Expr {
  if (terms.length === 0) return { k: 'n', v: rat(0) }
  let acc: Expr =
    terms[0]!.sign === 1 ? terms[0]!.e : negExpr(terms[0]!.e)
  for (let i = 1; i < terms.length; i++) {
    const t = terms[i]!
    acc =
      t.sign === 1
        ? { k: 'add', l: acc, r: t.e }
        : { k: 'sub', l: acc, r: t.e }
  }
  return acc
}

function isVarSqrt(e: Expr, v: string): boolean {
  return e.k === 'sqrt' && collectVars(e.x).has(v)
}

function isolateSqrt(
  l: Expr,
  r: Expr,
  v: string
): { inner: Expr; rhs: Expr } | null {
  const terms: { sign: 1 | -1; e: Expr }[] = []
  flatten(l, 1, terms)
  flatten(r, -1, terms)
  const sq = terms.filter((t) => isVarSqrt(t.e, v))
  if (sq.length !== 1) return null
  const one = sq[0]!
  const rest = terms.filter((t) => t !== one)
  const rhs = one.sign === 1 ? negExpr(sumTerms(rest)) : sumTerms(rest)
  return { inner: (one.e as { k: 'sqrt'; x: Expr }).x, rhs }
}

function isolateAbs(l: Expr, r: Expr): { inner: Expr; rhs: Expr } | null {
  const terms: { sign: 1 | -1; e: Expr }[] = []
  flatten(l, 1, terms)
  flatten(r, -1, terms)
  const ab = terms.filter((t) => t.e.k === 'abs')
  if (ab.length !== 1) return null
  const one = ab[0]!
  const rest = terms.filter((t) => t !== one)
  const rhs = one.sign === 1 ? negExpr(sumTerms(rest)) : sumTerms(rest)
  return { inner: (one.e as { k: 'abs'; x: Expr }).x, rhs }
}

export function evalExpr(e: Expr, x: number): number | null {
  switch (e.k) {
    case 'n':
      return Number(e.v.n) / Number(e.v.d)
    case 'v':
      return x
    case 'neg': {
      const a = evalExpr(e.x, x)
      return a == null ? null : -a
    }
    case 'add': {
      const a = evalExpr(e.l, x)
      const b = evalExpr(e.r, x)
      return a == null || b == null ? null : a + b
    }
    case 'sub': {
      const a = evalExpr(e.l, x)
      const b = evalExpr(e.r, x)
      return a == null || b == null ? null : a - b
    }
    case 'mul': {
      const a = evalExpr(e.l, x)
      const b = evalExpr(e.r, x)
      return a == null || b == null ? null : a * b
    }
    case 'div': {
      const a = evalExpr(e.l, x)
      const b = evalExpr(e.r, x)
      if (a == null || b == null || Math.abs(b) < 1e-15) return null
      return a / b
    }
    case 'pow': {
      const a = evalExpr(e.b, x)
      const b = evalExpr(e.e, x)
      if (a == null || b == null) return null
      if (!Number.isInteger(b) || b < 0 || b > 8) return null
      return a ** b
    }
    case 'abs': {
      const a = evalExpr(e.x, x)
      return a == null ? null : Math.abs(a)
    }
    case 'sqrt': {
      const a = evalExpr(e.x, x)
      if (a == null || a < -1e-10) return null
      return Math.sqrt(Math.max(0, a))
    }
    case 'pi':
      return Math.PI
    case 'fn': {
      const a = evalExpr(e.x, x)
      if (a == null) return null
      if (e.fn === 'sin') return Math.sin(a)
      if (e.fn === 'cos') return Math.cos(a)
      const c = Math.cos(a)
      if (Math.abs(c) < 1e-15) return null
      return Math.tan(a)
    }
  }
}

export function satisfies(l: Expr, r: Expr, x: number): boolean {
  const a = evalExpr(l, x)
  const b = evalExpr(r, x)
  if (a == null || b == null) return false
  return Math.abs(a - b) <= 1e-6 * (1 + Math.abs(a) + Math.abs(b))
}

function uniq(cands: Cand[]): Cand[] {
  const out: Cand[] = []
  for (const c of cands) {
    if (!Number.isFinite(c.x)) continue
    if (out.some((o) => Math.abs(o.x - c.x) < 1e-8)) continue
    out.push(c)
  }
  out.sort((a, b) => a.x - b.x)
  return out
}

function candQuad(q: Quad): Cand {
  return { text: formatQuad(q), x: qfloat(q) }
}

function walkQPoly(p0: QPoly, v: string, steps: SolveStep[]): Cand[] {
  let p = p0
  if (qfloat(qcoeff(p, qdegree(p))) < 0) p = qpneg(p)
  const d = qdegree(p)
  if (d === 0) return []
  pushStep(steps, `${formatQPoly(p, v)} = 0`, { k: 'expand' })
  if (d === 1) {
    const a = qcoeff(p, 1)
    const c = qcoeff(p, 0)
    if (qisZero(a)) return []
    const x = qdiv(qneg(c), a)
    const body = formatQuad(x)
    pushStep(steps, `${v} = ${body}`, { k: 'divBoth', n: formatQuad(a) })
    return [candQuad(x)]
  }
  if (d === 2) {
    const A = qcoeff(p, 2)
    const B = qcoeff(p, 1)
    const C = qcoeff(p, 0)
    const disc = qsub(qmul(B, B), qmul(qmul(qrat(rat(4)), A), C))
    const discR = qasRat(disc)
    if (discR && discR.n < 0n) {
      pushStep(steps, `${formatQPoly(p, v)} = 0`, { k: 'none' })
      return []
    }
    const bodies = formatQuadFormula(A, B, disc)
    const Af = qfloat(A)
    const Bf = qfloat(B)
    const Df = qfloat(disc)
    if (Df < -1e-10) return []
    const s = Math.sqrt(Math.max(0, Df))
    const xs =
      Math.abs(Df) < 1e-12
        ? [(-Bf) / (2 * Af)]
        : [(-Bf + s) / (2 * Af), (-Bf - s) / (2 * Af)]
    pushStep(steps, joinAnswers(v, bodies), {
      k: 'quadratic',
      disc: discR ? discR.n.toString() : formatQuad(disc)
    })
    return bodies.map((text, i) => ({ text, x: xs[i] ?? xs[0]! }))
  }
  if (d > 6) throw new AlgebraError('highDegree')
  const found: Cand[] = []
  let cur = p
  const guesses = rootGuesses(fieldOfPoly(p))
  let guard = 0
  while (qdegree(cur) > 2 && guard++ < 8) {
    let hit: Quad | null = null
    for (const g of guesses) {
      const q = divideRoot(cur, g)
      if (q) {
        hit = g
        cur = q
        found.push(candQuad(g))
        break
      }
    }
    if (!hit) throw new AlgebraError('highDegree')
  }
  if (found.length) {
    pushStep(
      steps,
      joinAnswers(
        v,
        found.map((c) => c.text)
      ),
      { k: 'factor' }
    )
  }
  if (qdegree(cur) <= 2 && qdegree(cur) > 0) {
    found.push(...walkQPoly(cur, v, steps))
  } else if (qdegree(cur) === 0) {
    /* constant leftover */
  }
  return uniq(found)
}

function walkEq(l: Expr, r: Expr, v: string, steps: SolveStep[]): Cand[] {
  if (l.k === 'abs' && !containsAbs(r)) {
    const a = l.x
    pushStep(
      steps,
      `${formatProblemEq(a, r)}  or  ${formatProblemEq(a, negExpr(r))}`,
      { k: 'absSplit' }
    )
    return uniq([
      ...walkEq(a, r, v, steps),
      ...walkEq(a, negExpr(r), v, steps)
    ])
  }
  if (r.k === 'abs' && !containsAbs(l)) {
    return walkEq(r, l, v, steps)
  }
  if (l.k === 'abs' && r.k === 'abs') {
    pushStep(
      steps,
      `${formatProblemEq(l.x, r.x)}  or  ${formatProblemEq(l.x, negExpr(r.x))}`,
      { k: 'absSplit' }
    )
    return uniq([
      ...walkEq(l.x, r.x, v, steps),
      ...walkEq(l.x, negExpr(r.x), v, steps)
    ])
  }

  const abs = isolateAbs(l, r)
  if (abs && (containsAbs(l) || containsAbs(r))) {
    pushStep(steps, formatProblemEq({ k: 'abs', x: abs.inner }, abs.rhs), {
      k: 'isolate'
    })
    return walkEq({ k: 'abs', x: abs.inner }, abs.rhs, v, steps)
  }

  const iso = isolateSqrt(l, r, v)
  if (iso) {
    const isolated = formatProblemEq({ k: 'sqrt', x: iso.inner }, iso.rhs)
    if (steps[steps.length - 1]?.text !== isolated) {
      pushStep(steps, isolated, { k: 'isolate' })
    }
    const squared = formatProblemEq(iso.inner, pow2(iso.rhs))
    pushStep(steps, squared, { k: 'square' })
    return walkEq(iso.inner, pow2(iso.rhs), v, steps)
  }

  const diff = toQPoly({ k: 'sub', l, r }, v)
  return walkQPoly(diff, v, steps)
}

export function solveRadical(
  l: Expr,
  r: Expr,
  v: string,
  steps: SolveStep[]
): { cands: Cand[] } {
  const raw = walkEq(l, r, v, steps)
  const ok = uniq(raw.filter((c) => satisfies(l, r, c.x)))
  return { cands: ok }
}
