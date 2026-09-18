import { AlgebraError } from './poly'
import {
  extractSquare,
  gcd,
  isZero,
  rat,
  radd,
  rdiv,
  req,
  rmul,
  rneg,
  ZERO
} from './rat'
import type { Rat } from './types'

/** a + b√d with d square-free ≥ 2, or a rational (b = 0, d = 0). */
export type Quad = { a: Rat; b: Rat; d: bigint }

export function qrat(a: Rat): Quad {
  return { a, b: ZERO, d: 0n }
}

export const QZERO = qrat(ZERO)

export function qisZero(q: Quad): boolean {
  return isZero(q.a) && isZero(q.b)
}

export function qisRat(q: Quad): boolean {
  return isZero(q.b) || q.d === 0n || q.d === 1n
}

export function qasRat(q: Quad): Rat | null {
  return qisRat(q) ? q.a : null
}

export function qeq(p: Quad, q: Quad): boolean {
  if (!req(p.a, q.a) || !req(p.b, q.b)) return false
  if (isZero(p.b)) return true
  return p.d === q.d
}

function qnorm(q: Quad): Quad {
  if (isZero(q.b) || q.d <= 1n) return { a: q.a, b: ZERO, d: 0n }
  return q
}

export function qneg(q: Quad): Quad {
  return qnorm({ a: rneg(q.a), b: rneg(q.b), d: q.d })
}

function fieldOf(p: Quad, q: Quad): bigint {
  const dp = isZero(p.b) ? 0n : p.d
  const dq = isZero(q.b) ? 0n : q.d
  if (dp === 0n) return dq
  if (dq === 0n) return dp
  if (dp !== dq) throw new AlgebraError('radical')
  return dp
}

export function qadd(p: Quad, q: Quad): Quad {
  const d = fieldOf(p, q)
  return qnorm({ a: radd(p.a, q.a), b: radd(p.b, q.b), d })
}

export function qsub(p: Quad, q: Quad): Quad {
  return qadd(p, qneg(q))
}

export function qmul(p: Quad, q: Quad): Quad {
  const d = fieldOf(p, q)
  if (d === 0n) return qrat(rmul(p.a, q.a))
  const a = radd(rmul(p.a, q.a), rmul(rmul(p.b, q.b), rat(d)))
  const b = radd(rmul(p.a, q.b), rmul(p.b, q.a))
  return qnorm({ a, b, d })
}

export function qdiv(p: Quad, q: Quad): Quad {
  if (qisZero(q)) throw new AlgebraError('parse')
  if (qisRat(q)) return qmul(p, qrat(rdiv(rat(1), q.a)))
  const d = fieldOf(p, q)
  const den = radd(rmul(q.a, q.a), rneg(rmul(rmul(q.b, q.b), rat(d))))
  if (isZero(den)) throw new AlgebraError('parse')
  const conj = qnorm({ a: q.a, b: rneg(q.b), d })
  return qmul(p, qmul(conj, qrat(rdiv(rat(1), den))))
}

export function qsqrtRat(r: Rat): Quad {
  if (r.n < 0n) throw new AlgebraError('radical')
  if (isZero(r)) return QZERO
  const nd = r.n * r.d
  const { k, s } = extractSquare(nd)
  const b = rat(k, r.d)
  if (s === 1n) return qrat(b)
  return qnorm({ a: ZERO, b, d: s })
}

export function qfloat(q: Quad): number {
  const a = Number(q.a.n) / Number(q.a.d)
  if (isZero(q.b) || q.d <= 1n) return a
  return a + (Number(q.b.n) / Number(q.b.d)) * Math.sqrt(Number(q.d))
}

