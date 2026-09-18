import { AlgebraError } from './poly'
import {
  formatQuad,
  qadd,
  qasRat,
  qdiv,
  qeq,
  qfloat,
  qisRat,
  qisZero,
  qmul,
  qneg,
  qrat,
  qsqrtRat,
  QZERO,
  type Quad
} from './quad'
import { isZero, rat, rabs, ZERO } from './rat'
import type { Expr, Rat } from './types'

export type QPoly = Quad[]

export function qcoeff(p: QPoly, i: number): Quad {
  return p[i] ?? QZERO
}

export function qdegree(p: QPoly): number {
  for (let i = p.length - 1; i >= 0; i--) {
    if (!qisZero(p[i]!)) return i
  }
  return 0
}

export function qtrim(p: QPoly): QPoly {
  let end = p.length - 1
  while (end > 0 && qisZero(p[end]!)) end--
  return p.slice(0, end + 1)
}

export function qpadd(a: QPoly, b: QPoly): QPoly {
  const n = Math.max(a.length, b.length)
  const out: Quad[] = []
  for (let i = 0; i < n; i++) out.push(qadd(qcoeff(a, i), qcoeff(b, i)))
  return qtrim(out)
}

export function qpsub(a: QPoly, b: QPoly): QPoly {
  const n = Math.max(a.length, b.length)
  const out: Quad[] = []
  for (let i = 0; i < n; i++) out.push(qadd(qcoeff(a, i), qneg(qcoeff(b, i))))
  return qtrim(out)
}

export function qpscale(p: QPoly, s: Quad): QPoly {
  if (qisZero(s)) return [QZERO]
  return qtrim(p.map((c) => qmul(c, s)))
}

export function qpmul(a: QPoly, b: QPoly): QPoly {
  if (qdegree(a) === 0 && qisZero(qcoeff(a, 0))) return [QZERO]
  if (qdegree(b) === 0 && qisZero(qcoeff(b, 0))) return [QZERO]
  const out: Quad[] = Array.from(
    { length: a.length + b.length - 1 },
    () => QZERO
  )
  for (let i = 0; i < a.length; i++) {
    if (qisZero(a[i]!)) continue
    for (let j = 0; j < b.length; j++) {
      if (qisZero(b[j]!)) continue
      out[i + j] = qadd(out[i + j]!, qmul(a[i]!, b[j]!))
    }
  }
  return qtrim(out)
}

export function qpneg(p: QPoly): QPoly {
  return qpscale(p, qrat(rat(-1)))
}

function qpowInt(base: QPoly, exp: number): QPoly {
  if (exp === 0) return [qrat(rat(1))]
  let out = [qrat(rat(1))]
  for (let i = 0; i < exp; i++) out = qpmul(out, base)
  return out
}

export function toQPoly(e: Expr, v: string): QPoly {
  switch (e.k) {
    case 'n':
      return [qrat(e.v)]
    case 'v':
      if (e.name !== v) throw new AlgebraError('multiVar')
      return [QZERO, qrat(rat(1))]
    case 'neg':
      return qpneg(toQPoly(e.x, v))
    case 'add':
      return qpadd(toQPoly(e.l, v), toQPoly(e.r, v))
    case 'sub':
      return qpsub(toQPoly(e.l, v), toQPoly(e.r, v))
    case 'mul':
      return qpmul(toQPoly(e.l, v), toQPoly(e.r, v))
    case 'div': {
      const d = toQPoly(e.r, v)
      if (qdegree(d) !== 0) throw new AlgebraError('varInDenom')
      const c = qcoeff(d, 0)
      if (qisZero(c)) throw new AlgebraError('parse')
      return qpscale(toQPoly(e.l, v), qdiv(qrat(rat(1)), c))
    }
    case 'pow': {
      const expP = toQPoly(e.e, v)
      if (qdegree(expP) !== 0) throw new AlgebraError('badPower')
      const ex = qasRat(qcoeff(expP, 0))
      if (!ex || ex.d !== 1n || ex.n < 0n || ex.n > 8n) {
        throw new AlgebraError('badPower')
      }
      return qpowInt(toQPoly(e.b, v), Number(ex.n))
    }
    case 'abs': {
      const p = toQPoly(e.x, v)
      if (qdegree(p) !== 0) throw new AlgebraError('radical')
      const c = qcoeff(p, 0)
      const r = qasRat(c)
      if (!r) throw new AlgebraError('radical')
      return [qrat(rabs(r))]
    }
    case 'sqrt': {
      const p = toQPoly(e.x, v)
      if (qdegree(p) !== 0) throw new AlgebraError('radical')
      const c = qcoeff(p, 0)
      const r = qasRat(c)
      if (!r) throw new AlgebraError('radical')
      return [qsqrtRat(r)]
    }
    case 'pi':
    case 'fn':
      throw new AlgebraError('radical')
  }
}