export function formatQuad(q: Quad): string {
  const MINUS = '−'
  if (qisRat(q)) return formatRatLocal(q.a)
  const rad = formatKsqrtLocal(q.b, q.d)
  if (isZero(q.a)) return rad
  const a = formatRatLocal(q.a)
  if (q.b.n < 0n) {
    return `${a} ${MINUS} ${formatKsqrtLocal({ n: -q.b.n, d: q.b.d }, q.d)}`
  }
  return `${a} + ${rad}`
}

function formatRatLocal(r: Rat): string {
  if (r.n < 0n) return '−' + formatRatLocal({ n: -r.n, d: r.d })
  if (r.d === 1n) return r.n.toString()
  return `${r.n.toString()}/${r.d.toString()}`
}

function formatKsqrtLocal(c: Rat, d: bigint): string {
  if (c.n < 0n) return '−' + formatKsqrtLocal({ n: -c.n, d: c.d }, d)
  const atom = `√${d.toString()}`
  if (c.n === 1n && c.d === 1n) return atom
  if (c.d === 1n) return `${c.n.toString()}${atom}`
  if (c.n === 1n) return `${atom}/${c.d.toString()}`
  return `(${formatRatLocal(c)})${atom}`
}

export function formatSqrtRat(r: Rat): string {
  if (r.n < 0n) return `√(${formatRatLocal(r)})`
  const q = qsqrtRat(r)
  return formatQuad(q)
}

/** (−B ± √Δ) / (2A) as one or two pretty strings. */
export function formatQuadFormula(A: Quad, B: Quad, disc: Quad): string[] {
  const nb = qneg(B)
  const den = qmul(A, qrat(rat(2)))
  if (qisZero(disc)) return [formatQuad(qdiv(nb, den))]
  const discR = qasRat(disc)
  const denR = qasRat(den)
  if (discR && denR && denR.n !== 0n && qisRat(A)) {
    const rad = qsqrtRat(discR)
    return cancelPm(nb, rad, denR)
  }
  const ds = qisRat(disc)
    ? formatSqrtRat(disc.a)
    : `√(${formatQuad(disc)})`
  const left = formatQuad(nb)
  const dstr = formatQuad(den)
  return [`(${left} + ${ds}) / ${dstr}`, `(${left} − ${ds}) / ${dstr}`]
}

function cancelPm(nb: Quad, rad: Quad, den: Rat): string[] {
  const parts: Rat[] = [den]
  if (!isZero(nb.a)) parts.push(nb.a)
  if (!isZero(nb.b)) parts.push(nb.b)
  if (!isZero(rad.a)) parts.push(rad.a)
  if (!isZero(rad.b)) parts.push(rad.b)
  let g = 0n
  for (const p of parts) {
    const n = p.n < 0n ? -p.n : p.n
    g = g === 0n ? n : gcd(g, n)
  }
  let dd = den.n < 0n ? -den.n : den.n
  if (g > 1n) {
    const gg = gcd(g, dd)
    g = gg
  }
  if (g > 1n) {
    const s = rat(g)
    nb = qdiv(nb, qrat(s))
    rad = qdiv(rad, qrat(s))
    den = rdiv(den, s)
  }
  if (den.n < 0n) {
    nb = qneg(nb)
    rad = qneg(rad)
    den = rneg(den)
  }
  const denS = formatRatLocal(den)
  const plus = joinSum(nb, rad, '+')
  const minus = joinSum(nb, rad, '−')
  if (den.n === 1n && den.d === 1n) return [plus, minus]
  return [`(${plus}) / ${denS}`, `(${minus}) / ${denS}`]
}

function joinSum(p: Quad, q: Quad, op: '+' | '−'): string {
  const pd = isZero(p.b) ? 0n : p.d
  const qd = isZero(q.b) ? 0n : q.d
  if (pd !== 0n && qd !== 0n && pd !== qd) {
    return op === '+'
      ? `${formatQuad(p)} + ${formatQuad(q)}`
      : `${formatQuad(p)} − ${formatQuad(q)}`
  }
  return formatQuad(op === '+' ? qadd(p, q) : qsub(p, q))
}