export function divideRoot(p: QPoly, r: Quad): QPoly | null {
  const n = qdegree(p)
  if (n < 1) return null
  const highFirst: Quad[] = []
  let acc = qcoeff(p, n)
  for (let i = n - 1; i >= 0; i--) {
    highFirst.push(acc)
    acc = qadd(qmul(acc, r), qcoeff(p, i))
  }
  if (!qisZero(acc)) return null
  const quot: Quad[] = []
  for (let i = highFirst.length - 1; i >= 0; i--) quot.push(highFirst[i]!)
  return qtrim(quot)
}

export function formatQPoly(p: QPoly, v: string): string {
  const d = qdegree(p)
  const parts: string[] = []
  for (let i = d; i >= 0; i--) {
    const c = qcoeff(p, i)
    if (qisZero(c)) continue
    const first = parts.length === 0
    const atom = i === 0 ? '' : i === 1 ? v : `${v}${superscriptDeg(i)}`
    const mag = formatCoeffAtom(c, atom || null)
    if (first) {
      parts.push(mag)
      continue
    }
    const r = qasRat(c)
    const neg = r ? r.n < 0n : qfloat(c) < 0
    const body = neg ? formatCoeffAtom(qneg(c), atom || null) : mag
    parts.push(neg ? ` − ${body}` : ` + ${body}`)
  }
  return parts.length === 0 ? '0' : parts.join('')
}

function superscriptDeg(i: number): string {
  if (i === 2) return '²'
  if (i === 3) return '³'
  if (i === 4) return '⁴'
  return `^${i}`
}

function formatCoeffAtom(c: Quad, atom: string | null): string {
  if (!atom) return formatQuad(c)
  if (qisRat(c)) {
    const r = c.a
    if (isZero(r)) return '0'
    if (r.n === 1n && r.d === 1n) return atom
    if (r.n === -1n && r.d === 1n) return `−${atom}`
    if (r.d === 1n) return `${formatQuad(c)}${atom}`
    return `(${formatQuad(c)})${atom}`
  }
  return `(${formatQuad(c)})${atom}`
}

export function rootGuesses(field: bigint): Quad[] {
  const rats: Rat[] = [
    ZERO,
    rat(1),
    rat(-1),
    rat(2),
    rat(-2),
    rat(1, 2),
    rat(-1, 2),
    rat(1, 4),
    rat(-1, 4),
    rat(3),
    rat(-3),
    rat(1, 8),
    rat(-1, 8)
  ]
  const out: Quad[] = rats.map(qrat)
  if (field > 1n) {
    for (const k of [1n, 2n, 4n, 8n] as const) {
      out.push(qsqrtRat(rat(field, k * k)))
      out.push(qneg(qsqrtRat(rat(field, k * k))))
    }
  }
  const uniq: Quad[] = []
  for (const g of out) {
    if (!uniq.some((u) => qeq(u, g))) uniq.push(g)
  }
  return uniq
}

export function fieldOfPoly(p: QPoly): bigint {
  for (const c of p) {
    if (!qisRat(c) && c.d > 1n) return c.d
  }
  return 0n
}
